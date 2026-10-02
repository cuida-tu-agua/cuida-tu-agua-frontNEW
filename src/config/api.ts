import axios from 'axios';

// ms-iam (auth). On a physical phone use your PC's LAN IP, never "localhost".
const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL || 'http://192.168.20.180:8081';

// ms-places (place-service). Same host, port 3002.
const PLACES_API_BASE_URL =
  process.env.EXPO_PUBLIC_PLACES_API_URL || 'http://192.168.20.180:3002';

console.log('API Base URL:', API_BASE_URL);
console.log('Places API Base URL:', PLACES_API_BASE_URL);

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

export const api = axios.create(API_CONFIG);

export const AUTH_ENDPOINTS = {
  REGISTER: '/api/auth/register',
  LOGIN: '/api/auth/login',
  REFRESH: '/api/auth/refresh',
  LOGOUT: '/api/auth/logout',
};

export const PLACES_ENDPOINTS = {
  PLACES: '/api/places',
  PLACE: (placeId: string) => `/api/places/${placeId}`,
  COUNTRIES: '/api/geography/countries',
  SUBDIVISIONS: (countryCode: string) => `/api/geography/countries/${countryCode}/subdivisions`,
  CITIES: (subdivisionId: string) => `/api/geography/subdivisions/${subdivisionId}/cities`,
};

export const API_ENDPOINTS = {
  AUTH: AUTH_ENDPOINTS,
  USERS: '/api/users',
  DEVICES: '/api/devices',
  CONSUMPTION: '/api/consumption',
};
