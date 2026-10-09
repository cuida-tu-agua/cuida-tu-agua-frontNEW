import { AdminUser, Page, isAdmin, percent, rangeLabel, unavailableLabels, userAction, fullName } from '../Admin';

const user = (overrides: Partial<AdminUser> = {}): AdminUser => ({
  id: 'u1',
  firstName: 'Ana',
  lastName: 'Ruiz',
  email: 'ana@mail.com',
  phone: null,
  status: 'ACTIVE',
  createdAt: '2026-10-01T10:00:00Z',
  blockedAt: null,
  blockedBy: null,
  ...overrides,
});

const page = (overrides: Partial<Page<AdminUser>> = {}): Page<AdminUser> => ({
  items: [user()], page: 0, size: 20, totalItems: 1, totalPages: 1, ...overrides,
});

describe('isAdmin', () => {
  it('only the ADMIN role of the token opens the administration', () => {
    expect(isAdmin(['USER', 'ADMIN'])).toBe(true);
    expect(isAdmin(['USER'])).toBe(false);
    expect(isAdmin([])).toBe(false);
    expect(isAdmin(undefined)).toBe(false);
  });
});

describe('userAction (HU-060)', () => {
  it('blocks a normal account and unblocks a blocked one', () => {
    expect(userAction(user({ status: 'ACTIVE' }), 'admin')).toBe('block');
    expect(userAction(user({ status: 'UNVERIFIED' }), 'admin')).toBe('block');
    expect(userAction(user({ status: 'BLOCKED' }), 'admin')).toBe('unblock');
  });

  it('an administrator gets no action on their own account', () => {
    expect(userAction(user({ id: 'admin' }), 'admin')).toBeNull();
  });
});

describe('rangeLabel (HU-059)', () => {
  it('shows which rows the page holds', () => {
    const items = Array.from({ length: 20 }, (_, i) => user({ id: `u${i}` }));
    expect(rangeLabel(page({ items, page: 0, totalItems: 54, totalPages: 3 }))).toBe('1–20 de 54');
    expect(rangeLabel(page({ items, page: 1, totalItems: 54, totalPages: 3 }))).toBe('21–40 de 54');
    expect(rangeLabel(page({ items: items.slice(0, 14), page: 2, totalItems: 54, totalPages: 3 }))).toBe('41–54 de 54');
  });

  it('an empty search says so', () => {
    expect(rangeLabel(page({ items: [], totalItems: 0, totalPages: 0 }))).toBe('0 resultados');
  });
});

describe('dashboard helpers (HU-062)', () => {
  it('percent is a whole number and never leaves 0-100', () => {
    expect(percent(5, 10)).toBe(50);
    expect(percent(1, 3)).toBe(33);
    expect(percent(0, 0)).toBe(0);
    expect(percent(12, 10)).toBe(100);
    expect(percent(-1, 10)).toBe(0);
  });

  it('names the sections that did not answer in Spanish', () => {
    expect(unavailableLabels(['devices', 'places'])).toEqual(['Dispositivos', 'Lugares']);
    expect(unavailableLabels(['other'])).toEqual(['other']);
  });

  it('full name drops the empty last name', () => {
    expect(fullName(user())).toBe('Ana Ruiz');
    expect(fullName(user({ lastName: '' }))).toBe('Ana');
  });
});
