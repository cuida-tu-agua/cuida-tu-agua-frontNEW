import { AxiosError, AxiosInstance, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { HttpAdminRepository } from '../HttpAdminRepository';

const httpError = (status: number, data: unknown): AxiosError => {
  const config = { headers: {} } as InternalAxiosRequestConfig;
  const response = { status, data, statusText: '', headers: {}, config } as AxiosResponse;
  return new AxiosError(`Request failed with status code ${status}`, 'ERR_BAD_REQUEST', config, {}, response);
};

describe('HttpAdminRepository', () => {
  it('lists users with search, status and page; a blank search is not sent', async () => {
    const get = jest.fn().mockResolvedValue({ data: { items: [], page: 1, size: 10, totalItems: 11, totalPages: 2 } });
    const repository = new HttpAdminRepository({ get } as unknown as AxiosInstance);

    await repository.listUsers({ search: '  ana ', status: 'BLOCKED', page: 1, size: 10 });
    await repository.listUsers({ search: '   ', status: null });

    expect(get).toHaveBeenNthCalledWith(1, '/api/admin/users', { params: { search: 'ana', status: 'BLOCKED', page: 1, size: 10 } });
    expect(get).toHaveBeenNthCalledWith(2, '/api/admin/users', { params: { search: undefined, status: undefined, page: 0, size: 20 } });
  });

  it('blocks with an optional reason and unblocks', async () => {
    const put = jest.fn().mockResolvedValue({ data: { id: 'u1', status: 'BLOCKED' } });
    const repository = new HttpAdminRepository({ put } as unknown as AxiosInstance);

    await repository.blockUser('u1', ' Uso indebido ');
    await repository.blockUser('u1');
    await repository.unblockUser('u1');

    expect(put).toHaveBeenNthCalledWith(1, '/api/admin/users/u1/block', { reason: 'Uso indebido' });
    expect(put).toHaveBeenNthCalledWith(2, '/api/admin/users/u1/block', undefined);
    expect(put).toHaveBeenNthCalledWith(3, '/api/admin/users/u1/unblock');
  });

  it('reads the platform metrics', async () => {
    const data = { generatedAt: 'x', users: { total: 4 }, places: null, devices: null, unavailable: ['devices', 'places'] };
    const get = jest.fn().mockResolvedValue({ data });
    const repository = new HttpAdminRepository({ get } as unknown as AxiosInstance);

    await expect(repository.metrics()).resolves.toEqual(data);
    expect(get).toHaveBeenCalledWith('/api/admin/metrics');
  });

  it('a normal user is told only an administrator can do it', async () => {
    const get = jest.fn().mockRejectedValue(httpError(403, { title: 'auth.admin_required' }));
    const repository = new HttpAdminRepository({ get } as unknown as AxiosInstance);

    const error = await repository.metrics().catch((e) => e);
    expect(error.kind).toBe('forbidden');
    expect(error.message).toBe('Solo un administrador puede hacer esto.');
  });

  it('blocking yourself is explained', async () => {
    const put = jest.fn().mockRejectedValue(httpError(400, { title: 'user.cannot_block_self' }));
    const repository = new HttpAdminRepository({ put } as unknown as AxiosInstance);

    const error = await repository.blockUser('me').catch((e) => e);
    expect(error.message).toBe('No puedes bloquear tu propia cuenta.');
  });
});
