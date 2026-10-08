import { Consumption } from '../Consumption';
import { buildConsumptionReport, reportRangeText, reportWarnings } from '../consumptionReport';

// Thursday 8 Oct 2026, 15:00 local
const NOW = new Date(2026, 9, 8, 15, 0);
const day = (offset: number) => new Date(2026, 9, 8 + offset).toISOString();

const week = (liters: number[], overrides: Partial<Consumption> = {}): Consumption => ({
  placeId: 'p1',
  period: 'WEEK',
  timeZone: 'America/Bogota',
  from: day(-6),
  to: day(1),
  totalLiters: liters.reduce((a, b) => a + b, 0),
  hasData: true,
  buckets: liters.map((l, i) => ({ start: day(i - 6), liters: l })),
  lastReadingAt: new Date(2026, 9, 8, 14, 50).toISOString(),
  currentFlowLpm: 0,
  generatedAt: NOW.toISOString(),
  ...overrides,
});

describe('buildConsumptionReport', () => {
  it('gives total, daily average and the day of highest consumption', () => {
    const report = buildConsumptionReport(week([100, 200, 300, 150, 50, 100, 100]), 'Casa', NOW);
    expect(report.totalLiters).toBe(1000);
    expect(report.elapsedDays).toBe(7);
    expect(report.dailyAverageLiters).toBeCloseTo(1000 / 7);
    expect(report.peak).toMatchObject({ liters: 300 });
    expect(report.placeName).toBe('Casa');
    expect(report.generatedAt).toBe(NOW.toISOString());
    expect(report.warnings).toEqual([]);
  });

  it('only divides by the days that have already started (a month in progress)', () => {
    const buckets = Array.from({ length: 31 }, (_, i) => ({ start: new Date(2026, 9, 1 + i).toISOString(), liters: i < 8 ? 100 : 0 }));
    const month: Consumption = week([], { period: 'MONTH', from: day(-7), to: new Date(2026, 10, 1).toISOString(), buckets, totalLiters: 800 });
    const report = buildConsumptionReport(month, 'Casa', NOW);
    expect(report.elapsedDays).toBe(8);
    expect(report.dailyAverageLiters).toBe(100);
  });

  it('"Hoy" is one day: the average is the total and the peak is an hour', () => {
    const hours = Array.from({ length: 24 }, (_, h) => ({ start: new Date(2026, 9, 8, h).toISOString(), liters: h === 7 ? 40 : 0 }));
    const today: Consumption = week([], { period: 'DAY', from: day(0), to: day(1), buckets: hours, totalLiters: 40 });
    const report = buildConsumptionReport(today, 'Casa', NOW);
    expect(report.elapsedDays).toBe(1);
    expect(report.dailyAverageLiters).toBe(40);
    expect(new Date(report.peak!.start).getHours()).toBe(7);
  });

  it('has no peak when nothing was consumed', () => {
    expect(buildConsumptionReport(week([0, 0, 0, 0, 0, 0, 0], { hasData: false }), 'Casa', NOW).peak).toBeNull();
  });
});

describe('reportWarnings', () => {
  it('warns that an empty period has no readings', () => {
    const warnings = reportWarnings(week([0, 0, 0, 0, 0, 0, 0], { hasData: false, lastReadingAt: null }), NOW);
    expect(warnings).toHaveLength(1);
    expect(warnings[0]).toMatch(/No hay lecturas/);
  });

  it('warns when the meter stopped reporting', () => {
    const stale = week([100, 100, 100, 100, 100, 100, 100], { lastReadingAt: new Date(2026, 9, 7, 20, 0).toISOString() });
    expect(reportWarnings(stale, NOW).join(' ')).toMatch(/no reporta desde/);
  });

  it('does not warn about a reading that is only a few hours old', () => {
    const recent = week([100, 100, 100, 100, 100, 100, 100], { lastReadingAt: new Date(2026, 9, 8, 11, 0).toISOString() });
    expect(reportWarnings(recent, NOW)).toEqual([]);
  });

  it('counts finished days with zero liters, never today', () => {
    const some = week([100, 0, 100, 0, 100, 100, 0]); // the last 0 is today: not counted
    expect(reportWarnings(some, NOW).join(' ')).toMatch(/2 días sin consumo registrado/);
    expect(reportWarnings(week([100, 0, 100, 100, 100, 100, 0]), NOW).join(' ')).toMatch(/1 día sin consumo registrado/);
  });

  it('does not treat the quiet hours of "Hoy" as gaps', () => {
    const hours = Array.from({ length: 24 }, (_, h) => ({ start: new Date(2026, 9, 8, h).toISOString(), liters: h === 7 ? 40 : 0 }));
    const today = week([], { period: 'DAY', from: day(0), to: day(1), buckets: hours, totalLiters: 40 });
    expect(reportWarnings(today, NOW)).toEqual([]);
  });
});

describe('reportRangeText', () => {
  it('writes a range for a week and a single date for a day', () => {
    expect(reportRangeText(week([1]))).toMatch(/^Del .*2.* al .*8/);
    expect(reportRangeText({ period: 'DAY', from: day(0), to: day(1) })).toMatch(/^8 .*2026/);
  });
});
