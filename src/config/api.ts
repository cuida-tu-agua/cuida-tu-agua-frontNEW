// On a physical phone use your PC's LAN IP, never "localhost". Values come from .env.
const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://192.168.20.180:3001'; // ms-iam
const PLACES_API_BASE_URL = process.env.EXPO_PUBLIC_PLACES_API_URL || 'http://192.168.20.180:3002'; // ms-places

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
};

export const PLACES_ENDPOINTS = {
  PLACES: '/api/places',
  PLACE: (placeId: string) => `/api/places/${placeId}`,
  DEFAULT: (placeId: string) => `/api/places/${placeId}/default`,
  COUNTRIES: '/api/geography/countries',
  SUBDIVISIONS: (countryCode: string) => `/api/geography/countries/${countryCode}/subdivisions`,
  CITIES: (subdivisionId: string) => `/api/geography/subdivisions/${subdivisionId}/cities`,
};

/** Photos are served by ms-iam: "/api/avatars/x.jpg" → full URL for <Image>. */
export const avatarUri = (avatarUrl: string | null): string | null =>
  avatarUrl ? `${API_BASE_URL}${avatarUrl}` : null;
