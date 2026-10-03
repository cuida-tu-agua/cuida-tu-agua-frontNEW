import { AxiosError, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { toAppError } from '../httpError';

const httpError = (status: number, data: unknown, headers: Record<string, string> = {}): AxiosError => {
  const config = { headers: {} } as InternalAxiosRequestConfig;
  const response = { status, data, statusText: '', headers, config } as AxiosResponse;
  return new AxiosError(`Request failed with status code ${status}`, 'ERR_BAD_REQUEST', config, {}, response);
};

// HU-003: "mensajes diferenciados" — each ms-iam code becomes its own Spanish message
describe('toAppError with ms-iam codes', () => {
  it('wrong password → message on the password field with the attempts left', () => {
    const error = toAppError(httpError(401, { title: 'auth.wrong_password', remainingAttempts: 2 }));
    expect(error.kind).toBe('unauthorized');
    expect(error.code).toBe('auth.wrong_password');
    expect(error.fieldErrors.password).toBe('Contraseña incorrecta. Te quedan 2 intentos.');
    expect(error.details.remainingAttempts).toBe(2);
  });

  it('e-mail not found → message on the e-mail field', () => {
    const error = toAppError(httpError(401, { title: 'auth.email_not_found' }));
    expect(error.fieldErrors.email).toBe('No encontramos una cuenta con este correo.');
  });

  it('account locked (423) → kind "locked" with the unlock date', () => {
    const error = toAppError(httpError(423, { title: 'auth.account_locked', lockedUntil: '2026-09-29T12:15:00Z' }));
    expect(error.kind).toBe('locked');
    expect(error.details.lockedUntil).toBe('2026-09-29T12:15:00Z');
  });

  it('not verified (403) → kind "forbidden" and its own code', () => {
    const error = toAppError(httpError(403, { title: 'auth.account_not_verified' }));
    expect(error.kind).toBe('forbidden');
    expect(error.code).toBe('auth.account_not_verified');
  });

  it('weak password → the missing rules in Spanish', () => {
    const error = toAppError(httpError(400, { title: 'user.weak_password', unmetRules: ['UPPERCASE', 'SPECIAL'] }));
    expect(error.fieldErrors.password).toBe('A la contraseña le falta una mayúscula y un símbolo (!@#$...).');
  });

  it('code asked too soon (429) → seconds to wait, from the body or the Retry-After header', () => {
    expect(toAppError(httpError(429, { title: 'auth.code_recently_sent', retryAfterSeconds: 42 })).details.retryAfterSeconds).toBe(42);
    expect(toAppError(httpError(429, { title: 'auth.code_recently_sent' }, { 'retry-after': '30' })).details.retryAfterSeconds).toBe(30);
  });

  it('e-mail already registered (409) → e-mail field', () => {
    const error = toAppError(httpError(409, { title: 'auth.email_already_registered' }));
    expect(error.kind).toBe('conflict');
    expect(error.fieldErrors.email).toBe('Este correo ya está registrado.');
  });

  it('@Valid errors of ms-iam use the same "errors" map as ASP.NET', () => {
    const error = toAppError(httpError(400, { title: 'validation.failed', errors: { firstName: ['must not be blank'] } }));
    expect(error.fieldErrors.firstName).toBe('Revisa tu nombre.');
  });

  it('place with a device (409) → explains what to do', () => {
    const error = toAppError(httpError(409, { title: 'place.has_active_device' }));
    expect(error.message).toContain('Desvincúlalo');
  });
});
