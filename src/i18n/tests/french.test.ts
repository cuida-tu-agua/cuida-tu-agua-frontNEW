import { AxiosError, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { changeLanguage } from '..';
import { STATUS_LABELS, rangeLabel, roleLabel } from '../../domain/admin/Admin';
import { DEVICE_STATUS_LABELS, formatLastReport } from '../../domain/devices/deviceStatus';
import { toAppError } from '../../infrastructure/http/httpError';
import { validateEmail } from '../../presentation/utils/validation';

const httpError = (status: number, data: unknown): AxiosError => {
  const config = { headers: {} } as InternalAxiosRequestConfig;
  const response = { status, data, statusText: '', headers: {}, config } as AxiosResponse;
  return new AxiosError(`Request failed with status code ${status}`, 'ERR_BAD_REQUEST', config, {}, response);
};

describe('French texts (HU-081)', () => {
  beforeEach(async () => { await changeLanguage('fr'); });

  it('service errors, with the French plural of the attempts', () => {
    expect(toAppError(httpError(404, { title: 'place.not_found' })).message).toBe("Le lieu n'existe pas ou ne vous appartient pas.");
    expect(toAppError(httpError(401, { title: 'auth.wrong_password', remainingAttempts: 1 })).message).toBe('Mot de passe incorrect. Il vous reste 1 essai.');
    expect(toAppError(httpError(401, { title: 'auth.wrong_password', remainingAttempts: 3 })).message).toBe('Mot de passe incorrect. Il vous reste 3 essais.');
    expect(toAppError(httpError(500, null)).message).toBe("Une erreur serveur s'est produite. Réessayez plus tard.");
  });

  it('validation and status labels', () => {
    expect(validateEmail('')).toBe("Saisissez votre adresse e-mail.");
    expect(DEVICE_STATUS_LABELS.CONNECTED).toBe('Connecté');
    expect(STATUS_LABELS.BLOCKED).toBe('Bloquée');
    expect(roleLabel(['ADMIN'])).toBe('Administrateur');
  });

  it('relative times and ranges', () => {
    const now = new Date('2026-10-19T12:00:00Z');
    expect(formatLastReport('2026-10-19T11:50:00Z', now)).toBe('il y a 10 min');
    expect(formatLastReport(null, now)).toBe('Aucun relevé pour le moment');
    expect(rangeLabel({ items: [{}, {}], page: 0, size: 20, totalItems: 54, totalPages: 3 } as never)).toBe('1–2 sur 54');
  });
});
