import React, { useState } from 'react';
import { Text, TextStyle, View, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Consumption } from '../../../domain/consumption/Consumption';
import { buildConsumptionReport } from '../../../domain/consumption/consumptionReport';
import { buildReportHtml, reportPdfFileName } from '../../../domain/consumption/consumptionReportPdf';
import { PdfExporter } from '../../../domain/files/PdfExporter';
import { MeasurementUnit } from '../../../domain/places/Place';
import { pdfFileExporter } from '../../../infrastructure/files/PdfFileExporter';
import { toAppError } from '../../../infrastructure/http/httpError';
import { theme } from '../../styles/theme';
import { Banner } from '../common/Banner';
import { Button } from '../common/Button';

interface Props {
  data: Consumption | null;
  placeName: string;
  unit: MeasurementUnit;
  /** Where the PDF goes. Replaced by a fake in tests. */
  exporter?: PdfExporter;
  /** Moment of the report; fixed in tests. */
  now?: Date;
}

/** HU-058: "Descargar PDF" of the report on screen. */
export const ExportReportPdfButton: React.FC<Props> = ({ data, placeName, unit, exporter = pdfFileExporter, now }) => {
  const [exporting, setExporting] = useState(false);
  const [doneFile, setDoneFile] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const canExport = !!data && data.hasData && data.buckets.length > 0;

  const handleExport = async () => {
    if (!data || !canExport) return;
    setExporting(true);
    setDoneFile(null);
    setError(null);
    try {
      const report = buildConsumptionReport(data, placeName, now);
      const fileName = reportPdfFileName(placeName, data);
      await exporter.exportPdf(fileName, buildReportHtml(report, data, unit));
      setDoneFile(fileName);
    } catch (e) {
      setError(`No pudimos generar el PDF. ${toAppError(e).message}`);
    } finally {
      setExporting(false);
    }
  };

  return (
    <View style={containerStyle}>
      {!!error && <Banner tone="error" message={error} onClose={() => setError(null)} />}
      {!!doneFile && <Banner tone="success" message={`PDF listo: ${doneFile}`} onClose={() => setDoneFile(null)} />}

      <Button
        label="Descargar PDF"
        variant="secondary"
        onPress={handleExport}
        disabled={!canExport}
        loading={exporting}
        icon={<Ionicons name="document-text-outline" size={18} color={theme.colors.primary} />}
      />
      {!canExport && <Text style={mutedStyle}>{data ? 'Aún no hay datos para el PDF.' : 'Cargando el reporte...'}</Text>}
    </View>
  );
};

const containerStyle: ViewStyle = { gap: theme.spacing.sm };
const mutedStyle: TextStyle = { ...theme.textStyles.caption, color: theme.colors.textMuted, textAlign: 'center' };
