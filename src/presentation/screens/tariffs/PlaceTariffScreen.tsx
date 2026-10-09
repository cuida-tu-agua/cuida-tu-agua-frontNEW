import React, { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, Text, TextStyle, TouchableOpacity, View, ViewStyle } from 'react-native';
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
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { Input } from '../../components/common/Input';
import { usePlaceTariffs } from '../../hooks/usePlaceTariffs';
import { MainStackParamList } from '../../navigation/types';
import { theme } from '../../styles/theme';
import { themed } from '../../styles/themeRuntime';

type Props = NativeStackScreenProps<MainStackParamList, 'PlaceTariff'>;

/**
 * HU-054 / HU-066 / HU-069: how much the water costs in this place. Two ways: use the tariff the city already has for the
 * stratum (preloaded) or type the price of the bill. Both are kept in a history; the app always says which one is in use.
 */
export const PlaceTariffScreen: React.FC<Props> = ({ route }) => {
  const { placeId, placeName } = route.params;
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
        <Banner tone="error" message={t.error?.message ?? 'No pudimos cargar la tarifa.'} />
        <Button label="Reintentar" onPress={() => void t.reload()} />
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
    <ScrollView style={screenStyle} contentContainerStyle={contentStyle} keyboardShouldPersistTaps="handled">
      <Text style={titleStyle}>Tarifa de {placeName}</Text>
      <Text style={mutedStyle}>El agua se cobra por metro cúbico (m³). Con la tarifa calculamos cuánto dinero llevas gastado.</Text>

      {!!t.notice && <Banner tone="success" message={t.notice} onClose={t.dismissNotice} />}
      {!!t.error && <Banner tone="error" message={t.error.message} onClose={t.dismissError} />}

      <Card variant="outlined" style={cardStyle}>
        <Text style={sectionStyle}>Tarifa en uso</Text>
        {current ? <CurrentTariff tariff={current} /> : (
          <View style={emptyStyle}>
            <Ionicons name="cash-outline" size={32} color={theme.colors.textMuted} />
            <Text style={mutedStyle}>Aún no hay tarifa. Elige una de las dos opciones de abajo.</Text>
          </View>
        )}
      </Card>

      <View style={optionsStyle}>
        <Card variant="outlined" style={[cardStyle, optionStyle]}>
          <Text style={sectionStyle}>Usar la tarifa de mi ciudad</Text>
          {t.catalog?.available ? (
            <>
              <Text style={mutedStyle}>
                {t.catalog.cityName}: elige el estrato que dice tu recibo (de 1 a 6). Los estratos 1, 2 y 3 reciben subsidio y el 5 y el 6 pagan contribución.
              </Text>
              <View style={strataStyle} accessibilityRole="radiogroup" accessibilityLabel="Estrato">
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
                      accessibilityLabel={`Estrato ${stratum}`}
                    >
                      <Text style={[chipTextStyle, selected && chipTextSelectedStyle]}>{stratum}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {pickedRates && <RatesTable rates={pickedRates} currency={currency} />}

              <Button
                label={current?.source === 'CATALOG' && current.stratum === picked ? 'Ya usas este estrato' : 'Usar este estrato'}
                onPress={() => picked !== null && void t.chooseStratum(picked)}
                disabled={picked === null || (current?.source === 'CATALOG' && current.stratum === picked)}
                loading={t.saving}
                size="medium"
              />
            </>
          ) : (
            <Text style={mutedStyle}>
              {t.catalog?.cityName ?? 'Tu ciudad'} todavía no tiene tarifas precargadas. Escribe la de tu recibo aquí al lado.
            </Text>
          )}
        </Card>

        <Card variant="outlined" style={[cardStyle, optionStyle]}>
          <Text style={sectionStyle}>Escribir mi tarifa</Text>
          <Text style={mutedStyle}>Búscala en tu recibo de acueducto: el valor de cada metro cúbico y, si aparece, el cargo fijo mensual.</Text>
          <Input
            label={`Valor por metro cúbico (${currency})`}
            placeholder="Ej.: 5.234"
            value={price}
            onChangeText={(text) => {
              setPrice(text);
              if (fieldErrors.price) setFieldErrors((e) => ({ ...e, price: undefined }));
            }}
            error={fieldErrors.price}
            keyboardType="numeric"
          />
          <Input
            label="Cargo fijo mensual (opcional)"
            placeholder="Ej.: 12.000"
            value={fixedCharge}
            onChangeText={(text) => {
              setFixedCharge(text);
              if (fieldErrors.fixedCharge) setFieldErrors((e) => ({ ...e, fixedCharge: undefined }));
            }}
            error={fieldErrors.fixedCharge}
            keyboardType="numeric"
            hint="Si tu recibo no lo trae, déjalo vacío."
          />
          <Button label="Guardar mi tarifa" onPress={() => void saveManual()} loading={t.saving} size="medium" />
          {!!t.catalog?.available && current?.source === 'MANUAL' && (
            <Text style={mutedStyle}>Guardar tu tarifa reemplaza a la precargada. Puedes volver a la de tu ciudad cuando quieras.</Text>
          )}
        </Card>
      </View>

      {t.tariffs.history.length > 1 && (
        <Card variant="outlined" style={cardStyle}>
          <Text style={sectionStyle}>Historial de tarifas</Text>
          <Text style={mutedStyle}>Las tarifas anteriores se conservan: cambiar la tarifa no altera lo que ya se calculó.</Text>
          {t.tariffs.history.map((tariff, index) => (
            <View key={tariff.id} style={historyRowStyle}>
              <View style={{ flex: 1 }}>
                <Text style={historyTitleStyle}>
                  {tariff.source === 'MANUAL'
                    ? `${formatMoney(tariff.unitPricePerM3 ?? 0, currency)} por m³`
                    : `Estrato ${tariff.stratum} de tu ciudad`}
                  {index === 0 ? '  ·  en uso' : ''}
                </Text>
                <Text style={mutedStyle}>
                  {sourceLabel(tariff.source, tariff.stratum)} · desde {new Date(tariff.validFrom).toLocaleDateString('es-CO')}
                </Text>
              </View>
            </View>
          ))}
        </Card>
      )}
    </ScrollView>
  );
};

const CurrentTariff: React.FC<{ tariff: Tariff }> = ({ tariff }) => {
  const rates = tariff.catalog;
  return (
    <View style={{ gap: theme.spacing.sm }}>
      <View style={sourceBadgeStyle}>
        <Ionicons name={tariff.source === 'CATALOG' ? 'location-outline' : 'create-outline'} size={16} color={theme.colors.textPrimary} />
        <Text style={sourceBadgeTextStyle}>{sourceLabel(tariff.source, tariff.stratum)}</Text>
      </View>
      {tariff.source === 'MANUAL' ? (
        <>
          <Text style={bigStyle}>{formatMoney(tariff.unitPricePerM3 ?? 0, tariff.currency)} por m³</Text>
          <Text style={mutedStyle}>
            {tariff.fixedMonthlyCharge ? `Cargo fijo mensual: ${formatMoney(tariff.fixedMonthlyCharge, tariff.currency)}` : 'Sin cargo fijo mensual.'}
          </Text>
        </>
      ) : (
        rates && <RatesTable rates={rates} currency={tariff.currency} />
      )}
    </View>
  );
};

/** Prices by range of the month (HU-066: basic, complementary, luxury) and the date of the last update. */
const RatesTable: React.FC<{ rates: CatalogRates; currency: 'COP' | 'USD' }> = ({ rates, currency }) => (
  <View style={tableStyle}>
    <RateRow label={`Básico · hasta ${rates.basicLimitM3} m³`} value={`${formatMoney(rates.basicPrice, currency)} por m³`} />
    <RateRow label={`Complementario · hasta ${rates.complementaryLimitM3} m³`} value={`${formatMoney(rates.complementaryPrice, currency)} por m³`} />
    <RateRow label={`Suntuario · más de ${rates.complementaryLimitM3} m³`} value={`${formatMoney(rates.luxuryPrice, currency)} por m³`} />
    <RateRow label="Cargo fijo mensual" value={formatMoney(rates.fixedCharge, currency)} />
    <Text style={noteStyle}>Actualizada el {formatCatalogDate(rates.updatedAt)} · {rates.source}</Text>
  </View>
);

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
