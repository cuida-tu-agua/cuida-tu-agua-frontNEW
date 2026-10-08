import { AxiosError, AxiosInstance, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { HttpConsumptionRepository } from '../HttpConsumptionRepository';
import { HttpValveRepository } from '../HttpValveRepository';

const httpError = (status: number, data: unknown): AxiosError => {
  const config = { headers: {} } as InternalAxiosRequestConfig;
  const response = { status, data, statusText: '', headers: {}, config } as AxiosResponse;
  return new AxiosError(`Request failed with status code ${status}`, 'ERR_BAD_REQUEST', config, {}, response);
};

const command = { id: 'c1', action: 'CLOSE', status: 'SENT' };

describe('HttpValveRepository', () => {
  it('asks ms-iam for the code with the VALVE_CLOSE action', async () => {
    const post = jest.fn().mockResolvedValue({ data: { maskedEmail: 'j***@mail.com', expiresAt: 'x' } });
    const repository = new HttpValveRepository({} as AxiosInstance, { post } as unknown as AxiosInstance);

    await expect(repository.requestCloseCode()).resolves.toMatchObject({ maskedEmail: 'j***@mail.com' });
    expect(post).toHaveBeenCalledWith('/api/users/me/action-codes', { action: 'VALVE_CLOSE' });
  });

  it('closes with the code and opens without it, both on ms-valve', async () => {
    const post = jest.fn().mockResolvedValue({ data: command });
    const repository = new HttpValveRepository({ post } as unknown as AxiosInstance, {} as AxiosInstance);

    await repository.close('p1', '123456');
    await repository.open('p1');
    expect(post).toHaveBeenNthCalledWith(1, '/api/places/p1/valve/close', { code: '123456' });
    expect(post).toHaveBeenNthCalledWith(2, '/api/places/p1/valve/open');
  });

  it('a wrong code is shown under the code field with the attempts left', async () => {
    const post = jest.fn().mockRejectedValue(httpError(400, { title: 'auth.invalid_code', remainingAttempts: 2 }));
    const repository = new HttpValveRepository({ post } as unknown as AxiosInstance, {} as AxiosInstance);

    const error = await repository.close('p1', '000000').catch((e) => e);
    expect(error.fieldErrors.code).toBe('El código no es correcto. Te quedan 2 intentos.');
  });

  it('an offline device is a conflict with a clear message', async () => {
    const post = jest.fn().mockRejectedValue(httpError(409, { title: 'valve.device_offline' }));
    const repository = new HttpValveRepository({ post } as unknown as AxiosInstance, {} as AxiosInstance);

    await expect(repository.open('p1')).rejects.toMatchObject({ kind: 'conflict', code: 'valve.device_offline' });
  });
});

describe('HttpConsumptionRepository', () => {
  it('sends the period in lower case and the time zone', async () => {
    const data = {
      placeId: 'p1', period: 'WEEK', timeZone: 'America/Bogota', from: '', to: '', totalLiters: 2.5, hasData: true,
      buckets: [{ start: '2026-10-03T05:00:00Z', liters: 2.5 }], lastReadingAt: null, currentFlowLpm: null, generatedAt: '',
    };
    const get = jest.fn().mockResolvedValue({ data });
    const repository = new HttpConsumptionRepository({ get } as unknown as AxiosInstance);

    await expect(repository.get('p1', 'WEEK', 'America/Bogota')).resolves.toMatchObject({ totalLiters: 2.5 });
    expect(get).toHaveBeenCalledWith('/api/places/p1/consumption', { params: { period: 'week', tz: 'America/Bogota' } });
  });

  it('lists the history with the date range as from/to (HU-022)', async () => {
    const get = jest.fn().mockResolvedValue({ data: [command] });
    const repository = new HttpValveRepository({ get } as unknown as AxiosInstance, {} as AxiosInstance);
    const range = { from: '2026-10-01T05:00:00.000Z', to: '2026-10-06T04:59:59.999Z' };

    await expect(repository.listCommands('p1', range)).resolves.toEqual([command]);
    expect(get).toHaveBeenCalledWith('/api/places/p1/valve/commands', { params: range });
  });

  it('without a range it sends no dates so the server uses its 30 days', async () => {
    const get = jest.fn().mockResolvedValue({ data: [] });
    const repository = new HttpValveRepository({ get } as unknown as AxiosInstance, {} as AxiosInstance);

    await repository.listCommands('p1');
    expect(get).toHaveBeenCalledWith('/api/places/p1/valve/commands', undefined);
  });
});
