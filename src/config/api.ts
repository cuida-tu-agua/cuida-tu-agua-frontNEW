// On a physical phone use your PC's LAN IP, never "localhost". Values come from .env.
const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://192.168.20.180:3001'; // ms-iam
const PLACES_API_BASE_URL = process.env.EXPO_PUBLIC_PLACES_API_URL || 'http://192.168.20.180:3002'; // ms-places
const DEVICES_API_BASE_URL = process.env.EXPO_PUBLIC_DEVICES_API_URL || 'http://192.168.20.180:3003'; // ms-devices
const CONSUMPTION_API_BASE_URL = process.env.EXPO_PUBLIC_CONSUMPTION_API_URL || 'http://192.168.20.180:3004'; // ms-consumption
const VALVE_API_BASE_URL = process.env.EXPO_PUBLIC_VALVE_API_URL || 'http://192.168.20.180:3005'; // ms-valve

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

/** Page served by the meter itself while it is in setup mode (its own WiFi network). */
export const DEVICE_SETUP_URL = 'http://192.168.4.1';

/** Photos are served by ms-iam: "/api/avatars/x.jpg" → full URL for <Image>. */
export const avatarUri = (avatarUrl: string | null): string | null =>
  avatarUrl ? `${API_BASE_URL}${avatarUrl}` : null;
