import { AxiosError, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { changeLanguage } from '..';
import { STATUS_LABELS, rangeLabel, roleLabel } from '../../domain/admin/Admin';
import { DEVICE_STATUS_LABELS, formatLastReport } from '../../domain/devices/deviceStatus';
import { formatMoney, parseMoneyInput } from '../../domain/tariffs/Tariff';
import { toAppError } from '../../infrastructure/http/httpError';
import { validateEmail } from '../../presentation/utils/validation';
import { formatNumber, localeTag, numberMarks } from '../format';

const httpError = (status: number, data: unknown): AxiosError => {
  const config = { headers: {} } as InternalAxiosRequestConfig;
  const response = { status, data, statusText: '', headers: {}, config } as AxiosResponse;
  return new AxiosError(`Request failed with status code ${status}`, 'ERR_BAD_REQUEST', config, {}, response);
};

describe('Portuguese texts (HU-082)', () => {
  beforeEach(async () => { await changeLanguage('pt'); });

  it('service errors, with the Portuguese plural of the attempts', () => {
    expect(toAppError(httpError(404, { title: 'place.not_found' })).message).toBe('O lugar não existe ou não é seu.');
    expect(toAppError(httpError(401, { title: 'auth.wrong_password', remainingAttempts: 1 })).message).toBe('Senha incorreta. Resta 1 tentativa.');
    expect(toAppError(httpError(401, { title: 'auth.wrong_password', remainingAttempts: 3 })).message).toBe('Senha incorreta. Restam 3 tentativas.');
  });

  it('validation and status labels', () => {
    expect(validateEmail('')).toBe('Digite seu e-mail.');
    expect(DEVICE_STATUS_LABELS.DISCONNECTED).toBe('Desconectado');
    expect(STATUS_LABELS.BLOCKED).toBe('Bloqueada');
    expect(roleLabel(['ADMIN'])).toBe('Administrador');
  });

  it('relative times and ranges', () => {
    const now = new Date('2026-10-19T12:00:00Z');
    expect(formatLastReport('2026-10-19T11:50:00Z', now)).toBe('há 10 min');
    expect(rangeLabel({ items: [{}, {}], page: 0, size: 20, totalItems: 54, totalPages: 3 } as never)).toBe('1–2 de 54');
  });

  it('numbers and prices use the Brazilian format', () => {
    expect(localeTag()).toBe('pt-BR');
    expect(numberMarks()).toEqual({ group: '.', decimal: ',' });
    expect(formatNumber(1234.5)).toBe('1.234,5');
    expect(formatMoney(162800, 'COP')).toBe('$ 162.800');
    expect(formatMoney(12.5, 'USD')).toBe('US$ 12,50');
    expect(parseMoneyInput('5.234,50')).toBe(5234.5);
  });
});
