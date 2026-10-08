import React, { useState } from 'react';
import { ActivityIndicator, ScrollView, Text, TextStyle, View, ViewStyle } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ConsumptionPeriod } from '../../../domain/consumption/Consumption';
import { PERIOD_LABELS } from '../../../domain/consumption/consumptionFormat';
import { Banner } from '../../components/common/Banner';
import { SegmentedControl } from '../../components/common/SegmentedControl';
import { ExportReportPdfButton } from '../../components/consumption/ExportReportPdfButton';
import { ConsumptionReportView } from '../../components/consumption/ConsumptionReportView';
import { useConsumption } from '../../hooks/useConsumption';
import { MainStackParamList } from '../../navigation/types';
import { theme } from '../../styles/theme';

type Props = NativeStackScreenProps<MainStackParamList, 'ConsumptionReport'>;

const PERIODS: ConsumptionPeriod[] = ['DAY', 'WEEK', 'MONTH'];

/** HU-057: report of the place for Hoy, Semana or Mes. */
export const ConsumptionReportScreen: React.FC<Props> = ({ route }) => {
  const { placeId, placeName, unit } = route.params;
  const [period, setPeriod] = useState<ConsumptionPeriod>('WEEK');
  const consumption = useConsumption(placeId, period);
  const shown = consumption.data && consumption.data.period === period ? consumption.data : null;

  return (
    <ScrollView style={screenStyle} contentContainerStyle={contentStyle}>
      <SegmentedControl
        label="Periodo del reporte"
        options={PERIODS.map((p) => ({ value: p, label: PERIOD_LABELS[p] }))}
        value={period}
        onChange={setPeriod}
      />

      {!!consumption.error && <Banner tone="error" message={`No pudimos generar el reporte. ${consumption.error.message}`} />}

      {shown ? (
        <>
          <ConsumptionReportView data={shown} placeName={placeName} unit={unit ?? 'LITERS'} />
          <ExportReportPdfButton data={shown} placeName={placeName} unit={unit ?? 'LITERS'} />
        </>
      ) : (
        <View style={centerStyle}>
          {consumption.loading ? <ActivityIndicator color={theme.colors.primary} /> : <Text style={mutedStyle}>Sin datos</Text>}
        </View>
      )}
    </ScrollView>
  );
};

const screenStyle: ViewStyle = { flex: 1, backgroundColor: theme.colors.background };
const contentStyle: ViewStyle = { padding: theme.spacing.lg, gap: theme.spacing.sm };
const centerStyle: ViewStyle = { height: 220, alignItems: 'center', justifyContent: 'center' };
const mutedStyle: TextStyle = { ...theme.textStyles.caption, color: theme.colors.textMuted };
