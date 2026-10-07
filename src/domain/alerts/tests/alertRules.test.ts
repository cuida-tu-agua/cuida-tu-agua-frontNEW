import { Alert } from '../Alert';
import {
  ALERT_TYPE_LABELS,
  countUnread,
  formatBadgeCount,
  markAsReadLocally,
  removeLocally,
  SEVERITY_LABELS,
  sortNewestFirst,
} from '../alertRules';

const alert = (overrides: Partial<Alert> = {}): Alert => ({
  id: 'a1',
  placeId: 'p1',
  placeName: 'Casa',
  type: 'LEAK_SUSPECTED',
  severity: 'CRITICAL',
  message: 'Agua corriendo sin parar',
  createdAt: '2026-10-03T15:00:00Z',
  read: false,
  ...overrides,
});

describe('sortNewestFirst', () => {
  it('puts the most recent alert first', () => {
    const old = alert({ id: 'old', createdAt: '2026-10-01T10:00:00Z' });
    const mid = alert({ id: 'mid', createdAt: '2026-10-02T10:00:00Z' });
    const recent = alert({ id: 'recent', createdAt: '2026-10-03T10:00:00Z' });

    expect(sortNewestFirst([mid, old, recent]).map((a) => a.id)).toEqual(['recent', 'mid', 'old']);
  });

  it('does not change the original array', () => {
    const list = [alert({ id: 'a', createdAt: '2026-10-01T10:00:00Z' }), alert({ id: 'b', createdAt: '2026-10-02T10:00:00Z' })];
    sortNewestFirst(list);
    expect(list.map((a) => a.id)).toEqual(['a', 'b']);
  });
});

describe('countUnread', () => {
  it('counts only the alerts not read yet', () => {
    expect(countUnread([alert({ id: '1' }), alert({ id: '2', read: true }), alert({ id: '3' })])).toBe(2);
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
  it('marks only the chosen alert as read', () => {
    const result = markAsReadLocally([alert({ id: '1' }), alert({ id: '2' })], '2');
    expect(result.map((a) => a.read)).toEqual([false, true]);
  });

  it('removes only the chosen alert', () => {
    expect(removeLocally([alert({ id: '1' }), alert({ id: '2' })], '1').map((a) => a.id)).toEqual(['2']);
  });
});

describe('labels', () => {
  it('names every kind of alert and every level in Spanish', () => {
    expect(ALERT_TYPE_LABELS.LEAK_SUSPECTED).toBe('Fuga sospechosa');
    expect(ALERT_TYPE_LABELS.VALVE_CLOSED).toBe('Válvula cerrada');
    expect(SEVERITY_LABELS).toEqual({ CRITICAL: 'Crítica', IMPORTANT: 'Importante', INFO: 'Informativa' });
  });
});
