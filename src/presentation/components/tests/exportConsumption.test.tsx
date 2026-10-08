import React from 'react';
import { act, create, ReactTestRenderer } from 'react-test-renderer';
import { Consumption } from '../../../domain/consumption/Consumption';
import { FileExporter } from '../../../domain/files/FileExporter';
import { ExportConsumptionButton } from '../consumption/ExportConsumptionButton';

jest.mock('@expo/vector-icons', () => ({ Ionicons: () => null }));
jest.mock('expo-file-system', () => ({ File: jest.fn(), Paths: { cache: 'CACHE_DIR' } }));
jest.mock('expo-sharing', () => ({ isAvailableAsync: jest.fn(), shareAsync: jest.fn() }));

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

const pressExport = async (tree: ReactTestRenderer) => {
  const target = tree.root.findAll((n) => n.props.label === 'Exportar a Excel (CSV)' && typeof n.props.onPress === 'function');
  await act(async () => {
    await target[0].props.onPress();
  });
};

const data = (overrides: Partial<Consumption> = {}): Consumption => ({
  placeId: 'p1',
  period: 'WEEK',
  timeZone: 'America/Bogota',
  from: '2026-10-01T05:00:00Z',
  to: '2026-10-08T05:00:00Z',
  totalLiters: 300,
  hasData: true,
  buckets: [{ start: '2026-10-07T05:00:00Z', liters: 300 }],
  lastReadingAt: null,
  currentFlowLpm: null,
  generatedAt: '2026-10-07T12:00:00Z',
  ...overrides,
});

const fakeExporter = (): jest.Mocked<FileExporter> => ({ exportCsv: jest.fn().mockResolvedValue(undefined) });

describe('ExportConsumptionButton', () => {
  it('exports the CSV of the period on screen and confirms the file name', async () => {
    const exporter = fakeExporter();
    const tree = render(<ExportConsumptionButton data={data()} period="WEEK" unit="LITERS" placeName="Casa" exporter={exporter} />);

    await pressExport(tree);

    expect(exporter.exportCsv).toHaveBeenCalledTimes(1);
    const [fileName, content] = exporter.exportCsv.mock.calls[0];
    expect(fileName).toMatch(/^consumo-casa-semana-\d{4}-\d{2}-\d{2}\.csv$/);
    expect(content).toContain('Fecha;Hora;Consumo;Unidad');
    expect(content).toContain('2026-10-07;00:00;300;Litros');
    expect(texts(tree)).toContain('Archivo listo');
  });

  it('exports in the unit of the place', async () => {
    const exporter = fakeExporter();
    const tree = render(<ExportConsumptionButton data={data()} period="WEEK" unit="CUBIC_METERS" placeName="Casa" exporter={exporter} />);

    await pressExport(tree);

    expect(exporter.exportCsv.mock.calls[0][1]).toContain('0,3;Metros cúbicos');
  });

  it('shows the error when the export fails', async () => {
    const exporter = fakeExporter();
    exporter.exportCsv.mockRejectedValue(new Error('sin espacio'));
    const tree = render(<ExportConsumptionButton data={data()} period="WEEK" unit="LITERS" placeName="Casa" exporter={exporter} />);

    await pressExport(tree);

    expect(texts(tree)).toContain('No pudimos exportar el consumo');
    expect(texts(tree)).not.toContain('Archivo listo');
  });

  it('does not export when the place has no readings yet', async () => {
    const exporter = fakeExporter();
    const tree = render(
      <ExportConsumptionButton data={data({ hasData: false, buckets: [] })} period="WEEK" unit="LITERS" placeName="Casa" exporter={exporter} />,
    );

    expect(texts(tree)).toContain('Aún no hay datos para exportar');
    await pressExport(tree);
    expect(exporter.exportCsv).not.toHaveBeenCalled();
  });

  it('does not export last period data while the new period is still loading', async () => {
    const exporter = fakeExporter();
    const tree = render(<ExportConsumptionButton data={data({ period: 'DAY' })} period="MONTH" unit="LITERS" placeName="Casa" exporter={exporter} />);

    expect(texts(tree)).toContain('Cargando el consumo');
    await pressExport(tree);
    expect(exporter.exportCsv).not.toHaveBeenCalled();
  });
});
