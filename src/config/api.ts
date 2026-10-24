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
  /** HU-004 "Continuar con Google": status (show the button?), start (opened in the browser), exchange (code → session). */
  GOOGLE_STATUS: '/api/auth/google/status',
  GOOGLE_START: '/api/auth/google/start',
  GOOGLE_EXCHANGE: '/api/auth/google/exchange',
};

/** Endpoints that work WITHOUT a token (the same list as SecurityConfig.PUBLIC_POSTS in ms-iam). */
export const PUBLIC_AUTH_PATHS = [
  AUTH_ENDPOINTS.REGISTER,
  AUTH_ENDPOINTS.VERIFY_EMAIL, // also covers /verify-email/resend
  AUTH_ENDPOINTS.LOGIN,
  AUTH_ENDPOINTS.REFRESH,
  AUTH_ENDPOINTS.FORGOT_PASSWORD,
  AUTH_ENDPOINTS.RESET_PASSWORD,
  '/api/auth/google', // status, start, callback and exchange
];

export const PROFILE_ENDPOINTS = {
  ME: '/api/users/me',
  PASSWORD: '/api/users/me/password',
  AVATAR: '/api/users/me/avatar',
  /** HU-020: ms-iam e-mails a 6-digit code to confirm a sensitive action (closing the valve). */
  ACTION_CODES: '/api/users/me/action-codes',
  /** Which ways the account can sign in: password, Google or both. */
  SIGN_IN_METHODS: '/api/users/me/sign-in-methods',
  /** HU-004: Google's consent page to confirm the account before deleting it. */
  GOOGLE_REAUTH: '/api/users/me/account/google-reauth',
  /** HU-028: a code to verify the phone by SMS or WhatsApp, then its confirmation. */
  PHONE_VERIFICATION: '/api/users/me/phone-verification',
  PHONE_VERIFICATION_CONFIRM: '/api/users/me/phone-verification/confirm',
};

export const PLACES_ENDPOINTS = {
  PLACES: '/api/places',
  PLACE: (placeId: string) => `/api/places/${placeId}`,
  DEFAULT: (placeId: string) => `/api/places/${placeId}/default`,
  COUNTRIES: '/api/geography/countries',
  SUBDIVISIONS: (countryCode: string) => `/api/geography/countries/${countryCode}/subdivisions`,
  CITIES: (subdivisionId: string) => `/api/geography/subdivisions/${subdivisionId}/cities`,
};

/** ms-places: sharing a place (HU-039..HU-047). Guest calls need no token; the rest are the signed-in person's. */
export const SHARING_ENDPOINTS = {
  ACCESS: (placeId: string) => `/api/places/${placeId}/access`,
  MEMBERSHIP: (placeId: string) => `/api/places/${placeId}/membership`,
  GUEST_LINK: (placeId: string) => `/api/places/${placeId}/guest-link`,
  INVITATIONS: (placeId: string) => `/api/places/${placeId}/invitations`,
  INVITATION: (placeId: string, invitationId: string) => `/api/places/${placeId}/invitations/${invitationId}`,
  MEMBERS: (placeId: string) => `/api/places/${placeId}/members`,
  MEMBER: (placeId: string, memberId: string) => `/api/places/${placeId}/members/${memberId}`,
  MEMBER_PERMISSIONS: (placeId: string, memberId: string) => `/api/places/${placeId}/members/${memberId}/permissions`,
  SHARED_PLACES: '/api/shared-places',
  INBOX: '/api/invitations',
  ACCEPT: (invitationId: string) => `/api/invitations/${invitationId}/accept`,
  REJECT: (invitationId: string) => `/api/invitations/${invitationId}/reject`,
  GUEST_PLACE: (token: string) => `/api/guest/${encodeURIComponent(token)}`,
  GUEST_CONSUMPTION: (token: string) => `/api/guest/${encodeURIComponent(token)}/consumption`,
};

/** ms-devices: a place has at most ONE device, so the resource is singular. */
export const DEVICES_ENDPOINTS = {
  PLACE_DEVICE: (placeId: string) => `/api/places/${placeId}/device`,
};

/** ms-consumption (HU-015..018). period = day | week | month, tz = IANA zone of the phone. */
export const CONSUMPTION_ENDPOINTS = {
  PLACE_CONSUMPTION: (placeId: string) => `/api/places/${placeId}/consumption`,
  /** HU-023/024: GET progress / PUT { targetLiters } of the current month. tz = IANA zone of the phone. */
  PLACE_GOAL: (placeId: string) => `/api/places/${placeId}/goals/current`,
};

/** ms-notification: the WhatsApp / SMS texts (administrator) and the ones the app fills in itself (guest link). */
export const MESSAGE_TEMPLATE_ENDPOINTS = {
  ADMIN: '/api/admin/message-templates',
  ADMIN_ONE: (key: string) => `/api/admin/message-templates/${key}`,
  SHARED: (key: string) => `/api/message-templates/${key}`,
  TEST: (key: string) => `/api/admin/message-templates/${key}/test`,
  PROVIDERS: '/api/admin/message-templates/providers',
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

/** ms-device, administrator only: the meters of the whole platform. */
export const ADMIN_DEVICE_ENDPOINTS = {
  LIST: '/api/admin/devices',
  ONE: (id: string) => `/api/admin/devices/${id}`,
  CREDENTIALS: (id: string) => `/api/admin/devices/${id}/credentials`,
  DECOMMISSION: (id: string) => `/api/admin/devices/${id}/decommission`,
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
