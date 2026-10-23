import { AxiosError, AxiosInstance, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { HttpProfileService } from '../HttpProfileService';

const httpError = (status: number, data: unknown): AxiosError => {
  const config = { headers: {} } as InternalAxiosRequestConfig;
  const response = { status, data, statusText: '', headers: {}, config } as AxiosResponse;
  return new AxiosError(`Request failed with status code ${status}`, 'ERR_BAD_REQUEST', config, {}, response);
};

describe('HttpProfileService · phone verification (HU-028)', () => {
  it('asks for the code with the country, the national number and the mode', async () => {
    const post = jest.fn().mockResolvedValue({ data: { maskedPhone: '+57300***233', channel: 'WHATSAPP', expiresAt: '2026-10-22T15:05:00Z' } });
    const service = new HttpProfileService({ post } as unknown as AxiosInstance);

    const sent = await service.requestPhoneCode('CO', '3001112233', 'WHATSAPP');

    expect(post).toHaveBeenCalledWith('/api/users/me/phone-verification', { country: 'CO', phone: '3001112233', channel: 'WHATSAPP' });
    expect(sent.maskedPhone).toBe('+57300***233');
  });

  it('confirms the code and gets the profile back', async () => {
    const post = jest.fn().mockResolvedValue({ data: { id: 'u1', phone: '+573001112233', phoneVerified: true, phoneChannel: 'SMS' } });
    const user = await new HttpProfileService({ post } as unknown as AxiosInstance).confirmPhone('123456');

    expect(post).toHaveBeenCalledWith('/api/users/me/phone-verification/confirm', { code: '123456' });
    expect(user.phoneVerified).toBe(true);
    expect(user.phoneChannel).toBe('SMS');
  });

  it('a number that does not work for the mode is an error on the phone field', async () => {
    const post = jest.fn().mockRejectedValue(httpError(422, { title: 'phone.not_reachable' }));
    const error = await new HttpProfileService({ post } as unknown as AxiosInstance)
      .requestPhoneCode('CO', '3001112233', 'WHATSAPP')
      .catch((e) => e);

    expect(error.code).toBe('phone.not_reachable');
    expect(error.fieldErrors.phone).toMatch(/elige el otro medio/);
  });

  it('a wrong code is an error on the code field', async () => {
    const post = jest.fn().mockRejectedValue(httpError(400, { title: 'auth.invalid_code', remainingAttempts: 3 }));
    const error = await new HttpProfileService({ post } as unknown as AxiosInstance).confirmPhone('000000').catch((e) => e);

    expect(error.fieldErrors.code).toBeTruthy();
    expect(error.details.remainingAttempts).toBe(3);
  });
});
