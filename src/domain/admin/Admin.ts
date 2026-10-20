import i18n from '../../i18n';

/** Account state as an administrator sees it (HU-059). A temporary lock after failed logins is still ACTIVE. */
export type UserStatus = 'ACTIVE' | 'BLOCKED' | 'UNVERIFIED';

export interface AdminUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  /** USER and / or ADMIN (the "Rol" column of the panel). */
  roles: string[];
  status: UserStatus;
  createdAt: string; // ISO 8601, UTC
  blockedAt: string | null;
  blockedBy: string | null;
}

export interface Page<T> {
  items: T[];
  page: number; // starts at 0
  size: number;
  totalItems: number;
  totalPages: number;
}

export interface UserQuery {
  search?: string;
  /** null / undefined = every status. */
  status?: UserStatus | null;
  page?: number;
  size?: number;
}

export interface UserCounts {
  total: number;
  active: number;
  inactive: number;
  blocked: number;
  unverified: number;
}

export interface PlaceCounts {
  total: number;
  active: number;
  inactive: number;
}

export interface DeviceCounts {
  total: number;
  active: number;
  inactive: number;
  linked: number;
}

/**
 * HU-062. A section is null when its service did not answer (its name is then in `unavailable`);
 * users always come because they are ms-iam's own data.
 */
export interface PlatformMetrics {
  generatedAt: string;
  users: UserCounts;
  places: PlaceCounts | null;
  devices: DeviceCounts | null;
  unavailable: string[];
}

export const ADMIN_ROLE = 'ADMIN';

/** What the Rol column says: an account that has the ADMIN role is an administrator, any other is a user. */
export const roleLabel = (roles: readonly string[] | undefined | null): string =>
  i18n.t(isAdmin(roles) ? 'admin.role.ADMIN' : 'admin.role.USER');

export const isAdmin = (roles: readonly string[] | undefined | null): boolean => !!roles && roles.includes(ADMIN_ROLE);

/** Getters, so the text follows the language active when it is read. */
export const STATUS_LABELS: Record<UserStatus, string> = {
  get ACTIVE() {
    return i18n.t('admin.userStatus.ACTIVE');
  },
  get BLOCKED() {
    return i18n.t('admin.userStatus.BLOCKED');
  },
  get UNVERIFIED() {
    return i18n.t('admin.userStatus.UNVERIFIED');
  },
};

export type StatusFilter = UserStatus | 'ALL';

const statusFilter = (value: StatusFilter): { value: StatusFilter; label: string } => ({
  value,
  get label() {
    return i18n.t(`admin.userFilter.${value}`);
  },
});

export const STATUS_FILTERS: { value: StatusFilter; label: string }[] = [
  statusFilter('ALL'),
  statusFilter('ACTIVE'),
  statusFilter('BLOCKED'),
  statusFilter('UNVERIFIED'),
];

export const SEARCH_MAX = 100;
export const DEFAULT_PAGE_SIZE = 20;

export const fullName = (user: Pick<AdminUser, 'firstName' | 'lastName'>): string =>
  `${user.firstName} ${user.lastName}`.trim();

/** An administrator cannot block themselves (the server refuses it too), and a blocked account is only unblocked. */
export const userAction = (user: Pick<AdminUser, 'id' | 'status'>, adminId: string | undefined): 'block' | 'unblock' | null => {
  if (user.id === adminId) return null;
  return user.status === 'BLOCKED' ? 'unblock' : 'block';
};

/** "1–20 de 54" / "1–20 of 54", "0 resultados" / "0 results". Pages start at 0 in the API. */
export const rangeLabel = (page: Page<unknown>): string => {
  if (page.totalItems === 0) return i18n.t('admin.noResults');
  const from = page.page * page.size + 1;
  const to = Math.min(from + page.items.length - 1, page.totalItems);
  return i18n.t('admin.range', { from, to, total: page.totalItems });
};

/** Share of active ones as a whole percent for the bars of the dashboard (0 when there is nothing). */
export const percent = (part: number, total: number): number =>
  total <= 0 ? 0 : Math.max(0, Math.min(100, Math.round((part / total) * 100)));

const SECTION_KEYS = ['places', 'devices'];

/** Names, in the current language, of the sections that did not answer. */
export const unavailableLabels = (names: string[]): string[] =>
  names.map((n) => (SECTION_KEYS.includes(n) ? i18n.t(`admin.section.${n}`) : n));
