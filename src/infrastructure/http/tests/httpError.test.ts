import { AxiosError, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { AppError } from '../../../domain/common/AppError';
import { toAppError } from '../httpError';

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