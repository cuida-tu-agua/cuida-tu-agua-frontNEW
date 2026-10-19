import {
  AppNotification,
  LevelPreference,
  badgeText,
  lockOf,
  markedRead,
  mergePages,
  timeAgo,
  toggleChannel,
} from '../Notification';

const NOW = new Date('2026-10-09T15:00:00Z');
const ago = (ms: number) => new Date(NOW.getTime() - ms).toISOString();
const MIN = 60_000;
const HOUR = 60 * MIN;
const DAY = 24 * HOUR;

const notification = (id: string, overrides: Partial<AppNotification> = {}): AppNotification => ({
  id,
  type: 'VALVE_CHANGED',
  severity: 'CRITICAL',
  title: 'Se cerró el agua',
  body: '',
  placeId: 'p1',
  createdAt: '2026-10-09T14:00:00Z',
  isRead: false,
  readAt: null,
  ...overrides,
});

describe('timeAgo', () => {
  it('speaks like a person', () => {
    expect(timeAgo(ago(10_000), NOW)).toBe('ahora');
    expect(timeAgo(ago(5 * MIN), NOW)).toBe('hace 5 min');
    expect(timeAgo(ago(3 * HOUR), NOW)).toBe('hace 3 h');
    expect(timeAgo(ago(30 * HOUR), NOW)).toBe('ayer');
    expect(timeAgo(ago(4 * DAY), NOW)).toBe('hace 4 días');
  });

  it('after a week it shows the date', () => {
    expect(timeAgo(ago(20 * DAY), NOW)).toMatch(/2026/);
  });

  it('a date in the future or a broken one does not say nonsense', () => {
    expect(timeAgo(new Date(NOW.getTime() + HOUR).toISOString(), NOW)).toBe('ahora');
    expect(timeAgo('not a date', NOW)).toBe('ahora');
  });
});

describe('badgeText', () => {
  it('hides the badge at zero and caps it at 99+', () => {
    expect(badgeText(0)).toBe('');
    expect(badgeText(-3)).toBe('');
    expect(badgeText(7)).toBe('7');
    expect(badgeText(99)).toBe('99');
    expect(badgeText(100)).toBe('99+');
  });
});

describe('channel switches (HU-034)', () => {
  const critical: LevelPreference = { severity: 'CRITICAL', inApp: true, push: true, email: true, sms: false };
  const warning: LevelPreference = { severity: 'WARNING', inApp: true, push: true, email: false, sms: false };

  it('a critical alert cannot lose the in-app channel, and SMS is not available yet', () => {
    expect(lockOf('CRITICAL', 'inApp')).toBe('always');
    expect(lockOf('INFO', 'sms')).toBe('soon');
    expect(lockOf('WARNING', 'push')).toBeNull();
    expect(toggleChannel(critical, 'inApp')).toBe(critical);
    expect(toggleChannel(critical, 'sms')).toBe(critical);
  });

  it('every other switch flips and leaves the rest alone', () => {
    expect(toggleChannel(critical, 'email')).toEqual({ ...critical, email: false });
    expect(toggleChannel(warning, 'email')).toEqual({ ...warning, email: true });
    expect(toggleChannel(warning, 'inApp')).toEqual({ ...warning, inApp: false });
  });
});

describe('inbox list helpers', () => {
  it('marks as read once, keeping the original read time', () => {
    const read = markedRead(notification('a'), NOW);
    expect(read.isRead).toBe(true);
    expect(read.readAt).toBe(NOW.toISOString());
    expect(markedRead(read, new Date('2030-01-01'))).toBe(read);
  });

  it('merging a page never repeats a notification', () => {
    const merged = mergePages([notification('a'), notification('b')], [notification('b'), notification('c')]);
    expect(merged.map((n) => n.id)).toEqual(['a', 'b', 'c']);
  });
});
