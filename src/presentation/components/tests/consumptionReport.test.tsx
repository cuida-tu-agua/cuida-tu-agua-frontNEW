import React from 'react';
import { act, create, ReactTestRenderer } from 'react-test-renderer';
import { Consumption } from '../../../domain/consumption/Consumption';
import { ConsumptionReportView } from '../consumption/ConsumptionReportView';

jest.mock('@expo/vector-icons', () => ({ Ionicons: () => null }));

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

describe('ConsumptionReportView (HU-057)', () => {
  it('shows place, range, generation date, total and daily average', () => {
    const out = texts(render(<ConsumptionReportView data={data()} placeName="Casa Medellín" unit="LITERS" now={NOW} />));
    expect(out).toContain('Reporte de consumo');
    expect(out).toContain('Casa Medellín');
    expect(out).toMatch(/Del .* al /);
    expect(out).toMatch(/Generado el .*2026/);
    expect(out).toContain('Últimos 7 días');
    expect(out).toContain('700 L');
    expect(out).toContain('Promedio diario');
    expect(out).toContain('100 L');
    expect(out).toContain('Día de mayor consumo');
  });

  it('uses the unit of the place', () => {
    const out = texts(render(<ConsumptionReportView data={data({ totalLiters: 2000 })} placeName="Casa" unit="CUBIC_METERS" now={NOW} />));
    expect(out).toContain('2 m³');
  });

  it('shows the data-gap warning and no figures when there are no readings', () => {
    const empty = data({ hasData: false, totalLiters: 0, lastReadingAt: null });
    const out = texts(render(<ConsumptionReportView data={empty} placeName="Casa" unit="LITERS" now={NOW} />));
    expect(out).toContain('No hay lecturas del medidor en este periodo');
    expect(out).not.toContain('Promedio diario');
  });

  it('warns about the days without consumption', () => {
    const gaps = data({ buckets: [100, 0, 100, 100, 100, 100, 100].map((liters, i) => ({ start: day(i - 6), liters })) });
    expect(texts(render(<ConsumptionReportView data={gaps} placeName="Casa" unit="LITERS" now={NOW} />))).toContain('1 día sin consumo registrado');
  });
});
