import { Alert } from '../Alert';
import { valveClosedOriginText } from '../valveClosedOrigin';

const alert = (overrides: Partial<Alert> = {}): Alert => ({
  id: 'a1',
  placeId: 'p1',
  alertType: 'VALVE_CLOSED',
  severity: 'CRITICAL',
  title: 'Se cerró el paso del agua',
  message: 'La válvula se cerró.',
  metadata: null,
  triggeredAt: '2026-10-03T15:00:00Z',
  readAt: null,
  ...overrides,
});

describe('valveClosedOriginText', () => {
  it.each([
    ['MANUAL', 'Cerrada por el usuario'],
    ['AUTO_LEAK', 'Cierre automático por fuga'],
    ['AUTO_GOAL', 'Cierre automático por meta superada'],
  ])('explains the origin %s', (origin, expected) => {
    expect(valveClosedOriginText(alert({ metadata: { origin } }))).toBe(expected);
  });

  it('returns null when the backend sent no metadata', () => {
    expect(valveClosedOriginText(alert({ metadata: null }))).toBeNull();
  });

  it('returns null for an origin we do not know', () => {
    expect(valveClosedOriginText(alert({ metadata: { origin: 'SOMETHING_NEW' } }))).toBeNull();
  });

  it('returns null for an origin that is not text', () => {
    expect(valveClosedOriginText(alert({ metadata: { origin: 42 } }))).toBeNull();
  });

  it('ignores alerts that are not about the valve, even if they carry an origin', () => {
    expect(valveClosedOriginText(alert({ alertType: 'SUSPECTED_LEAK', metadata: { origin: 'MANUAL' } }))).toBeNull();
  });
});
