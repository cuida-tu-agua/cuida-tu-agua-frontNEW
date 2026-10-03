import axios, { AxiosError, AxiosResponse, InternalAxiosRequestConfig } from 'axios';

// In-memory secure storage: the real one needs a phone
jest.mock('../../auth/TokenManager', () => {
  const store: { access: string | null; refresh: string | null } = { access: null, refresh: null };
  return {
    tokenManager: {
      store,
      getAccessToken: jest.fn(async () => store.access),
      getRefreshToken: jest.fn(async () => store.refresh),
      saveSession: jest.fn(async (s: { accessToken: string; refreshToken: string }) => {
        store.access = s.accessToken;
        store.refresh = s.refreshToken;
      }),
      isExpiring: jest.fn((token: string | null) => !token),
      clear: jest.fn(async () => {
        store.access = null;
        store.refresh = null;
      }),
    },
  };
});

// Every request of every axios instance goes through this fake server
type Handler = (config: InternalAxiosRequestConfig) => Promise<AxiosResponse>;
let server: Handler;
axios.defaults.adapter = (config) => server(config);

/* eslint-disable @typescript-eslint/no-require-imports */
const { createApiClient, setSessionExpiredHandler } = require('../ApiClient') as typeof import('../ApiClient');
const { tokenManager } = require('../../auth/TokenManager');
/* eslint-enable @typescript-eslint/no-require-imports */

const ok = (config: InternalAxiosRequestConfig, data: unknown): AxiosResponse =>
  ({ data, status: 200, statusText: 'OK', headers: {}, config }) as AxiosResponse;

const fail = (config: InternalAxiosRequestConfig, status: number, data: unknown = {}) =>
  Promise.reject(
    new AxiosError('fail', 'ERR_BAD_RESPONSE', config, {}, { data, status, statusText: '', headers: {}, config } as AxiosResponse),
  );

const auth = (config: InternalAxiosRequestConfig) => config.headers?.Authorization as string | undefined;

const session = (access: string, refresh: string) => ({
  accessToken: access,
  refreshToken: refresh,
  accessExpiresAt: '',
  refreshExpiresAt: '',
  user: { id: 'u1', firstName: 'Ana', lastName: 'Ríos', email: 'ana@correo.com' },
});

describe('ApiClient: renewing the session (HU-003)', () => {
  const onExpired = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    tokenManager.store.access = 'old-access';
    tokenManager.store.refresh = 'refresh-1';
    setSessionExpiredHandler(onExpired);
  });

  it('three 401 at the same time → ONE refresh, and the three requests are repeated with the new token', async () => {
    let refreshCalls = 0;
    server = async (config) => {
      if (config.url === '/api/auth/refresh') {
        refreshCalls++;
        await new Promise((resolve) => setTimeout(resolve, 10));
        return ok(config, session('new-access', 'refresh-2'));
      }
      return auth(config) === 'Bearer new-access' ? ok(config, 'data') : fail(config, 401);
    };
    const client = createApiClient({ baseURL: 'http://test' });

    const results = await Promise.all([client.get('/a'), client.get('/b'), client.get('/c')]);

    expect(refreshCalls).toBe(1);
    expect(results.map((r) => r.data)).toEqual(['data', 'data', 'data']);
    expect(tokenManager.store.refresh).toBe('refresh-2');
    expect(onExpired).not.toHaveBeenCalled();
  });

  it('a rejected refresh token ends the session and the original request fails', async () => {
    server = async (config) =>
      config.url === '/api/auth/refresh' ? fail(config, 401, { title: 'auth.invalid_refresh_token' }) : fail(config, 401);
    const client = createApiClient({ baseURL: 'http://test' });

    await expect(client.get('/a')).rejects.toMatchObject({ response: { status: 401 } });
    expect(tokenManager.clear).toHaveBeenCalled();
    expect(onExpired).toHaveBeenCalledTimes(1);
  });

  it('without internet the session is NOT closed (it can be renewed later)', async () => {
    server = async (config) =>
      config.url === '/api/auth/refresh'
        ? Promise.reject(new AxiosError('Network Error', 'ERR_NETWORK', config))
        : fail(config, 401);
    const client = createApiClient({ baseURL: 'http://test' });

    // The user sees "no connection", not a misleading "your session expired"
    await expect(client.get('/a')).rejects.toMatchObject({ kind: 'network' });
    expect(tokenManager.clear).not.toHaveBeenCalled();
    expect(onExpired).not.toHaveBeenCalled();
  });

  it('an expired access token is renewed BEFORE sending; without internet the request is not sent', async () => {
    tokenManager.store.access = null; // isExpiring(null) → true
    let sentToServer = 0;
    server = async (config) => {
      if (config.url === '/api/auth/refresh') return Promise.reject(new AxiosError('Network Error', 'ERR_NETWORK', config));
      sentToServer++;
      return ok(config, 'data');
    };
    const client = createApiClient({ baseURL: 'http://test' });

    await expect(client.get('/a')).rejects.toMatchObject({ kind: 'network' });
    expect(sentToServer).toBe(0);
  });

  it('login is public: no token is sent and a 401 there is NOT treated as an expired session', async () => {
    let sentAuthorization: string | undefined = 'not called';
    let refreshCalls = 0;
    server = async (config) => {
      if (config.url === '/api/auth/refresh') refreshCalls++;
      sentAuthorization = auth(config);
      return fail(config, 401, { title: 'auth.wrong_password', remainingAttempts: 4 });
    };
    const client = createApiClient({ baseURL: 'http://test' });

    await expect(client.post('/api/auth/login', {})).rejects.toMatchObject({ response: { status: 401 } });
    expect(sentAuthorization).toBeUndefined();
    expect(refreshCalls).toBe(0);
  });
});
