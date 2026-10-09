import { serviceUrl } from './serviceUrl';

// One project for web and mobile. Each address comes from its EXPO_PUBLIC_* variable when it is set; otherwise
// serviceUrl() works it out (web: the host of the page; phone in development: the PC running Expo). See serviceUrl.ts.
const API_BASE_URL = serviceUrl(process.env.EXPO_PUBLIC_API_URL, 3001); // ms-iam
const PLACES_API_BASE_URL = serviceUrl(process.env.EXPO_PUBLIC_PLACES_API_URL, 3002); // ms-places
const DEVICES_API_BASE_URL = serviceUrl(process.env.EXPO_PUBLIC_DEVICES_API_URL, 3003); // ms-devices
const CONSUMPTION_API_BASE_URL = serviceUrl(process.env.EXPO_PUBLIC_CONSUMPTION_API_URL, 3004); // ms-consumption
const VALVE_API_BASE_URL = serviceUrl(process.env.EXPO_PUBLIC_VALVE_API_URL, 3005); // ms-valve
const NOTIFICATIONS_API_BASE_URL = serviceUrl(process.env.EXPO_PUBLIC_NOTIFICATIONS_API_URL, 3006); // ms-notification

export const API_CONFIG = {
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
};

export const PLACES_API_CONFIG = {
  ...API_CONFIG,
  baseURL: PLACES_API_BASE_URL,
};

export const DEVICES_API_CONFIG = {
  ...API_CONFIG,
  baseURL: DEVICES_API_BASE_URL,
};

export const CONSUMPTION_API_CONFIG = {
  ...API_CONFIG,
  baseURL: CONSUMPTION_API_BASE_URL,
};

export const VALVE_API_CONFIG = {
  ...API_CONFIG,
  baseURL: VALVE_API_BASE_URL,
};

export const NOTIFICATIONS_API_CONFIG = {
  ...API_CONFIG,
  baseURL: NOTIFICATIONS_API_BASE_URL,
};

export const AUTH_ENDPOINTS = {
  REGISTER: '/api/auth/register',
  VERIFY_EMAIL: '/api/auth/verify-email',
  RESEND_VERIFICATION: '/api/auth/verify-email/resend',
  LOGIN: '/api/auth/login',
  REFRESH: '/api/auth/refresh',
  LOGOUT: '/api/auth/logout',
  FORGOT_PASSWORD: '/api/auth/password/forgot',
  RESET_PASSWORD: '/api/auth/password/reset',
};

/** Endpoints that work WITHOUT a token (the same list as SecurityConfig.PUBLIC_POSTS in ms-iam). */
export const PUBLIC_AUTH_PATHS = [
  AUTH_ENDPOINTS.REGISTER,
  AUTH_ENDPOINTS.VERIFY_EMAIL, // also covers /verify-email/resend
  AUTH_ENDPOINTS.LOGIN,
  AUTH_ENDPOINTS.REFRESH,
  AUTH_ENDPOINTS.FORGOT_PASSWORD,
  AUTH_ENDPOINTS.RESET_PASSWORD,
];

export const PROFILE_ENDPOINTS = {
  ME: '/api/users/me',
  PASSWORD: '/api/users/me/password',
  AVATAR: '/api/users/me/avatar',
  /** HU-020: ms-iam e-mails a 6-digit code to confirm a sensitive action (closing the valve). */
  ACTION_CODES: '/api/users/me/action-codes',
};

export const PLACES_ENDPOINTS = {
  PLACES: '/api/places',
  PLACE: (placeId: string) => `/api/places/${placeId}`,
  DEFAULT: (placeId: string) => `/api/places/${placeId}/default`,
  COUNTRIES: '/api/geography/countries',
  SUBDIVISIONS: (countryCode: string) => `/api/geography/countries/${countryCode}/subdivisions`,
  CITIES: (subdivisionId: string) => `/api/geography/subdivisions/${subdivisionId}/cities`,
};

/** ms-devices: a place has at most ONE device, so the resource is singular. */
export const DEVICES_ENDPOINTS = {
  PLACE_DEVICE: (placeId: string) => `/api/places/${placeId}/device`,
};

/** ms-consumption (HU-015..018). period = day | week | month, tz = IANA zone of the phone. */
export const CONSUMPTION_ENDPOINTS = {
  PLACE_CONSUMPTION: (placeId: string) => `/api/places/${placeId}/consumption`,
};

/** ms-valve (HU-019..022). */
export const VALVE_ENDPOINTS = {
  VALVE: (placeId: string) => `/api/places/${placeId}/valve`,
  CLOSE: (placeId: string) => `/api/places/${placeId}/valve/close`,
  OPEN: (placeId: string) => `/api/places/${placeId}/valve/open`,
  COMMANDS: (placeId: string) => `/api/places/${placeId}/valve/commands`,
  COMMAND: (placeId: string, commandId: string) => `/api/places/${placeId}/valve/commands/${commandId}`,
};

/** ms-places: tariffs and cost (HU-054, HU-056, HU-066, HU-069). */
export const TARIFF_ENDPOINTS = {
  TARIFF: (placeId: string) => `/api/places/${placeId}/tariff`,
  MANUAL: (placeId: string) => `/api/places/${placeId}/tariff/manual`,
  CATALOG_CHOICE: (placeId: string) => `/api/places/${placeId}/tariff/catalog`,
  CATALOG: (cityId: string) => `/api/tariffs/catalog/cities/${cityId}`,
  COST: (placeId: string) => `/api/places/${placeId}/cost`,
};

/** ms-places: water saving tips, favorites and their administration (HU-063, HU-064, HU-065). */
export const TIP_ENDPOINTS = {
  TIPS: '/api/tips',
  FAVORITES: '/api/tips/favorites',
  FAVORITE: (tipId: string) => `/api/tips/${tipId}/favorite`,
  ADMIN: '/api/admin/tips',
  ADMIN_TIP: (tipId: string) => `/api/admin/tips/${tipId}`,
  ADMIN_ACTIVE: (tipId: string) => `/api/admin/tips/${tipId}/active`,
};

/** ms-iam, administrator only (HU-059, HU-060, HU-062). */
export const ADMIN_ENDPOINTS = {
  USERS: '/api/admin/users',
  BLOCK: (userId: string) => `/api/admin/users/${userId}/block`,
  UNBLOCK: (userId: string) => `/api/admin/users/${userId}/unblock`,
  METRICS: '/api/admin/metrics',
};

/** ms-notification (HU-025, HU-034): the inbox of the user and the channels they chose for each urgency level. */
export const NOTIFICATION_ENDPOINTS = {
  LIST: '/api/notifications',
  UNREAD_COUNT: '/api/notifications/unread-count',
  READ: (id: string) => `/api/notifications/${id}/read`,
  READ_ALL: '/api/notifications/read-all',
  PREFERENCES: '/api/notification-preferences',
  PREFERENCE: (severity: string) => `/api/notification-preferences/${severity}`,
};

/** ms-notification (HU-026): the Expo push token of this phone. */
export const PUSH_ENDPOINTS = {
  TOKENS: '/api/push-tokens',
};

/** Page served by the meter itself while it is in setup mode (its own WiFi network). */
export const DEVICE_SETUP_URL = 'http://192.168.4.1';

/** Photos are served by ms-iam: "/api/avatars/x.jpg" → full URL for <Image>. */
export const avatarUri = (avatarUrl: string | null): string | null =>
  avatarUrl ? `${API_BASE_URL}${avatarUrl}` : null;
