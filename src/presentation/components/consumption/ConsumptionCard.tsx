import React from 'react';
import { ActivityIndicator, Text, TextStyle, View, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Consumption, ConsumptionPeriod } from '../../../domain/consumption/Consumption';
import { formatFlow, formatVolume, PERIOD_LABELS, PERIOD_TITLES } from '../../../domain/consumption/consumptionFormat';
import { formatLastReport } from '../../../domain/devices/deviceStatus';
import { AppError } from '../../../domain/common/AppError';
import { MeasurementUnit } from '../../../domain/places/Place';
import { theme } from '../../styles/theme';
import { Banner } from '../common/Banner';
import { Card } from '../common/Card';
import { SegmentedControl } from '../common/SegmentedControl';
import { ConsumptionChart } from './ConsumptionChart';
import { themed } from '../../styles/themeRuntime';

interface ConsumptionCardProps {
  period: ConsumptionPeriod;
  onPeriodChange: (period: ConsumptionPeriod) => void;
  data: Consumption | null;
  loading: boolean;
  error: AppError | null;
  unit: MeasurementUnit;
}

const PERIODS: ConsumptionPeriod[] = ['DAY', 'WEEK', 'MONTH'];

export const ConsumptionCard: React.FC<ConsumptionCardProps> = ({ period, onPeriodChange, data, loading, error, unit }) => {
  const shown = data && data.period === period ? data : null; // never show last week's bars under "Hoy"
  const flowing = !!shown?.currentFlowLpm && shown.currentFlowLpm >= 0.05;

  return (
    <Card variant="outlined">
      <SegmentedControl
        options={PERIODS.map((p) => ({ value: p, label: PERIOD_LABELS[p] }))}
        value={period}
        onChange={onPeriodChange}
      />

      {!!error && <Banner tone="warning" message={`No pudimos actualizar el consumo. ${error.message}`} />}

      {!shown ? (
        <View style={centerStyle}>
          {loading ? <ActivityIndicator color={theme.colors.primary} /> : <Text style={mutedStyle}>Sin datos</Text>}
        </View>
      ) : (
        <>
          <Text style={captionStyle}>{PERIOD_TITLES[period]}</Text>
          <Text style={totalStyle} accessibilityLabel={`${PERIOD_TITLES[period]}: ${formatVolume(shown.totalLiters, unit)}`}>
            {formatVolume(shown.totalLiters, unit)}
          </Text>

          <View style={flowRowStyle}>
            <View style={[flowBadgeStyle, { backgroundColor: flowing ? theme.colors.infoBg : theme.colors.grayLight }]}>
              <Ionicons name="water" size={14} color={flowing ? theme.colors.info : theme.colors.textMuted} />
              <Text style={[flowTextStyle, { color: flowing ? theme.colors.info : theme.colors.textMuted }]}>
                {flowing ? `Ahora: ${formatFlow(shown.currentFlowLpm)}` : formatFlow(shown.currentFlowLpm)}
              </Text>
            </View>
            <Text style={mutedStyle}>
              {shown.lastReadingAt ? `Última lectura ${formatLastReport(shown.lastReadingAt)}` : 'Aún sin lecturas'}
            </Text>
          </View>

          {shown.hasData ? (
            <ConsumptionChart buckets={shown.buckets} period={period} unit={unit} />
          ) : (
            <View style={emptyStyle}>
              <Ionicons name="bar-chart-outline" size={32} color={theme.colors.grayMedium} />
              <Text style={mutedStyle}>
                Todavía no hay lecturas en este periodo. Cuando pase agua por el medidor, verás el consumo aquí.
              </Text>
            </View>
          )}
        </>
      )}
    </Card>
  );
};

const centerStyle: ViewStyle = { height: 220, alignItems: 'center', justifyContent: 'center' };
const captionStyle: TextStyle = themed(() => ({ ...theme.textStyles.caption, color: theme.colors.textMuted }));
const totalStyle: TextStyle = themed(() => ({ ...theme.textStyles.h1, color: theme.colors.textPrimary, marginBottom: theme.spacing.sm }));
const mutedStyle: TextStyle = themed(() => ({ ...theme.textStyles.caption, color: theme.colors.textMuted, textAlign: 'center' }));
const flowRowStyle: ViewStyle = {
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: theme.spacing.sm,
  flexWrap: 'wrap',
  marginBottom: theme.spacing.lg,
};
const flowBadgeStyle: ViewStyle = {
  flexDirection: 'row',
  alignItems: 'center',
  gap: theme.spacing.xs,
  paddingHorizontal: theme.spacing.md,
  paddingVertical: theme.spacing.xs,
  borderRadius: theme.borderRadius.full,
};
const flowTextStyle: TextStyle = { ...theme.textStyles.caption, fontWeight: '700' };
const emptyStyle: ViewStyle = { height: 160, alignItems: 'center', justifyContent: 'center', gap: theme.spacing.sm };
