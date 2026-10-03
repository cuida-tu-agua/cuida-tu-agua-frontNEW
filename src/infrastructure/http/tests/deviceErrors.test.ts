import { AxiosError, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { toAppError } from '../httpError';

const httpError = (status: number, data: unknown, headers: Record<string, string> = {}): AxiosError => {
  const config = { headers: {} } as InternalAxiosRequestConfig;
  const response = { status, data, statusText: '', headers, config } as AxiosResponse;
  return new AxiosError(`Request failed with status code ${status}`, 'ERR_BAD_REQUEST', config, {}, response);
};

// HU-012/013/014: each ms-devices code becomes its own Spanish message
describe('toAppError with ms-devices codes', () => {
  it('meter off (409 device.offline) → tells the user what to do', () => {
    const error = toAppError(httpError(409, { title: 'device.offline' }));
    expect(error.kind).toBe('conflict');
    expect(error.message).toMatch(/Enciéndelo/);
  });

  it('wrong pairing code (400) → message under the pairing code field', () => {
    const error = toAppError(httpError(400, { title: 'device.pairing_failed' }));
    expect(error.kind).toBe('validation');
    expect(error.fieldErrors.pairingCode).toBe('El serial o el código de emparejamiento no son correctos.');
  });

  it('too many failed codes (429 + Retry-After) → minutes to wait', () => {
    const error = toAppError(httpError(429, { title: 'device.pairing_locked' }, { 'retry-after': '840' }));
    expect(error.kind).toBe('rate_limited');
    expect(error.message).toBe('Demasiados intentos fallidos con este medidor. Inténtalo de nuevo en 14 min.');
    expect(error.details.retryAfterSeconds).toBe(840);
  });

  it('too many link attempts of the user (429) → never says "0 min"', () => {
    const error = toAppError(httpError(429, { title: 'device.too_many_attempts' }, { 'retry-after': '20' }));
    expect(error.message).toBe('Hiciste demasiados intentos de vinculación. Inténtalo de nuevo en 1 min.');
  });

  it('meter already used in another place (409)', () => {
    expect(toAppError(httpError(409, { title: 'device.already_linked' })).message).toMatch(/otro lugar/);
  });

  it('ms-places down while ms-devices checks the place (503)', () => {
    const error = toAppError(httpError(503, { title: 'service.unavailable' }));
    expect(error.kind).toBe('unavailable');
    expect(error.message).toMatch(/no está respondiendo/);
  });

  it('missing fields (400 "errors" map) → Spanish message on each field', () => {
    const error = toAppError(
      httpError(400, { title: 'One or more validation errors occurred.', errors: { SerialNumber: ['required'] } }),
    );
    expect(error.fieldErrors.serialNumber).toBe('Revisa el serial.');
  });
});
