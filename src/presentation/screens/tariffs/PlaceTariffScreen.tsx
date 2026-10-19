import React, { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, Text, TextStyle, TouchableOpacity, View, ViewStyle, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import {
  CatalogRates,
  STRATA,
  Tariff,
  formatCatalogDate,
  formatMoney,
  sourceLabel,
  validateManualTariff,
} from '../../../domain/tariffs/Tariff';
import { Banner } from '../../components/common/Banner';
import { PageContainer } from '../../components/common/PageContainer';
import { PageHeader } from '../../components/common/PageHeader';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { Input } from '../../components/common/Input';
import { usePlaceTariffs } from '../../hooks/usePlaceTariffs';
import { MainStackParamList } from '../../navigation/types';
import { theme } from '../../styles/theme';
import { themed } from '../../styles/themeRuntime';
import { useTranslation } from 'react-i18next';
import { formatDate } from '../../../i18n/format';

type Props = NativeStackScreenProps<MainStackParamList, 'PlaceTariff'>;

/**
 * HU-054 / HU-066 / HU-069: how much the water costs in this place. Two ways: use the tariff the city already has for the
 * stratum (preloaded) or type the price of the bill. Both are kept in a history; the app always says which one is in use.
 */
export const PlaceTariffScreen: React.FC<Props> = ({ navigation, route }) => {
  const { t: tr } = useTranslation();
  const { placeId, placeName = tr('dashboard.defaultPlaceName') } = route.params;
  const t = usePlaceTariffs(placeId);

  const [picked, setPicked] = useState<number | null>(null);
  const [price, setPrice] = useState('');
  const [fixedCharge, setFixedCharge] = useState('');
  const [fieldErrors, setFieldErrors] = useState<{ price?: string; fixedCharge?: string }>({});

  const current = t.tariffs?.current ?? null;

  // Start from what is in force: the stratum already chosen, or the price already typed
  useEffect(() => {
    if (!current) return;
    if (current.source === 'CATALOG') setPicked(current.stratum);
    else {
      setPrice(current.unitPricePerM3 !== null ? String(current.unitPricePerM3) : '');
      setFixedCharge(current.fixedMonthlyCharge !== null ? String(current.fixedMonthlyCharge) : '');
    }
  }, [current?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  if (t.loading && !t.tariffs) {
    return (
      <View style={centerStyle}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  if (!t.tariffs || !t.place) {
    return (
      <View style={centerStyle}>
        <Banner tone="error" message={t.error?.message ?? tr('tariff.screen.loadFailed')} />
        <Button label={tr('common.retry')} onPress={() => void t.reload()} />
      </View>
    );
  }

  const currency = t.place.currency;
  const pickedRates = t.catalog?.strata.find((s) => s.stratum === picked)?.rates ?? null;
  const strataAvailable = new Set(t.catalog?.strata.map((s) => s.stratum) ?? []);

  const saveManual = async () => {
    const { errors, value } = validateManualTariff({ price, fixedCharge });
    setFieldErrors(errors);
    if (value) await t.saveManual(value);
  };

  return (
    <PageContainer medium gap={theme.spacing.lg}>
      <PageHeader
        back={{ label: tr('tariff.screen.back'), onPress: () => navigation.goBack() }}
        caption={placeName}
        title={tr('tariff.screen.title')}
        subtitle={tr('tariff.screen.intro')}
      />
      {Platform.OS !== 'web' && (
        <>
          <Text style={titleStyle}>{tr('tariff.screen.mobileTitle', { name: placeName })}</Text>
          <Text style={mutedStyle}>{tr('tariff.screen.intro')}</Text>
        </>
      )}

      {!!t.notice && <Banner tone="success" message={t.notice} onClose={t.dismissNotice} />}
      {!!t.error && <Banner tone="error" message={t.error.message} onClose={t.dismissError} />}

      <Card variant="outlined" style={cardStyle}>
        <Text style={sectionStyle}>{tr('tariff.screen.inUse')}</Text>
        {current ? <CurrentTariff tariff={current} /> : (
          <View style={emptyStyle}>
            <Ionicons name="cash-outline" size={32} color={theme.colors.textMuted} />
            <Text style={mutedStyle}>{tr('tariff.screen.none')}</Text>
          </View>
        )}
      </Card>

      <View style={optionsStyle}>
        <Card variant="outlined" style={[cardStyle, optionStyle]}>
          <Text style={sectionStyle}>{tr('tariff.screen.useCity')}</Text>
          {t.catalog?.available ? (
            <>
              <Text style={mutedStyle}>
                {tr('tariff.screen.cityIntro', { city: t.catalog.cityName })}
              </Text>
              <View style={strataStyle} accessibilityRole="radiogroup" accessibilityLabel={tr('tariff.screen.stratumGroup')}>
                {STRATA.map((stratum) => {
                  const enabled = strataAvailable.has(stratum);
                  const selected = picked === stratum;
                  return (
                    <TouchableOpacity
                      key={stratum}
                      disabled={!enabled}
                      onPress={() => setPicked(stratum)}
                      style={[chipStyle, selected && chipSelectedStyle, !enabled && chipDisabledStyle]}
                      accessibilityRole="radio"
                      accessibilityState={{ selected, disabled: !enabled }}
                      accessibilityLabel={tr('tariff.screen.stratumN', { n: stratum })}
                    >
                      <Text style={[chipTextStyle, selected && chipTextSelectedStyle]}>{stratum}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {pickedRates && <RatesTable rates={pickedRates} currency={currency} />}

              <Button
                label={current?.source === 'CATALOG' && current.stratum === picked ? tr('tariff.screen.alreadyUsing') : tr('tariff.screen.useStratum')}
                onPress={() => picked !== null && void t.chooseStratum(picked)}
                disabled={picked === null || (current?.source === 'CATALOG' && current.stratum === picked)}
                loading={t.saving}
                size="medium"
              />
            </>
          ) : (
            <Text style={mutedStyle}>
              {tr('tariff.screen.cityNoCatalog', { city: t.catalog?.cityName ?? tr('tariff.screen.yourCity') })}
            </Text>
          )}
        </Card>

        <Card variant="outlined" style={[cardStyle, optionStyle]}>
          <Text style={sectionStyle}>{tr('tariff.screen.typeMine')}</Text>
          <Text style={mutedStyle}>{tr('tariff.screen.typeIntro')}</Text>
          <Input
            label={tr('tariff.screen.priceLabel', { currency })}
            placeholder={tr('tariff.screen.pricePlaceholder')}
            value={price}
            onChangeText={(text) => {
              setPrice(text);
              if (fieldErrors.price) setFieldErrors((e) => ({ ...e, price: undefined }));
            }}
            error={fieldErrors.price}
            keyboardType="numeric"
          />
          <Input
            label={tr('tariff.screen.fixedLabel')}
            placeholder={tr('tariff.screen.fixedPlaceholder')}
            value={fixedCharge}
            onChangeText={(text) => {
              setFixedCharge(text);
              if (fieldErrors.fixedCharge) setFieldErrors((e) => ({ ...e, fixedCharge: undefined }));
            }}
            error={fieldErrors.fixedCharge}
            keyboardType="numeric"
            hint={tr('tariff.screen.fixedHint')}
          />
          <Button label={tr('tariff.screen.saveMine')} onPress={() => void saveManual()} loading={t.saving} size="medium" />
          {!!t.catalog?.available && current?.source === 'MANUAL' && (
            <Text style={mutedStyle}>{tr('tariff.screen.replaceNote')}</Text>
          )}
        </Card>
      </View>

      {t.tariffs.history.length > 1 && (
        <Card variant="outlined" style={cardStyle}>
          <Text style={sectionStyle}>{tr('tariff.screen.history')}</Text>
          <Text style={mutedStyle}>{tr('tariff.screen.historyIntro')}</Text>
          {t.tariffs.history.map((tariff, index) => (
            <View key={tariff.id} style={historyRowStyle}>
              <View style={{ flex: 1 }}>
                <Text style={historyTitleStyle}>
                  {tariff.source === 'MANUAL'
                    ? tr('tariff.screen.perM3', { price: formatMoney(tariff.unitPricePerM3 ?? 0, currency) })
                    : tr('tariff.screen.historyStratum', { n: tariff.stratum })}
                  {index === 0 ? tr('tariff.screen.inUseSuffix') : ''}
                </Text>
                <Text style={mutedStyle}>
                  {tr('tariff.screen.since', { source: sourceLabel(tariff.source, tariff.stratum), date: formatDate(tariff.validFrom) })}
                </Text>
              </View>
            </View>
          ))}
        </Card>
      )}
    </PageContainer>
  );
};

const CurrentTariff: React.FC<{ tariff: Tariff }> = ({ tariff }) => {
  const { t } = useTranslation();
  const rates = tariff.catalog;
  return (
    <View style={{ gap: theme.spacing.sm }}>
      <View style={sourceBadgeStyle}>
        <Ionicons name={tariff.source === 'CATALOG' ? 'location-outline' : 'create-outline'} size={16} color={theme.colors.textPrimary} />
        <Text style={sourceBadgeTextStyle}>{sourceLabel(tariff.source, tariff.stratum)}</Text>
      </View>
      {tariff.source === 'MANUAL' ? (
        <>
          <Text style={bigStyle}>{t('tariff.screen.perM3', { price: formatMoney(tariff.unitPricePerM3 ?? 0, tariff.currency) })}</Text>
          <Text style={mutedStyle}>
            {tariff.fixedMonthlyCharge ? t('tariff.screen.fixedMonthly', { amount: formatMoney(tariff.fixedMonthlyCharge, tariff.currency) }) : t('tariff.screen.noFixed')}
          </Text>
        </>
      ) : (
        rates && <RatesTable rates={rates} currency={tariff.currency} />
      )}
    </View>
  );
};

/** Prices by range of the month (HU-066: basic, complementary, luxury) and the date of the last update. */
const RatesTable: React.FC<{ rates: CatalogRates; currency: 'COP' | 'USD' }> = ({ rates, currency }) => {
  const { t } = useTranslation();
  const perM3 = (price: number) => t('tariff.screen.perM3', { price: formatMoney(price, currency) });
  return (
    <View style={tableStyle}>
      <RateRow label={t('tariff.screen.basic', { limit: rates.basicLimitM3 })} value={perM3(rates.basicPrice)} />
      <RateRow label={t('tariff.screen.complementary', { limit: rates.complementaryLimitM3 })} value={perM3(rates.complementaryPrice)} />
      <RateRow label={t('tariff.screen.luxury', { limit: rates.complementaryLimitM3 })} value={perM3(rates.luxuryPrice)} />
      <RateRow label={t('tariff.screen.fixedCharge')} value={formatMoney(rates.fixedCharge, currency)} />
      <Text style={noteStyle}>{t('tariff.screen.updatedOn', { date: formatCatalogDate(rates.updatedAt), source: rates.source })}</Text>
    </View>
  );
};

const RateRow: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <View style={rateRowStyle}>
    <Text style={rateLabelStyle}>{label}</Text>
    <Text style={rateValueStyle}>{value}</Text>
  </View>
);

const screenStyle: ViewStyle = themed(() => ({ flex: 1, backgroundColor: theme.colors.background }));
const contentStyle: ViewStyle = { padding: theme.spacing.lg, paddingBottom: theme.spacing.huge, gap: theme.spacing.lg };
const centerStyle: ViewStyle = themed(() => ({ flex: 1, alignItems: 'center', justifyContent: 'center', gap: theme.spacing.md, padding: theme.spacing.xl, backgroundColor: theme.colors.background }));
const titleStyle: TextStyle = themed(() => ({ ...theme.textStyles.h2, color: theme.colors.textPrimary }));
const mutedStyle: TextStyle = themed(() => ({ ...theme.textStyles.caption, color: theme.colors.textMuted }));
const sectionStyle: TextStyle = themed(() => ({ ...theme.textStyles.h3, color: theme.colors.textPrimary }));
const cardStyle: ViewStyle = { gap: theme.spacing.md };
const optionsStyle: ViewStyle = { flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.lg, alignItems: 'flex-start' };
const optionStyle: ViewStyle = { flexGrow: 1, flexBasis: 320 };
const emptyStyle: ViewStyle = { alignItems: 'center', gap: theme.spacing.sm, paddingVertical: theme.spacing.md };
const strataStyle: ViewStyle = { flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.sm };
const chipStyle: ViewStyle = themed(() => ({
  width: 48,
  height: 48,
  borderRadius: theme.borderRadius.small,
  borderWidth: 1.5,
  borderColor: theme.colors.primary,
  backgroundColor: theme.colors.surface,
  alignItems: 'center',
  justifyContent: 'center',
}));
const chipSelectedStyle: ViewStyle = themed(() => ({ backgroundColor: theme.colors.primary }));
const chipDisabledStyle: ViewStyle = themed(() => ({ borderColor: theme.colors.border, backgroundColor: theme.colors.grayLight }));
const chipTextStyle: TextStyle = themed(() => ({ ...theme.textStyles.h3, color: theme.colors.primary }));
const chipTextSelectedStyle: TextStyle = themed(() => ({ color: theme.colors.textOnPrimary }));
const tableStyle: ViewStyle = { gap: theme.spacing.xs };
const rateRowStyle: ViewStyle = themed(() => ({
  flexDirection: 'row',
  justifyContent: 'space-between',
  gap: theme.spacing.md,
  paddingVertical: theme.spacing.xs,
  borderTopWidth: 1,
  borderTopColor: theme.colors.border,
}));
const rateLabelStyle: TextStyle = themed(() => ({ ...theme.textStyles.caption, color: theme.colors.textSecondary, flex: 1 }));
const rateValueStyle: TextStyle = themed(() => ({ ...theme.textStyles.caption, fontWeight: '800', color: theme.colors.textPrimary }));
const noteStyle: TextStyle = themed(() => ({ ...theme.textStyles.caption, color: theme.colors.textMuted, marginTop: theme.spacing.xs }));
const sourceBadgeStyle: ViewStyle = themed(() => ({
  flexDirection: 'row',
  alignItems: 'center',
  alignSelf: 'flex-start',
  gap: theme.spacing.xs,
  paddingHorizontal: theme.spacing.md,
  paddingVertical: 4,
  borderRadius: theme.borderRadius.full,
  backgroundColor: theme.colors.infoBg,
  borderWidth: 1,
  borderColor: theme.colors.info,
}));
const sourceBadgeTextStyle: TextStyle = themed(() => ({ ...theme.textStyles.caption, fontWeight: '800', color: theme.colors.textPrimary }));
const bigStyle: TextStyle = themed(() => ({ ...theme.textStyles.h2, color: theme.colors.textPrimary }));
const historyRowStyle: ViewStyle = themed(() => ({
  flexDirection: 'row',
  paddingVertical: theme.spacing.sm,
  borderTopWidth: 1,
  borderTopColor: theme.colors.border,
}));
const historyTitleStyle: TextStyle = themed(() => ({ ...theme.textStyles.caption, fontWeight: '800', color: theme.colors.textPrimary }));
