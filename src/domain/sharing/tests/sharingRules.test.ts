import { PERMISSIONS, PlaceAccess } from '../Sharing';
import {
  can,
  canControlValve,
  canSeeValve,
  isOwner,
  isValidInviteEmail,
  normalizeEmail,
  pendingInvitations,
  samePermissions,
  togglePermission,
  withRequired,
} from '../sharingRules';

const owner: PlaceAccess = { placeId: 'p', role: 'OWNER', permissions: [] };
const collaborator = (...permissions: PlaceAccess['permissions']): PlaceAccess => ({ placeId: 'p', role: 'COLLABORATOR', permissions });

describe('invite e-mail', () => {
  it.each(['juan@mail.com', '  juan@mail.com  ', 'a.b+c@sub.mail.co'])('accepts %p', (email) => {
    expect(isValidInviteEmail(email)).toBe(true);
  });

  it.each(['', '   ', 'juan', 'juan@', '@mail.com', 'juan@mail', 'ju an@mail.com', `${'a'.repeat(250)}@mail.com`])('rejects %p', (email) => {
    expect(isValidInviteEmail(email)).toBe(false);
  });

  it('is sent trimmed and in lower case', () => {
    expect(normalizeEmail('  Juan@Mail.COM ')).toBe('juan@mail.com');
  });
});

describe('permissions to send', () => {
  it('always include VIEW_CONSUMPTION, without repeats and in the display order', () => {
    expect(withRequired([])).toEqual(['VIEW_CONSUMPTION']);
    expect(withRequired(['VIEW_BILLS', 'CONTROL_VALVE', 'CONTROL_VALVE'])).toEqual(['VIEW_CONSUMPTION', 'CONTROL_VALVE', 'VIEW_BILLS']);
  });

  it('toggling adds and removes one permission', () => {
    const added = togglePermission(['VIEW_CONSUMPTION'], 'CONTROL_VALVE');
    expect(added).toEqual(['VIEW_CONSUMPTION', 'CONTROL_VALVE']);
    expect(togglePermission(added, 'CONTROL_VALVE')).toEqual(['VIEW_CONSUMPTION']);
  });

  it('VIEW_CONSUMPTION cannot be turned off', () => {
    expect(togglePermission(['VIEW_CONSUMPTION', 'VIEW_BILLS'], 'VIEW_CONSUMPTION')).toEqual(['VIEW_CONSUMPTION', 'VIEW_BILLS']);
  });

  it('two selections are the same regardless of order or the implicit consumption permission', () => {
    expect(samePermissions(['VIEW_BILLS', 'VIEW_CONSUMPTION'], ['VIEW_CONSUMPTION', 'VIEW_BILLS'])).toBe(true);
    expect(samePermissions([], ['VIEW_CONSUMPTION'])).toBe(true);
    expect(samePermissions(['VIEW_BILLS'], ['CONTROL_VALVE'])).toBe(false);
  });

  it('are the five the server knows', () => {
    expect(PERMISSIONS).toEqual(['VIEW_CONSUMPTION', 'VIEW_DEVICE_STATUS', 'CONTROL_VALVE', 'VIEW_ALERTS', 'VIEW_BILLS']);
  });
});

describe('what the person may do', () => {
  it('the owner may do everything', () => {
    expect(isOwner(owner)).toBe(true);
    PERMISSIONS.forEach((permission) => expect(can(owner, permission)).toBe(true));
  });

  it('a collaborator may do only what they were given', () => {
    const access = collaborator('VIEW_CONSUMPTION', 'VIEW_BILLS');
    expect(isOwner(access)).toBe(false);
    expect(can(access, 'VIEW_BILLS')).toBe(true);
    expect(can(access, 'CONTROL_VALVE')).toBe(false);
  });

  it('without access data nothing is allowed', () => {
    expect(can(null, 'VIEW_CONSUMPTION')).toBe(false);
    expect(can(undefined, 'VIEW_CONSUMPTION')).toBe(false);
    expect(isOwner(null)).toBe(false);
  });

  it('the valve is seen with the status or the control permission, and operated only with the control one', () => {
    expect(canSeeValve(collaborator('VIEW_CONSUMPTION'))).toBe(false);
    expect(canSeeValve(collaborator('VIEW_CONSUMPTION', 'VIEW_DEVICE_STATUS'))).toBe(true);
    expect(canControlValve(collaborator('VIEW_CONSUMPTION', 'VIEW_DEVICE_STATUS'))).toBe(false);
    expect(canSeeValve(collaborator('VIEW_CONSUMPTION', 'CONTROL_VALVE'))).toBe(true);
    expect(canControlValve(collaborator('VIEW_CONSUMPTION', 'CONTROL_VALVE'))).toBe(true);
    expect(canControlValve(owner)).toBe(true);
  });
});

describe('invitations', () => {
  it('only the pending ones are kept', () => {
    const base = { email: 'a@b.co', permissions: [], expiresAt: '', createdAt: '', respondedAt: null };
    const list = [
      { ...base, id: '1', status: 'PENDING' as const },
      { ...base, id: '2', status: 'ACCEPTED' as const },
      { ...base, id: '3', status: 'EXPIRED' as const },
    ];
    expect(pendingInvitations(list).map((i) => i.id)).toEqual(['1']);
  });
});
