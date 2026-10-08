import { Consumption } from '../Consumption';
import { buildConsumptionCsv, consumptionCsvFileName, csvCell } from '../consumptionCsv';

const consumption = (overrides: Partial<Consumption> = {}): Consumption => ({
  placeId: 'p1',
  period: 'DAY',
  timeZone: 'America/Bogota',
  from: '2026-10-07T05:00:00Z',
  to: '2026-10-08T05:00:00Z',
  totalLiters: 150.5,
  hasData: true,
  buckets: [
    { start: '2026-10-07T05:00:00Z', liters: 30 },
    { start: '2026-10-07T06:00:00Z', liters: 120.5 },
  ],
  lastReadingAt: null,
  currentFlowLpm: null,
  generatedAt: '2026-10-07T12:00:00Z',
  ...overrides,
});

const lines = (csv: string) => csv.replace(/^﻿/, '').split('\r\n').filter(Boolean);

describe('buildConsumptionCsv', () => {
  it('starts with a BOM so Excel keeps the accents', () => {
    expect(buildConsumptionCsv(consumption(), 'LITERS').charCodeAt(0)).toBe(0xfeff);
  });

  it('has the header Fecha;Hora;Consumo;Unidad and one row per interval', () => {
    const rows = lines(buildConsumptionCsv(consumption(), 'LITERS'));
    expect(rows[0]).toBe('Fecha;Hora;Consumo;Unidad');
    expect(rows).toHaveLength(3);
  });

  it('writes date and time in the time zone of the data, not in UTC', () => {
    const rows = lines(buildConsumptionCsv(consumption(), 'LITERS'));
    expect(rows[1]).toBe('2026-10-07;00:00;30;Litros'); // 05:00 UTC is midnight in Bogotá
    expect(rows[2]).toBe('2026-10-07;01:00;120,5;Litros');
  });

  it('puts an interval from the evening of the day before on that day', () => {
    const csv = buildConsumptionCsv(consumption({ buckets: [{ start: '2026-10-07T03:00:00Z', liters: 1 }] }), 'LITERS');
    expect(lines(csv)[1]).toBe('2026-10-06;22:00;1;Litros');
  });

  it('uses a decimal comma and no thousands separator', () => {
    const csv = buildConsumptionCsv(consumption({ buckets: [{ start: '2026-10-07T05:00:00Z', liters: 12345.6789 }] }), 'LITERS');
    expect(lines(csv)[1].split(';')[2]).toBe('12345,679');
  });

  it('converts to the unit of the place and names it', () => {
    const csv = buildConsumptionCsv(consumption({ buckets: [{ start: '2026-10-07T05:00:00Z', liters: 2500 }] }), 'CUBIC_METERS');
    expect(lines(csv)[1]).toBe('2026-10-07;00:00;2,5;Metros cúbicos');
  });

  it('writes one row per day for a week', () => {
    const buckets = Array.from({ length: 7 }, (_, i) => ({ start: `2026-10-0${i + 1}T05:00:00Z`, liters: i }));
    const rows = lines(buildConsumptionCsv(consumption({ period: 'WEEK', buckets }), 'LITERS'));
    expect(rows).toHaveLength(8);
    expect(rows[7]).toBe('2026-10-07;00:00;6;Litros');
  });

  it('is only the header when there are no intervals', () => {
    expect(lines(buildConsumptionCsv(consumption({ buckets: [] }), 'LITERS'))).toEqual(['Fecha;Hora;Consumo;Unidad']);
  });
});

describe('csvCell', () => {
  it('leaves plain text alone', () => {
    expect(csvCell('Litros')).toBe('Litros');
  });

  it('quotes text with the delimiter, quotes or line breaks', () => {
    expect(csvCell('a;b')).toBe('"a;b"');
    expect(csvCell('di"jo')).toBe('"di""jo"');
    expect(csvCell('a\nb')).toBe('"a\nb"');
  });
});

describe('consumptionCsvFileName', () => {
  const day = new Date(2026, 9, 7); // 7 Oct 2026, local time

  it('uses the place, the period and the date', () => {
    expect(consumptionCsvFileName('Casa', 'WEEK', day)).toBe('consumo-casa-semana-2026-10-07.csv');
  });

  it('removes accents, spaces and symbols', () => {
    expect(consumptionCsvFileName('  Bodega Niño #2 ', 'MONTH', day)).toBe('consumo-bodega-nino-2-mes-2026-10-07.csv');
  });

  it('falls back to a generic name when the place has no usable letters', () => {
    expect(consumptionCsvFileName('###', 'DAY', day)).toBe('consumo-lugar-dia-2026-10-07.csv');
  });
});
