import React from 'react';
import { ActivityIndicator, Text, TextStyle, View, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppError } from '../../../domain/common/AppError';
import { ConsumptionPeriod } from '../../../domain/consumption/Consumption';
import { PERIOD_TITLES } from '../../../domain/consumption/consumptionFormat';
import { CostEstimate, formatCatalogDate, formatMoney, sourceLabel } from '../../../domain/tariffs/Tariff';
import { theme } from '../../styles/theme';
import { themed } from '../../styles/themeRuntime';
import { Banner } from '../common/Banner';
import { Button } from '../common/Button';
import { Card } from '../common/Card';
import { useTranslation } from 'react-i18next';
import { localeTag } from '../../../i18n/format';

interface CostCardProps {
  period: ConsumptionPeriod;
  cost: CostEstimate | null;
  loading: boolean;
  error: AppError | null;
  /** Opens the screen where the tariff is chosen or typed. */
  onConfigure: () => void;
}

/**
 * HU-056 / HU-069: the water in money. It always says it is an estimate and where the tariff comes from. Without a tariff it
 * does NOT show a zero: it invites the user to set one.
 */
export const CostCard: React.FC<CostCardProps> = ({ period, cost, loading, error, onConfigure }) => {
  const { t } = useTranslation();
  const shown = cost && cost.period === period ? cost : null; // never show last week's money under "Hoy"

  return (
    <Card variant="outlined" style={cardStyle}>
      <View style={headerStyle}>
        <View style={iconStyle}>
          <Ionicons name="cash-outline" size={22} color={theme.colors.primary} />
        </View>
        <Text style={titleStyle}>{t('cost.title')}</Text>
        <View style={estimateStyle}>
          <Ionicons name="calculator-outline" size={14} color={theme.colors.textPrimary} />
          <Text style={estimateTextStyle}>{t('cost.estimate')}</Text>
        </View>
      </View>

      {!!error && <Banner tone="warning" message={t('cost.failed', { reason: error.message })} />}

      {!shown ? (
        <View style={centerStyle}>{loading ? <ActivityIndicator color={theme.colors.primary} /> : <Text style={mutedStyle}>{t('consumption.noData')}</Text>}</View>
      ) : !shown.hasTariff ? (
        <View style={inviteStyle}>
          <Text style={inviteTitleStyle}>{t('cost.noTariffTitle')}</Text>
          <Text style={mutedStyle}>
            {shown.catalogAvailable
              ? t('cost.inviteCatalog')
              : t('cost.inviteManual')}
          </Text>
          <Button label={t('cost.configure')} onPress={onConfigure} size="medium" />
        </View>
      ) : (
        <>
          <Text style={captionStyle}>{PERIOD_TITLES[period]}</Text>
          <Text style={totalStyle} accessibilityLabel={t('cost.estimatedA11y', { amount: formatMoney(shown.total ?? 0, shown.currency) })}>
            {formatMoney(shown.total ?? 0, shown.currency)}
          </Text>

          {shown.tiers
            .filter((tier) => tier.cubicMeters > 0)
            .map((tier) => (
              <View key={tier.name} style={lineStyle}>
                <Text style={lineLabelStyle}>
                  {t('cost.tierLine', {
                    name: tier.name,
                    m3: tier.cubicMeters.toLocaleString(localeTag(), { maximumFractionDigits: 2 }),
                    price: formatMoney(tier.pricePerM3, shown.currency),
                  })}
                </Text>
                <Text style={lineValueStyle}>{formatMoney(tier.cost, shown.currency)}</Text>
              </View>
            ))}
          {!!shown.fixedCharge && shown.fixedCharge > 0 && (
            <View style={lineStyle}>
              <Text style={lineLabelStyle}>{t('cost.fixedMonth')}</Text>
              <Text style={lineValueStyle}>{formatMoney(shown.fixedCharge, shown.currency)}</Text>
            </View>
          )}

          {shown.tariff && (
            <View style={sourceStyle} accessibilityLabel={t('cost.sourceA11y')}>
              <Ionicons name={shown.tariff.source === 'CATALOG' ? 'location-outline' : 'create-outline'} size={16} color={theme.colors.textSecondary} />
              <Text style={sourceTextStyle}>
                {sourceLabel(shown.tariff.source, shown.tariff.stratum)}
                {shown.tariff.catalogUpdatedAt ? t('cost.updatedOn', { date: formatCatalogDate(shown.tariff.catalogUpdatedAt) }) : ''}
              </Text>
            </View>
          )}
          <Text style={disclaimerStyle}>{shown.disclaimer}</Text>
          <Button label={t('cost.change')} onPress={onConfigure} variant="secondary" size="small" style={{ alignSelf: 'flex-start' }} />
        </>
      )}
    </Card>
  );
};

const cardStyle: ViewStyle = { gap: theme.spacing.sm };
const headerStyle: ViewStyle = { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.md };
const iconStyle: ViewStyle = themed(() => ({
  width: 40,
  height: 40,
  borderRadius: 20,
  backgroundColor: theme.colors.infoBg,
  alignItems: 'center',
  justifyContent: 'center',
}));
const titleStyle: TextStyle = themed(() => ({ ...theme.textStyles.h3, color: theme.colors.textPrimary, flex: 1 }));
const estimateStyle: ViewStyle = themed(() => ({
  flexDirection: 'row',
  alignItems: 'center',
  gap: 4,
  paddingHorizontal: theme.spacing.sm,
  paddingVertical: 4,
  borderRadius: theme.borderRadius.full,
  borderWidth: 1,
  borderColor: theme.colors.warning,
  backgroundColor: theme.colors.warningBg,
}));
const estimateTextStyle: TextStyle = themed(() => ({ ...theme.textStyles.label, color: theme.colors.textPrimary }));
const centerStyle: ViewStyle = { alignItems: 'center', paddingVertical: theme.spacing.xl };
const mutedStyle: TextStyle = themed(() => ({ ...theme.textStyles.caption, color: theme.colors.textMuted }));
const inviteStyle: ViewStyle = { gap: theme.spacing.md, paddingVertical: theme.spacing.sm };
const inviteTitleStyle: TextStyle = themed(() => ({ ...theme.textStyles.h3, color: theme.colors.textPrimary }));
const captionStyle: TextStyle = themed(() => ({ ...theme.textStyles.label, color: theme.colors.textMuted, textTransform: 'uppercase' }));
const totalStyle: TextStyle = themed(() => ({ ...theme.textStyles.h1, color: theme.colors.textPrimary }));
const lineStyle: ViewStyle = themed(() => ({
  flexDirection: 'row',
  justifyContent: 'space-between',
  gap: theme.spacing.md,
  paddingVertical: theme.spacing.xs,
  borderTopWidth: 1,
  borderTopColor: theme.colors.border,
}));
const lineLabelStyle: TextStyle = themed(() => ({ ...theme.textStyles.caption, color: theme.colors.textSecondary, flex: 1 }));
const lineValueStyle: TextStyle = themed(() => ({ ...theme.textStyles.caption, fontWeight: '800', color: theme.colors.textPrimary }));
const sourceStyle: ViewStyle = { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm, marginTop: theme.spacing.sm };
const sourceTextStyle: TextStyle = themed(() => ({ ...theme.textStyles.caption, color: theme.colors.textSecondary, flex: 1 }));
const disclaimerStyle: TextStyle = themed(() => ({ ...theme.textStyles.caption, color: theme.colors.textMuted, fontStyle: 'italic' }));
