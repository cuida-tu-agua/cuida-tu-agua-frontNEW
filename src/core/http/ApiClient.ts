// src/core/http/ApiClient.ts

import axios, { AxiosError, AxiosInstance, CreateAxiosDefaults } from 'axios';
import { API_CONFIG, PLACES_API_CONFIG } from '../../config/api';
import { tokenManager } from '../auth/TokenManager';

type UnauthorizedHandler = () => void | Promise<void>;

let onUnauthorized: UnauthorizedHandler | null = null;


export const setUnauthorizedHandler = (handler: UnauthorizedHandler | null) => {
  onUnauthorized = handler;
};


export const createApiClient = (config: CreateAxiosDefaults): AxiosInstance => {
  const client = axios.create(config);

  client.interceptors.request.use(async (request) => {
    const token = await tokenManager.getToken();
    if (token) {
      request.headers.Authorization = `Bearer ${token}`;
    }
    return request;
  });

  client.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
      if (error.response?.status === 401 && onUnauthorized) {
        await onUnauthorized();
      }
      return Promise.reject(error);
    },
  );

  return client;
};

// One client per microservice (there is no API gateway yet).
export const apiClient = createApiClient(API_CONFIG);              // ms-iam  :8081
export const placesApiClient = createApiClient(PLACES_API_CONFIG); // ms-places :3002