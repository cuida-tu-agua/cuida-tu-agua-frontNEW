import { MeasurementUnit } from '../places/Place';
import { Consumption, ConsumptionBucket, ConsumptionPeriod } from './Consumption';
import { bucketLabel, formatVolume, PERIOD_TITLES, shouldLabel, toUnit } from './consumptionFormat';
import { ConsumptionReport } from './consumptionReport';

/**
 * HU-058: the PDF of the consumption report. The chart is drawn as an inline SVG inside the HTML, so it is
 * vector (always legible, printed or zoomed) and needs no screenshot of the screen.
 */

export const escapeHtml = (text: string): string =>
  text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');

const pad = (n: number) => String(n).padStart(2, '0');
const isoDay = (date: Date) => `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

/** "reporte-consumo-casa-2026-10-02_2026-10-08.pdf": no accents, spaces or symbols, so it works anywhere. */
export const reportPdfFileName = (placeName: string, consumption: Pick<Consumption, 'from' | 'to' | 'period'>): string => {
  const slug =
    placeName
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'lugar';
  const first = new Date(consumption.from);
  const last = new Date(new Date(consumption.to).getTime() - 1);
  const range = isoDay(first) === isoDay(last) ? isoDay(first) : `${isoDay(first)}_${isoDay(last)}`;
  return `reporte-consumo-${slug}-${range}.pdf`;
};

const UNIT_SYMBOL: Record<MeasurementUnit, string> = { LITERS: 'L', CUBIC_METERS: 'm³', GALLONS: 'gal' };

/** Axis labels are already in the user's unit (the bars are converted before drawing). */
const formatAxisValue = (value: number, unit: MeasurementUnit): string =>
  `${value.toLocaleString('es-CO', { maximumFractionDigits: unit === 'CUBIC_METERS' ? 3 : value < 10 ? 1 : 0 })} ${UNIT_SYMBOL[unit]}`;

const CHART = { width: 640, height: 240, left: 44, right: 8, top: 14, bottom: 26 };
const BAR = '#2f7fbf';
const PEAK = '#0b4f8a';

const chartSvg = (buckets: ConsumptionBucket[], period: ConsumptionPeriod, unit: MeasurementUnit): string => {
  const plotWidth = CHART.width - CHART.left - CHART.right;
  const plotHeight = CHART.height - CHART.top - CHART.bottom;
  const values = buckets.map((b) => toUnit(b.liters, unit));
  const max = Math.max(0.001, ...values);
  const slot = plotWidth / Math.max(1, buckets.length);
  const barWidth = Math.max(2, slot * 0.66);
  const peakIndex = values.reduce((best, v, i) => (v > values[best] ? i : best), 0);
  const baseline = CHART.top + plotHeight;

  const bars = buckets
    .map((bucket, i) => {
      const height = values[i] > 0 ? Math.max(1.5, (values[i] / max) * plotHeight) : 0;
      const x = CHART.left + i * slot + (slot - barWidth) / 2;
      const fill = i === peakIndex && values[i] > 0 ? PEAK : BAR;
      const label = shouldLabel(i, buckets.length, period)
        ? `<text x="${(x + barWidth / 2).toFixed(1)}" y="${baseline + 15}" text-anchor="middle" font-size="10" fill="#444">${escapeHtml(bucketLabel(bucket, period))}</text>`
        : '';
      return `<rect x="${x.toFixed(1)}" y="${(baseline - height).toFixed(1)}" width="${barWidth.toFixed(1)}" height="${height.toFixed(1)}" fill="${fill}"/>${label}`;
    })
    .join('');

  // Three reference lines (0, half and the maximum) with the value in the user's unit
  const grid = [0, 0.5, 1]
    .map((fraction) => {
      const y = baseline - fraction * plotHeight;
      const text = formatAxisValue(max * fraction, unit);
      return `<line x1="${CHART.left}" x2="${CHART.width - CHART.right}" y1="${y}" y2="${y}" stroke="#d6d6d6" stroke-width="1"/><text x="${CHART.left - 6}" y="${y + 3}" text-anchor="end" font-size="10" fill="#444">${escapeHtml(text)}</text>`;
    })
    .join('');

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${CHART.width} ${CHART.height}" width="100%" role="img" aria-label="Gráfico de consumo">${grid}${bars}</svg>`;
};

const formatGenerated = (iso: string) => new Date(iso).toLocaleString('es-CO', { dateStyle: 'long', timeStyle: 'short' });

const peakText = (report: ConsumptionReport, unit: MeasurementUnit): string | null => {
  if (!report.peak) return null;
  const date = new Date(report.peak.start);
  const when =
    report.period === 'DAY'
      ? `${pad(date.getHours())}:00`
      : date.toLocaleDateString('es-CO', { weekday: 'long', day: 'numeric', month: 'long' });
  const label = report.period === 'DAY' ? 'Hora de mayor consumo' : 'Día de mayor consumo';
  return `${label}: ${when} · ${formatVolume(report.peak.liters, unit)}`;
};

/** Complete HTML document of the report, ready for the print engine. */
export const buildReportHtml = (report: ConsumptionReport, consumption: Consumption, unit: MeasurementUnit): string => {
  const warnings = report.warnings.map((w) => `<p class="warning">⚠ ${escapeHtml(w)}</p>`).join('');
  const peak = peakText(report, unit);
  const body = report.hasData
    ? `<div class="stats">
        <div><span class="label">${escapeHtml(PERIOD_TITLES[report.period])}</span><span class="value">${escapeHtml(formatVolume(report.totalLiters, unit))}</span></div>
        <div><span class="label">Promedio diario</span><span class="value">${escapeHtml(formatVolume(report.dailyAverageLiters, unit))}</span></div>
      </div>
      ${peak ? `<p class="muted">${escapeHtml(peak)}</p>` : ''}
      <div class="chart">${chartSvg(consumption.buckets, report.period, unit)}</div>`
    : '';

  return `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="utf-8"/>
<title>${escapeHtml(reportPdfFileName(report.placeName, consumption).replace(/\.pdf$/, ''))}</title>
<style>
  @page { size: A4; margin: 18mm; }
  body { font-family: Arial, Helvetica, sans-serif; color: #1c1c1c; margin: 0; padding: 0; }
  h1 { font-size: 22px; margin: 0 0 4px; color: #0b4f8a; }
  h2 { font-size: 16px; margin: 0 0 2px; }
  .muted { color: #555; font-size: 12px; margin: 2px 0; }
  .stats { display: flex; gap: 32px; margin: 18px 0 10px; }
  .stats div { flex: 1; border: 1px solid #d6d6d6; border-radius: 8px; padding: 12px; }
  .label { display: block; font-size: 12px; color: #555; }
  .value { display: block; font-size: 24px; font-weight: bold; color: #0b4f8a; margin-top: 4px; }
  .chart { margin-top: 12px; }
  .warning { background: #fff4e0; border: 1px solid #f0b34a; border-radius: 6px; padding: 8px 10px; font-size: 12px; margin: 10px 0; }
  .footer { margin-top: 24px; font-size: 11px; color: #777; border-top: 1px solid #d6d6d6; padding-top: 8px; }
</style>
</head>
<body>
  <h1>Reporte de consumo</h1>
  <h2>${escapeHtml(report.placeName)}</h2>
  <p class="muted">${escapeHtml(report.rangeText)}</p>
  <p class="muted">Generado el ${escapeHtml(formatGenerated(report.generatedAt))}</p>
  ${warnings}
  ${body}
  <p class="footer">Cuida Tu Agua · Los valores se muestran en ${escapeHtml(unit === 'LITERS' ? 'litros' : unit === 'CUBIC_METERS' ? 'metros cúbicos' : 'galones')}.</p>
</body>
</html>`;
};
