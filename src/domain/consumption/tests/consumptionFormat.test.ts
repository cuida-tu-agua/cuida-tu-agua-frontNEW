import {
  bucketLabel,
  formatFlow,
  formatVolume,
  maxLiters,
  shouldLabel,
  toUnit,
} from '../consumptionFormat';

describe('consumptionFormat', () => {
  it('converts liters to the unit of the place', () => {
    expect(toUnit(1000, 'CUBIC_METERS')).toBe(1);
    expect(toUnit(3.785411784, 'GALLONS')).toBeCloseTo(1);
    expect(toUnit(42, 'LITERS')).toBe(42);
  });

  it('formats volumes with the unit symbol', () => {
    expect(formatVolume(2.5)).toMatch(/^2[,.]5 L$/);
    expect(formatVolume(840, 'CUBIC_METERS')).toMatch(/^0[,.]84 m³$/);
    expect(formatVolume(0)).toBe('0 L');
  });

  it('shows "Sin flujo" when there is no recent reading or no water running', () => {
    expect(formatFlow(null)).toBe('Sin flujo');
    expect(formatFlow(0)).toBe('Sin flujo');
    expect(formatFlow(2.44)).toMatch(/^2[,.]4 L\/min$/);
  });

  it('labels the bars in the local time of the phone', () => {
    const at = (y: number, m: number, d: number, h = 0) => ({ start: new Date(y, m, d, h).toISOString(), liters: 1 });
    expect(bucketLabel(at(2026, 9, 3, 14), 'DAY')).toBe('14h');
    expect(bucketLabel(at(2026, 9, 3), 'WEEK')).toBe('sáb'); // 3 Oct 2026 is a Saturday
    expect(bucketLabel(at(2026, 9, 21), 'MONTH')).toBe('21');
  });

  it('labels every bar of a week, and only some of a day or a month', () => {
    expect([0, 1, 2, 3, 4, 5, 6].every((i) => shouldLabel(i, 7, 'WEEK'))).toBe(true);
    expect(shouldLabel(6, 24, 'DAY')).toBe(true);
    expect(shouldLabel(7, 24, 'DAY')).toBe(false);
    expect(shouldLabel(30, 31, 'MONTH')).toBe(true);
  });

  it('never returns 0 as the largest bar', () => {
    expect(maxLiters([])).toBeGreaterThan(0);
    expect(maxLiters([{ start: '', liters: 3 }, { start: '', liters: 7 }])).toBe(7);
  });
});
