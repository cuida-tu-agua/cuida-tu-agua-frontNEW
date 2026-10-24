import { ALWAYS_GRANTED, Invitation, Permission, PERMISSIONS, PlaceAccess } from './Sharing';

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
export const EMAIL_MAX_LENGTH = 254;

/** True when the text looks like an e-mail address. The server decides whether the person has an account. */
export const isValidInviteEmail = (text: string): boolean => {
  const email = text.trim();
  return email.length > 0 && email.length <= EMAIL_MAX_LENGTH && EMAIL.test(email);
};

export const normalizeEmail = (text: string): string => text.trim().toLowerCase();

/** The permissions to send: always VIEW_CONSUMPTION, no repeats, in the display order. */
export const withRequired = (chosen: readonly Permission[]): Permission[] =>
  PERMISSIONS.filter((permission) => permission === ALWAYS_GRANTED || chosen.includes(permission));

/** Adds or removes one permission from the selection; the always-granted one cannot be removed. */
export const togglePermission = (current: readonly Permission[], permission: Permission): Permission[] => {
  if (permission === ALWAYS_GRANTED) return withRequired(current);
  return withRequired(current.includes(permission) ? current.filter((p) => p !== permission) : [...current, permission]);
};

export const samePermissions = (a: readonly Permission[], b: readonly Permission[]): boolean => {
  const left = withRequired(a);
  const right = withRequired(b);
  return left.length === right.length && left.every((permission, index) => permission === right[index]);
};

/** The owner can do everything; a collaborator only what they were given. Without access data nothing is allowed. */
export const can = (access: PlaceAccess | null | undefined, permission: Permission): boolean =>
  !!access && (access.role === 'OWNER' || access.permissions.includes(permission));

export const isOwner = (access: PlaceAccess | null | undefined): boolean => access?.role === 'OWNER';

/** Opening or closing the valve is allowed with CONTROL_VALVE; seeing it needs that or VIEW_DEVICE_STATUS. */
export const canControlValve = (access: PlaceAccess | null | undefined): boolean => can(access, 'CONTROL_VALVE');
export const canSeeValve = (access: PlaceAccess | null | undefined): boolean =>
  can(access, 'CONTROL_VALVE') || can(access, 'VIEW_DEVICE_STATUS');

export const pendingInvitations = (invitations: readonly Invitation[]): Invitation[] =>
  invitations.filter((invitation) => invitation.status === 'PENDING');
