import axios from 'axios';

const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL || 'http://10.3.233.57:8081';

console.log('API Base URL:', API_BASE_URL);

export const API_CONFIG = {
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
};

export const api = axios.create(API_CONFIG);

export const AUTH_ENDPOINTS = {
  REGISTER: '/api/auth/register',
  LOGIN: '/api/auth/login',
  REFRESH: '/api/auth/refresh',
  LOGOUT: '/api/auth/logout',
};

export const API_ENDPOINTS = {
  AUTH: AUTH_ENDPOINTS,
  USERS: '/api/users',
  DEVICES: '/api/devices',
  CONSUMPTION: '/api/consumption',
};
