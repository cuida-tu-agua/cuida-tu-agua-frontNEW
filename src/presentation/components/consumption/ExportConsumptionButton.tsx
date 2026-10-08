import React, { useState } from 'react';
import { Text, TextStyle, View, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Consumption, ConsumptionPeriod } from '../../../domain/consumption/Consumption';
import { buildConsumptionCsv, consumptionCsvFileName } from '../../../domain/consumption/consumptionCsv';
import { FileExporter } from '../../../domain/files/FileExporter';
import { MeasurementUnit } from '../../../domain/places/Place';
import { csvFileExporter } from '../../../infrastructure/files/CsvFileExporter';
import { toAppError } from '../../../infrastructure/http/httpError';
import { theme } from '../../styles/theme';
import { Banner } from '../common/Banner';
import { Button } from '../common/Button';

interface ExportConsumptionButtonProps {
  data: Consumption | null;
  period: ConsumptionPeriod;
  unit: MeasurementUnit;
  placeName: string;
  /** Where the file goes: a download on the web, the share sheet on a phone. Replaced by a fake in tests. */
  exporter?: FileExporter;
}

/** HU-038: exports the consumption of the period on screen (Hoy, Semana or Mes) as a CSV for Excel. */
export const ExportConsumptionButton: React.FC<ExportConsumptionButtonProps> = ({
  data,
  period,
  unit,
  placeName,
  exporter = csvFileExporter,
}) => {
  const [exporting, setExporting] = useState(false);
  const [doneFile, setDoneFile] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Never export last week's data under "Hoy" while the new period is still loading
  const shown = data && data.period === period ? data : null;
  const canExport = !!shown && shown.hasData && shown.buckets.length > 0;

  const handleExport = async () => {
    if (!shown || !canExport) return;
    setExporting(true);
    setDoneFile(null);
    setError(null);
    try {
      const fileName = consumptionCsvFileName(placeName, period);
      await exporter.exportCsv(fileName, buildConsumptionCsv(shown, unit));
      setDoneFile(fileName);
    } catch (e) {
      setError(`No pudimos exportar el consumo. ${toAppError(e).message}`);
    } finally {
      setExporting(false);
    }
  };

  return (
    <View style={containerStyle}>
      {!!error && <Banner tone="error" message={error} onClose={() => setError(null)} />}
      {!!doneFile && <Banner tone="success" message={`Archivo listo: ${doneFile}`} onClose={() => setDoneFile(null)} />}

      <Button
        label="Exportar a Excel (CSV)"
        variant="secondary"
        onPress={handleExport}
        disabled={!canExport}
        loading={exporting}
        icon={<Ionicons name="download-outline" size={18} color={theme.colors.primary} />}
      />
      {!canExport && <Text style={mutedStyle}>{shown ? 'Aún no hay datos para exportar.' : 'Cargando el consumo...'}</Text>}
    </View>
  );
};

const containerStyle: ViewStyle = { gap: theme.spacing.sm };
const mutedStyle: TextStyle = { ...theme.textStyles.caption, color: theme.colors.textMuted, textAlign: 'center' };
