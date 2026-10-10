import { AxiosInstance } from 'axios';
import { HttpAdminDeviceRepository } from '../HttpAdminDeviceRepository';

const repo = (http: object) => new HttpAdminDeviceRepository(http as unknown as AxiosInstance);

describe('HttpAdminDeviceRepository', () => {
  it('lists with search and filters, leaving out the ones that are "ALL"', async () => {
    const get = jest.fn().mockResolvedValue({ data: { items: [] } });

    await repo({ get }).list({ search: ' SW-1 ', status: 'CONNECTED', link: 'ALL', page: 2 });

    expect(get).toHaveBeenCalledWith('/api/admin/devices', { params: { search: 'SW-1', status: 'CONNECTED', link: undefined, page: 2, size: 20 } });
  });

  it('registers N devices or one serial with a POST to the collection', async () => {
    const post = jest.fn().mockResolvedValue({ data: [] });

    await repo({ post }).register({ count: 3 });
    await repo({ post }).register({ serialNumber: 'SW-ESP32-000100' });

    expect(post).toHaveBeenNthCalledWith(1, '/api/admin/devices', { count: 3 });
    expect(post).toHaveBeenNthCalledWith(2, '/api/admin/devices', { serialNumber: 'SW-ESP32-000100' });
  });

  it('new credentials and decommission are POSTs on the device', async () => {
    const post = jest.fn().mockResolvedValue({ data: {} });

    await repo({ post }).regenerateCredentials('abc');
    await repo({ post }).decommission('abc');

    expect(post).toHaveBeenNthCalledWith(1, '/api/admin/devices/abc/credentials');
    expect(post).toHaveBeenNthCalledWith(2, '/api/admin/devices/abc/decommission');
  });

  it('turns a server refusal into an app error', async () => {
    const post = jest.fn().mockRejectedValue(new Error('boom'));

    await expect(repo({ post }).decommission('abc')).rejects.toBeDefined();
  });
});
