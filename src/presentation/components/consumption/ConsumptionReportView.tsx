import React from 'react';
import { Text, TextStyle, View, ViewStyle } from 'react-native';
import { Consumption } from '../../../domain/consumption/Consumption';
import { formatVolume, PERIOD_TITLES } from '../../../domain/consumption/consumptionFormat';
import { buildConsumptionReport } from '../../../domain/consumption/consumptionReport';
import { MeasurementUnit } from '../../../domain/places/Place';
import { theme } from '../../styles/theme';
import { Banner } from '../common/Banner';
import { Card } from '../common/Card';
import { ConsumptionChart } from './ConsumptionChart';

interface Props {
  data: Consumption;
  placeName: string;
  unit: MeasurementUnit;
  /** Moment of the report; fixed in tests. */
  now?: Date;
}

const formatGenerated = (iso: string) => new Date(iso).toLocaleString('es-CO', { dateStyle: 'long', timeStyle: 'short' });

const peakLabel = (period: Consumption['period']) => (period === 'DAY' ? 'Hora de mayor consumo' : 'Día de mayor consumo');

const peakText = (data: Consumption, peakStart: string, liters: number, unit: MeasurementUnit): string => {
  const date = new Date(peakStart);
  const when =
    data.period === 'DAY'
      ? `${String(date.getHours()).padStart(2, '0')}:00`
      : date.toLocaleDateString('es-CO', { weekday: 'long', day: 'numeric', month: 'short' });
  return `${when} · ${formatVolume(liters, unit)}`;
};

/** HU-057: place, period, generation date, total, daily average, chart and data-gap warnings. */
export const ConsumptionReportView: React.FC<Props> = ({ data, placeName, unit, now }) => {
  const report = buildConsumptionReport(data, placeName, now);

  return (
    <Card variant="outlined">
      <Text style={titleStyle}>Reporte de consumo</Text>
      <Text style={placeStyle}>{report.placeName}</Text>
      <Text style={mutedStyle}>{report.rangeText}</Text>
      <Text style={mutedStyle}>Generado el {formatGenerated(report.generatedAt)}</Text>

      {report.warnings.map((warning) => (
        <Banner key={warning} tone="warning" message={warning} />
      ))}

      {report.hasData && (
        <>
          <View style={statsStyle}>
            <View style={statStyle}>
              <Text style={mutedStyle}>{PERIOD_TITLES[report.period]}</Text>
              <Text style={valueStyle}>{formatVolume(report.totalLiters, unit)}</Text>
            </View>
            <View style={statStyle}>
              <Text style={mutedStyle}>Promedio diario</Text>
              <Text style={valueStyle}>{formatVolume(report.dailyAverageLiters, unit)}</Text>
            </View>
          </View>

          {report.peak && (
            <Text style={mutedStyle}>
              {peakLabel(report.period)}: {peakText(data, report.peak.start, report.peak.liters, unit)}
            </Text>
          )}

          <ConsumptionChart buckets={data.buckets} period={data.period} unit={unit} />

          <Text style={noteStyle}>
            La comparación con tu meta y con la factura aparecerá aquí cuando esos datos estén disponibles.
          </Text>
        </>
      )}
    </Card>
  );
};

const titleStyle: TextStyle = { ...theme.textStyles.h2, color: theme.colors.textPrimary };
const placeStyle: TextStyle = { ...theme.textStyles.button, color: theme.colors.textPrimary, marginTop: theme.spacing.xs };
const mutedStyle: TextStyle = { ...theme.textStyles.caption, color: theme.colors.textMuted };
const noteStyle: TextStyle = { ...theme.textStyles.caption, color: theme.colors.textMuted, marginTop: theme.spacing.md };
const statsStyle: ViewStyle = { flexDirection: 'row', gap: theme.spacing.lg, marginVertical: theme.spacing.md };
const statStyle: ViewStyle = { flex: 1 };
const valueStyle: TextStyle = { ...theme.textStyles.h1, color: theme.colors.primary };
