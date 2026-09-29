import { AxiosError, AxiosInstance } from 'axios';
import { AppError } from '../../../domain/common/AppError';
import { HttpGeographyRepository } from '../HttpGeographyRepository';

/** Minimal fake of the axios instance: only "get" is used by this adapter. */
const fakeHttp = (get: jest.Mock) => ({ get }) as unknown as AxiosInstance;

describe('HttpGeographyRepository', () => {
  it('calls the right URL and caches the answer', async () => {
    const get = jest.fn().mockResolvedValue({ data: [{ id: 's1', code: '05', name: 'Antioquia' }] });
    const repository = new HttpGeographyRepository(fakeHttp(get));

    const first = await repository.listSubdivisions('CO');
    const second = await repository.listSubdivisions('CO');

    expect(get).toHaveBeenCalledTimes(1);
    expect(get).toHaveBeenCalledWith('/api/geography/countries/CO/subdivisions');
    expect(second).toBe(first);
  });

  it('does not cache failures and converts them to AppError', async () => {
    const get = jest
      .fn()
      .mockRejectedValueOnce(new AxiosError('Network Error', 'ERR_NETWORK'))
      .mockResolvedValueOnce({ data: [] });
    const repository = new HttpGeographyRepository(fakeHttp(get));

    await expect(repository.listCountries()).rejects.toBeInstanceOf(AppError);
    await expect(repository.listCountries()).resolves.toEqual([]);
    expect(get).toHaveBeenCalledTimes(2);
  });
});