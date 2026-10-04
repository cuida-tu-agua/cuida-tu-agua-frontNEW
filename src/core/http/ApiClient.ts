import axios, { AxiosError, AxiosInstance, CreateAxiosDefaults, InternalAxiosRequestConfig } from 'axios';
import { API_CONFIG, AUTH_ENDPOINTS, DEVICES_API_CONFIG, PLACES_API_CONFIG, PUBLIC_AUTH_PATHS } from '../../config/api';
import { AppError } from '../../domain/common/AppError';
import { Session } from '../../domain/entities/Auth';
import { toAppError } from '../../infrastructure/http/httpError';
import { tokenManager } from '../auth/TokenManager';

type SessionExpiredHandler = () => void;

let onSessionExpired: SessionExpiredHandler | null = null;

export const setSessionExpiredHandler = (handler: SessionExpiredHandler | null) => {
  onSessionExpired = handler;
};

const refreshClient = axios.create(API_CONFIG);

let refreshInFlight: Promise<string> | null = null;

export const refreshAccessToken = (): Promise<string> => {
  refreshInFlight ??= renewSession().finally(() => {
    refreshInFlight = null;
  });
  return refreshInFlight;
};

const renewSession = async (): Promise<string> => {
  const refreshToken = await tokenManager.getRefreshToken();
  if (!refreshToken) {
    throw new AppError('unauthorized', 'Tu sesión expiró. Inicia sesión de nuevo.');
  }

  try {
    const { data } = await refreshClient.post<Session>(AUTH_ENDPOINTS.REFRESH, { refreshToken });
    await tokenManager.saveSession(data);
    return data.accessToken;
  } catch (error) {
    const appError = toAppError(error);
    if (appError.kind === 'unauthorized' || appError.kind === 'forbidden') await expireSession();
    throw appError;
  }
};

const expireSession = async () => {
  await tokenManager.clear();
  onSessionExpired?.();
};

const isPublicAuthCall = (url: string | undefined) =>
  !!url && PUBLIC_AUTH_PATHS.some((path) => url.startsWith(path));

type RetriableConfig = InternalAxiosRequestConfig & { _retried?: boolean };

export const createApiClient = (config: CreateAxiosDefaults): AxiosInstance => {
  const client = axios.create(config);

  client.interceptors.request.use(async (request) => {
    if (isPublicAuthCall(request.url)) return request;

    let token = await tokenManager.getAccessToken();
    if (tokenManager.isExpiring(token) && (await tokenManager.getRefreshToken())) {
      
      token = await refreshAccessToken();
    }
    if (token) request.headers.Authorization = `Bearer ${token}`;
    return request;
  });

  client.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
      const original = error.config as RetriableConfig | undefined;
      const canRetry =
        error.response?.status === 401 && !!original && !original._retried && !original.url?.startsWith('/api/auth/');
      if (!canRetry) return Promise.reject(error);

      original._retried = true;
      try {
        const token = await refreshAccessToken();
        original.headers.Authorization = `Bearer ${token}`;
        return client(original);
      } catch (refreshError) {
        // Without internet say so; otherwise keep the original 401
        const offline = refreshError instanceof AppError && refreshError.kind === 'network';
        return Promise.reject(offline ? refreshError : error);
      }
    },
  );

  return client;
};

// One client per microservice (there is no API gateway yet).
export const apiClient = createApiClient(API_CONFIG); // ms-iam    :3001
export const placesApiClient = createApiClient(PLACES_API_CONFIG); // ms-places :3002
export const devicesApiClient = createApiClient(DEVICES_API_CONFIG); // ms-devices :3003
