import React from 'react';
import { act, create, ReactTestRenderer } from 'react-test-renderer';
import { Consumption } from '../../../domain/consumption/Consumption';
import { PdfExporter } from '../../../domain/files/PdfExporter';
import { ExportReportPdfButton } from '../consumption/ExportReportPdfButton';

jest.mock('@expo/vector-icons', () => ({ Ionicons: () => null }));
jest.mock('expo-file-system', () => ({ File: jest.fn(), Paths: { cache: 'CACHE_DIR' } }));
jest.mock('expo-print', () => ({ printToFileAsync: jest.fn() }));
jest.mock('expo-sharing', () => ({ isAvailableAsync: jest.fn(), shareAsync: jest.fn() }));

const NOW = new Date(2026, 9, 8, 15, 0);
const day = (offset: number) => new Date(2026, 9, 8 + offset).toISOString();

const texts = (tree: ReactTestRenderer) =>
  tree.root
    .findAll((n) => (n.type as unknown) === 'Text')
    .map((n) => n.children.filter((c) => typeof c === 'string').join(''))
    .join(' | ');

const render = (element: React.ReactElement) => {
  let tree!: ReactTestRenderer;
  act(() => {
    tree = create(element);
  });
  return tree;
};

const press = async (tree: ReactTestRenderer) => {
  const target = tree.root.findAll((n) => n.props.label === 'Descargar PDF' && typeof n.props.onPress === 'function');
  await act(async () => {
    await target[0].props.onPress();
  });
};

const data = (overrides: Partial<Consumption> = {}): Consumption => ({
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

const fakeExporter = (): jest.Mocked<PdfExporter> => ({ exportPdf: jest.fn().mockResolvedValue(undefined) });

describe('ExportReportPdfButton (HU-058)', () => {
  it('sends the report to the exporter with a descriptive name and confirms it', async () => {
    const exporter = fakeExporter();
    const tree = render(<ExportReportPdfButton data={data()} placeName="Casa" unit="LITERS" exporter={exporter} now={NOW} />);

    await press(tree);

    expect(exporter.exportPdf).toHaveBeenCalledTimes(1);
    const [fileName, html] = exporter.exportPdf.mock.calls[0];
    expect(fileName).toBe('reporte-consumo-casa-2026-10-02_2026-10-08.pdf');
    expect(html).toContain('<h2>Casa</h2>');
    expect(html).toContain('<svg');
    expect(texts(tree)).toContain('PDF listo: reporte-consumo-casa-2026-10-02_2026-10-08.pdf');
  });

  it('shows the error and keeps the button usable when the export fails', async () => {
    const exporter = fakeExporter();
    exporter.exportPdf.mockRejectedValue(new Error('boom'));
    const tree = render(<ExportReportPdfButton data={data()} placeName="Casa" unit="LITERS" exporter={exporter} now={NOW} />);

    await press(tree);

    expect(texts(tree)).toContain('No pudimos generar el PDF.');
    expect(texts(tree)).not.toContain('PDF listo');
  });

  it('is disabled while the report loads or when the period has no readings', async () => {
    const exporter = fakeExporter();
    const loading = render(<ExportReportPdfButton data={null} placeName="Casa" unit="LITERS" exporter={exporter} />);
    expect(texts(loading)).toContain('Cargando el reporte');
    const empty = render(<ExportReportPdfButton data={data({ hasData: false })} placeName="Casa" unit="LITERS" exporter={exporter} />);
    expect(texts(empty)).toContain('Aún no hay datos para el PDF.');

    await press(empty);
    expect(exporter.exportPdf).not.toHaveBeenCalled();
  });
});
