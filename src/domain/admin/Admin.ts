/** Account state as an administrator sees it (HU-059). A temporary lock after failed logins is still ACTIVE. */
export type UserStatus = 'ACTIVE' | 'BLOCKED' | 'UNVERIFIED';

export interface AdminUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
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

export const isAdmin = (roles: readonly string[] | undefined | null): boolean => !!roles && roles.includes(ADMIN_ROLE);

export const STATUS_LABELS: Record<UserStatus, string> = {
  ACTIVE: 'Activa',
  BLOCKED: 'Bloqueada',
  UNVERIFIED: 'Sin verificar',
};

export type StatusFilter = UserStatus | 'ALL';

export const STATUS_FILTERS: { value: StatusFilter; label: string }[] = [
  { value: 'ALL', label: 'Todas' },
  { value: 'ACTIVE', label: 'Activas' },
  { value: 'BLOCKED', label: 'Bloqueadas' },
  { value: 'UNVERIFIED', label: 'Sin verificar' },
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

/** "1–20 de 54", "0 resultados". Pages start at 0 in the API. */
export const rangeLabel = (page: Page<unknown>): string => {
  if (page.totalItems === 0) return '0 resultados';
  const from = page.page * page.size + 1;
  const to = Math.min(from + page.items.length - 1, page.totalItems);
  return `${from}–${to} de ${page.totalItems}`;
};

/** Share of active ones as a whole percent for the bars of the dashboard (0 when there is nothing). */
export const percent = (part: number, total: number): number =>
  total <= 0 ? 0 : Math.max(0, Math.min(100, Math.round((part / total) * 100)));

export const SECTION_LABELS: Record<string, string> = { places: 'Lugares', devices: 'Dispositivos' };

/** Names, in Spanish, of the sections that did not answer. */
export const unavailableLabels = (names: string[]): string[] => names.map((n) => SECTION_LABELS[n] ?? n);
