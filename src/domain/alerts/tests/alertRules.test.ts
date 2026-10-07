import { Alert } from '../Alert';
import {
  ALERT_TYPE_LABELS,
  countUnread,
  isRead,
  formatBadgeCount,
  markAsReadLocally,
  removeLocally,
  SEVERITY_LABELS,
  sortNewestFirst,
} from '../alertRules';

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

describe('sortNewestFirst', () => {
  it('puts the most recent alert first', () => {
    const old = alert({ id: 'old', triggeredAt: '2026-10-01T10:00:00Z' });
    const mid = alert({ id: 'mid', triggeredAt: '2026-10-02T10:00:00Z' });
    const recent = alert({ id: 'recent', triggeredAt: '2026-10-03T10:00:00Z' });

    expect(sortNewestFirst([mid, old, recent]).map((a) => a.id)).toEqual(['recent', 'mid', 'old']);
  });

  it('does not change the original array', () => {
    const list = [alert({ id: 'a', triggeredAt: '2026-10-01T10:00:00Z' }), alert({ id: 'b', triggeredAt: '2026-10-02T10:00:00Z' })];
    sortNewestFirst(list);
    expect(list.map((a) => a.id)).toEqual(['a', 'b']);
  });
});

describe('countUnread', () => {
  it('counts only the alerts not read yet', () => {
    expect(countUnread([alert({ id: '1' }), alert({ id: '2', readAt: '2026-10-03T16:00:00Z' }), alert({ id: '3' })])).toBe(2);
  });

  it('is zero for an empty list', () => {
    expect(countUnread([])).toBe(0);
  });
});

describe('formatBadgeCount', () => {
  it.each([
    [0, null],
    [-1, null],
    [1, '1'],
    [99, '99'],
    [100, '99+'],
  ])('%s → %s', (count, expected) => {
    expect(formatBadgeCount(count)).toBe(expected);
  });
});

describe('local updates', () => {
  it('marks only the chosen alert as read, with the time it was read', () => {
    const now = new Date('2026-10-04T10:00:00Z');
    const result = markAsReadLocally([alert({ id: '1' }), alert({ id: '2' })], '2', now);
    expect(result.map(isRead)).toEqual([false, true]);
    expect(result[1].readAt).toBe('2026-10-04T10:00:00.000Z');
  });

  it('keeps the original read time of an alert that was already read', () => {
    const already = alert({ id: '1', readAt: '2026-10-03T16:00:00Z' });
    const result = markAsReadLocally([already], '1', new Date('2026-10-05T10:00:00Z'));
    expect(result[0].readAt).toBe('2026-10-03T16:00:00Z');
  });

  it('removes only the chosen alert', () => {
    expect(removeLocally([alert({ id: '1' }), alert({ id: '2' })], '1').map((a) => a.id)).toEqual(['2']);
  });
});

describe('labels', () => {
  it('names every kind of alert and every level in Spanish', () => {
    expect(ALERT_TYPE_LABELS.SUSPECTED_LEAK).toBe('Fuga sospechosa');
    expect(ALERT_TYPE_LABELS.VALVE_CLOSED).toBe('Válvula cerrada');
    expect(Object.keys(ALERT_TYPE_LABELS)).toHaveLength(8); // the 8 types of the docs
    expect(SEVERITY_LABELS).toEqual({ CRITICAL: 'Crítica', IMPORTANT: 'Importante', INFORMATIVE: 'Informativa' });
  });
});
