import { AxiosError, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { AppError } from '../../../domain/common/AppError';
import { changeLanguage } from '../../../i18n';
import { messageForCode, toAppError } from '../httpError';

/** Builds an AxiosError like the ones axios throws for an HTTP response. */
const httpError = (status: number, data: unknown): AxiosError => {
  const config = { headers: {} } as InternalAxiosRequestConfig;
  const response = { status, data, statusText: '', headers: {}, config } as AxiosResponse;
  return new AxiosError(`Request failed with status code ${status}`, 'ERR_BAD_REQUEST', config, {}, response);
};

describe('toAppError', () => {
  it('network error (no response) → kind "network"', () => {
    const error = new AxiosError('Network Error', 'ERR_NETWORK');
    expect(toAppError(error).kind).toBe('network');
  });

  it('401 → kind "unauthorized"', () => {
    expect(toAppError(httpError(401, null)).kind).toBe('unauthorized');
  });

  it('404 with place.not_found → Spanish message', () => {
    const result = toAppError(httpError(404, { title: 'place.not_found', status: 404 }));
    expect(result.kind).toBe('not_found');
    expect(result.message).toBe('El lugar no existe o no te pertenece.');
  });

  it('400 ValidationProblemDetails → one error per field, keys in camelCase', () => {
    const result = toAppError(
      httpError(400, {
        title: 'One or more validation errors occurred.',
        errors: { Name: ['The Name field is required.'], CityId: ['The CityId field is required.'] },
      }),
    );
    expect(result.kind).toBe('validation');
    expect(Object.keys(result.fieldErrors).sort()).toEqual(['cityId', 'name']);
  });

  it('400 JSON conversion error ("$.type") → field "type"', () => {
    const result = toAppError(
      httpError(400, { errors: { '$.type': ['The JSON value could not be converted'] } }),
    );
    expect(result.fieldErrors.type).toBeDefined();
  });

  it('400 city.not_found → error on the city field', () => {
    const result = toAppError(httpError(400, { title: 'city.not_found', status: 400 }));
    expect(result.fieldErrors.cityId).toBe('La ciudad seleccionada no existe. Vuelve a elegirla.');
  });

  it('500 → kind "server"', () => {
    expect(toAppError(httpError(500, '')).kind).toBe('server');
  });

  it('an AppError passes through unchanged', () => {
    const original = new AppError('network', 'x');
    expect(toAppError(original)).toBe(original);
  });
});
describe('toAppError in English (HU-076)', () => {
  beforeEach(async () => { await changeLanguage('en'); });

  it('a known code shows its English message', () => {
    const result = toAppError(httpError(404, { title: 'place.not_found', status: 404 }));
    expect(result.message).toBe('The place does not exist or is not yours.');
    expect(result.code).toBe('place.not_found');
  });

  it('an account locked by the service is explained in English', () => {
    const result = toAppError(httpError(423, { title: 'auth.account_locked', status: 423 }));
    expect(result.message).toMatch(/locked your account/);
  });

  it('remaining attempts use the English plural', () => {
    expect(toAppError(httpError(401, { title: 'auth.wrong_password', remainingAttempts: 1 })).message).toBe('Wrong password. 1 attempt left.');
    expect(toAppError(httpError(401, { title: 'auth.wrong_password', remainingAttempts: 3 })).message).toBe('Wrong password. 3 attempts left.');
  });

  it('a lock with a wait time says how long to wait', () => {
    const result = toAppError(httpError(429, { title: 'device.too_many_attempts', retryAfterSeconds: 840 }));
    expect(result.message).toMatch(/Try again in 14 min\.$/);
  });

  it('an unknown code falls back to a generic message of its kind, in English', () => {
    const result = toAppError(httpError(409, { title: 'something.new', status: 409 }));
    expect(result.message).toBe('That value already exists.');
    expect(toAppError(httpError(500, null)).message).toBe('A server error occurred. Try again later.');
  });

  it('field errors and network errors are in English', () => {
    expect(toAppError(httpError(400, { errors: { Name: ['x'], Weird: ['y'] } })).fieldErrors).toEqual({
      name: 'Check the name.',
      weird: 'Invalid value.',
    });
    expect(toAppError(new AxiosError('Network Error', 'ERR_NETWORK')).message).toMatch(/Could not connect/);
  });

  it('a code that came in a URL is translated too', () => {
    expect(messageForCode('auth.google_cancelled')).toBe('You cancelled the sign-in with Google.');
    expect(messageForCode('nope')).toBe('A server error occurred. Try again later.');
  });
});
