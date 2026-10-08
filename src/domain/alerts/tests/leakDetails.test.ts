import { Alert } from '../Alert';
import { leakDetails, leakSummaryText } from '../leakDetails';

const alert = (overrides: Partial<Alert> = {}): Alert => ({
  id: 'a1',
  placeId: 'p1',
  alertType: 'SUSPECTED_LEAK',
  severity: 'CRITICAL',
  title: 'Posible fuga de agua',
  message: 'Agua corriendo sin parar',
  metadata: null,
  triggeredAt: '2026-10-03T15:00:00Z',
  readAt: null,
  ...overrides,
});

describe('leakDetails', () => {
  it('reads the data of the LeakSuspected event', () => {
    const details = leakDetails(
      alert({ metadata: { detectedAt: '2026-10-03T08:00:00Z', durationMinutes: 35, volumeConsumed: 120.5, isNighttime: true, unit: 'LITERS' } }),
    );
    expect(details).toEqual({ detectedAt: '2026-10-03T08:00:00Z', durationMinutes: 35, volumeLiters: 120.5, isNighttime: true });
  });

  it('converts the volume to liters when the backend sends another unit', () => {
    expect(leakDetails(alert({ metadata: { volumeConsumed: 0.2, unit: 'CUBIC_METERS' } }))?.volumeLiters).toBeCloseTo(200);
  });

  it('assumes liters when the unit is missing', () => {
    expect(leakDetails(alert({ metadata: { volumeConsumed: 50 } }))?.volumeLiters).toBe(50);
  });

  it('does not invent a volume for an unknown unit', () => {
    expect(leakDetails(alert({ metadata: { volumeConsumed: 50, unit: 'BARRELS' } }))?.volumeLiters).toBeNull();
  });

  it('survives a missing or broken payload', () => {
    expect(leakDetails(alert({ metadata: null }))).toEqual({ detectedAt: null, durationMinutes: null, volumeLiters: null, isNighttime: false });
    expect(
      leakDetails(alert({ metadata: { detectedAt: 'not a date', durationMinutes: -5, volumeConsumed: '120', isNighttime: 'yes' } })),
    ).toEqual({ detectedAt: null, durationMinutes: null, volumeLiters: null, isNighttime: false });
  });

  it('is null for alerts that are not a suspected leak', () => {
    expect(leakDetails(alert({ alertType: 'VALVE_CLOSED', metadata: { durationMinutes: 35 } }))).toBeNull();
  });
});

describe('leakSummaryText', () => {
  it('joins duration and volume', () => {
    const text = leakSummaryText({ detectedAt: null, durationMinutes: 35, volumeLiters: 120.5, isNighttime: false });
    expect(text).toContain('35 min');
    expect(text).toContain('121 L'); // the app rounds 120.5 L to whole liters above 100 L
    expect(text).toContain(' · ');
  });

  it('starts with the time of detection when there is one', () => {
    expect(leakSummaryText({ detectedAt: '2026-10-03T08:00:00Z', durationMinutes: null, volumeLiters: null, isNighttime: false })).toMatch(
      /^Desde las /,
    );
  });

  it('returns null when there is nothing to say', () => {
    expect(leakSummaryText({ detectedAt: null, durationMinutes: null, volumeLiters: null, isNighttime: true })).toBeNull();
  });
});
