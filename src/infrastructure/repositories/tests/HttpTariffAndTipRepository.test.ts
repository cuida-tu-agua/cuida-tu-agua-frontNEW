import { AxiosError, AxiosInstance, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { HttpTariffRepository } from '../HttpTariffRepository';
import { HttpTipRepository } from '../HttpTipRepository';

const httpError = (status: number, data: unknown): AxiosError => {
  const config = { headers: {} } as InternalAxiosRequestConfig;
  const response = { status, data, statusText: '', headers: {}, config } as AxiosResponse;
  return new AxiosError(`Request failed with status code ${status}`, 'ERR_BAD_REQUEST', config, {}, response);
};

describe('HttpTariffRepository', () => {
  it('reads the tariffs of a place', async () => {
    const get = jest.fn().mockResolvedValue({ data: { current: null, history: [] } });
    const repository = new HttpTariffRepository({ get } as unknown as AxiosInstance);

    await expect(repository.get('p1')).resolves.toEqual({ current: null, history: [] });
    expect(get).toHaveBeenCalledWith('/api/places/p1/tariff');
  });

  it('sends the manual tariff with its optional fixed charge', async () => {
    const put = jest.fn().mockResolvedValue({ data: { id: 1, source: 'MANUAL' } });
    const repository = new HttpTariffRepository({ put } as unknown as AxiosInstance);

    await repository.setManual('p1', { unitPricePerM3: 5234.5, fixedMonthlyCharge: null });

    expect(put).toHaveBeenCalledWith('/api/places/p1/tariff/manual', { unitPricePerM3: 5234.5, fixedMonthlyCharge: null });
  });

  it('picks a stratum of the catalog', async () => {
    const put = jest.fn().mockResolvedValue({ data: { id: 2, source: 'CATALOG', stratum: 3 } });
    const repository = new HttpTariffRepository({ put } as unknown as AxiosInstance);

    await expect(repository.setCatalog('p1', 3)).resolves.toMatchObject({ stratum: 3 });
    expect(put).toHaveBeenCalledWith('/api/places/p1/tariff/catalog', { stratum: 3 });
  });

  it('a stratum the city does not have is explained', async () => {
    const put = jest.fn().mockRejectedValue(httpError(404, { title: 'tariff.catalog_unavailable' }));
    const repository = new HttpTariffRepository({ put } as unknown as AxiosInstance);

    const error = await repository.setCatalog('p1', 6).catch((e) => e);
    expect(error.message).toMatch(/Escribe la de tu recibo/);
  });

  it('reads the catalog of a city', async () => {
    const get = jest.fn().mockResolvedValue({ data: { cityId: 'c1', available: true, strata: [] } });
    const repository = new HttpTariffRepository({ get } as unknown as AxiosInstance);

    await repository.catalog('c1');
    expect(get).toHaveBeenCalledWith('/api/tariffs/catalog/cities/c1');
  });

  it('asks the cost with the period in the words of the server and the time zone', async () => {
    const get = jest.fn().mockResolvedValue({ data: { hasTariff: false } });
    const repository = new HttpTariffRepository({ get } as unknown as AxiosInstance);

    await repository.cost('p1', 'MONTH', 'America/Bogota');

    expect(get).toHaveBeenCalledWith('/api/places/p1/cost', { params: { period: 'month', tz: 'America/Bogota' } });
  });

  it('an unavailable consumption service is a clear error, not a zero', async () => {
    const get = jest.fn().mockRejectedValue(httpError(503, { title: 'service.unavailable' }));
    const repository = new HttpTariffRepository({ get } as unknown as AxiosInstance);

    const error = await repository.cost('p1', 'DAY', 'UTC').catch((e) => e);
    expect(error.kind).toBe('unavailable');
  });
});

describe('HttpTipRepository', () => {
  it('asks the tips of a session for a place', async () => {
    const get = jest.fn().mockResolvedValue({ data: { category: 'RESIDENTIAL', total: 12, tips: [] } });
    const repository = new HttpTipRepository({ get } as unknown as AxiosInstance);

    await repository.session({ placeId: 'p1', count: 5 });

    expect(get).toHaveBeenCalledWith('/api/tips', { params: { placeId: 'p1', category: undefined, count: 5 } });
  });

  it('marks and un-marks a favorite', async () => {
    const put = jest.fn().mockResolvedValue({ data: { id: 't1', isFavorite: true } });
    const del = jest.fn().mockResolvedValue({});
    const repository = new HttpTipRepository({ put, delete: del } as unknown as AxiosInstance);

    await expect(repository.mark('t1')).resolves.toMatchObject({ isFavorite: true });
    await repository.unmark('t1');

    expect(put).toHaveBeenCalledWith('/api/tips/t1/favorite');
    expect(del).toHaveBeenCalledWith('/api/tips/t1/favorite');
  });

  it('lists the favorites', async () => {
    const get = jest.fn().mockResolvedValue({ data: [] });
    const repository = new HttpTipRepository({ get } as unknown as AxiosInstance);

    await repository.favorites();
    expect(get).toHaveBeenCalledWith('/api/tips/favorites');
  });

  it('the administrator creates, edits and deactivates', async () => {
    const post = jest.fn().mockResolvedValue({ data: { id: 't1' } });
    const put = jest.fn().mockResolvedValue({ data: { id: 't1' } });
    const get = jest.fn().mockResolvedValue({ data: [] });
    const repository = new HttpTipRepository({ post, put, get } as unknown as AxiosInstance);
    const input = { title: 'Titulo', body: 'Cuerpo', category: 'COMMERCIAL' as const };

    await repository.create(input);
    await repository.edit('t1', input);
    await repository.setActive('t1', false);
    await repository.list('COMMERCIAL', false);

    expect(post).toHaveBeenCalledWith('/api/admin/tips', input);
    expect(put).toHaveBeenNthCalledWith(1, '/api/admin/tips/t1', input);
    expect(put).toHaveBeenNthCalledWith(2, '/api/admin/tips/t1/active', { active: false });
    expect(get).toHaveBeenCalledWith('/api/admin/tips', { params: { category: 'COMMERCIAL', includeInactive: false } });
  });

  it('a normal user who reaches the administration gets the admin message', async () => {
    const get = jest.fn().mockRejectedValue(httpError(403, {}));
    const repository = new HttpTipRepository({ get } as unknown as AxiosInstance);

    const error = await repository.list().catch((e) => e);
    expect(error.kind).toBe('forbidden');
  });
});
