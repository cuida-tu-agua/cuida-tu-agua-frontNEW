import { DEVICE_STATUS_HINTS, DEVICE_STATUS_LABELS, formatLastReport } from '../deviceStatus';

describe('DEVICE_STATUS_LABELS', () => {
  it('uses the HU-013 names', () => {
    expect(DEVICE_STATUS_LABELS).toEqual({
      CONNECTED: 'Conectado',
      DISCONNECTED: 'Desconectado',
      NEVER_REPORTED: 'Nunca ha reportado',
    });
  });

  it('only gives advice when the meter is not connected', () => {
    expect(DEVICE_STATUS_HINTS.CONNECTED).toBeNull();
    expect(DEVICE_STATUS_HINTS.DISCONNECTED).toMatch(/WiFi/);
    expect(DEVICE_STATUS_HINTS.NEVER_REPORTED).toMatch(/encendido/);
  });
});

describe('formatLastReport', () => {
  const now = new Date('2026-09-28T15:00:00Z');

  it.each([
    [null, 'Sin reportes todavía'],
    ['2026-09-28T15:00:20Z', 'hace menos de 1 min'], // phone clock a bit behind the server
    ['2026-09-28T14:59:30Z', 'hace menos de 1 min'],
    ['2026-09-28T14:48:00Z', 'hace 12 min'],
    ['2026-09-28T12:00:00Z', 'hace 3 h'],
    ['2026-09-27T12:00:00Z', 'hace 1 día'],
    ['2026-09-23T15:00:00Z', 'hace 5 días'],
  ])('%s → %s', (iso, expected) => {
    expect(formatLastReport(iso, now)).toBe(expected);
  });
});
