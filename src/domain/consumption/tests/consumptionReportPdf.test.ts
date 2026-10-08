import { Consumption } from '../Consumption';
import { buildConsumptionReport } from '../consumptionReport';
import { buildReportHtml, escapeHtml, reportPdfFileName } from '../consumptionReportPdf';

const NOW = new Date(2026, 9, 8, 15, 0);
const day = (offset: number) => new Date(2026, 9, 8 + offset).toISOString();

const week = (overrides: Partial<Consumption> = {}): Consumption => ({
  placeId: 'p1',
  period: 'WEEK',
  timeZone: 'America/Bogota',
  from: day(-6),
  to: day(1),
  totalLiters: 700,
  hasData: true,
  buckets: [100, 100, 100, 100, 100, 100, 100].map((liters, i) => ({ start: day(i - 6), liters })),
  lastReadingAt: new Date(2026, 9, 8, 14, 50).toISOString(),
  currentFlowLpm: 0,
  generatedAt: NOW.toISOString(),
  ...overrides,
});

const html = (data: Consumption, placeName = 'Casa', unit: 'LITERS' | 'CUBIC_METERS' | 'GALLONS' = 'LITERS') =>
  buildReportHtml(buildConsumptionReport(data, placeName, NOW), data, unit);

describe('escapeHtml', () => {
  it('neutralizes markup typed by the user', () => {
    expect(escapeHtml(`<b>"Casa" & 'Co'</b>`)).toBe('&lt;b&gt;&quot;Casa&quot; &amp; &#39;Co&#39;&lt;/b&gt;');
  });
});

describe('reportPdfFileName', () => {
  it('is descriptive: place and date range, without accents or symbols', () => {
    expect(reportPdfFileName('Casa Medellín #1', week())).toBe('reporte-consumo-casa-medellin-1-2026-10-02_2026-10-08.pdf');
  });

  it('uses a single date for one day and a fallback for a name with no letters', () => {
    expect(reportPdfFileName('???', week({ period: 'DAY', from: day(0), to: day(1) }))).toBe('reporte-consumo-lugar-2026-10-08.pdf');
  });
});

describe('buildReportHtml (HU-058)', () => {
  it('includes place name, date range, generation date, total and daily average', () => {
    const out = html(week(), 'Casa Medellín');
    expect(out).toContain('<h2>Casa Medellín</h2>');
    expect(out).toMatch(/Del .* al /);
    expect(out).toMatch(/Generado el .*2026/);
    expect(out).toContain('700 L');
    expect(out).toContain('Promedio diario');
    expect(out).toContain('Día de mayor consumo');
  });

  it('draws the chart as vector bars, one per interval, and labels the axis', () => {
    const out = html(week());
    expect(out).toContain('<svg');
    expect(out.match(/<rect /g)).toHaveLength(7);
    expect(out).toContain('100 L'); // top of the axis
    expect(out).toContain('>lun<');
  });

  it('shows the values in the unit of the place', () => {
    const out = html(week({ totalLiters: 2000, buckets: [{ start: day(0), liters: 2000 }] }), 'Casa', 'CUBIC_METERS');
    expect(out).toContain('2 m³');
    expect(out).toContain('metros cúbicos');
  });

  it('carries the data-gap warnings', () => {
    const gaps = week({ buckets: [100, 0, 100, 100, 100, 100, 100].map((liters, i) => ({ start: day(i - 6), liters })) });
    expect(html(gaps)).toContain('1 día sin consumo registrado');
  });

  it('has no chart or figures for a period without readings, only the warning', () => {
    const out = html(week({ hasData: false, totalLiters: 0, lastReadingAt: null }));
    expect(out).toContain('No hay lecturas del medidor');
    expect(out).not.toContain('<svg');
    expect(out).not.toContain('Promedio diario');
  });

  it('escapes the place name so it cannot inject markup into the PDF', () => {
    const out = html(week(), '<script>alert(1)</script>');
    expect(out).not.toContain('<script>');
    expect(out).toContain('&lt;script&gt;');
  });

  it('puts the descriptive file name as the document title', () => {
    expect(html(week())).toContain('<title>reporte-consumo-casa-2026-10-02_2026-10-08</title>');
  });
});
