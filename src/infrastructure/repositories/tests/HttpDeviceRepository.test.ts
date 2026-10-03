import { AxiosError, AxiosInstance, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { AppError } from '../../../domain/common/AppError';
import { HttpDeviceRepository } from '../HttpDeviceRepository';

const httpError = (status: number, data: unknown): AxiosError => {
  const config = { headers: {} } as InternalAxiosRequestConfig;
  const response = { status, data, statusText: '', headers: {}, config } as AxiosResponse;
  return new AxiosError(`Request failed with status code ${status}`, 'ERR_BAD_REQUEST', config, {}, response);
};

const device = {
  id: 'd1',
  serialNumber: 'SW-ESP32-000001',
  placeId: 'p1',
  status: 'CONNECTED',
  lastReportAt: '2026-09-28T15:00:00Z',
  linkedAt: '2026-09-28T15:00:05Z',
  firmwareVersion: '1.0.0',
  inactivityThresholdMinutes: 10,
};

describe('HttpDeviceRepository', () => {
  it('getByPlace returns the device', async () => {
    const get = jest.fn().mockResolvedValue({ data: device });
    const repository = new HttpDeviceRepository({ get } as unknown as AxiosInstance);

    await expect(repository.getByPlace('p1')).resolves.toEqual(device);
    expect(get).toHaveBeenCalledWith('/api/places/p1/device');
  });

  it('getByPlace returns null when the place has no device (404 device.not_linked)', async () => {
    const get = jest.fn().mockRejectedValue(httpError(404, { title: 'device.not_linked' }));
    const repository = new HttpDeviceRepository({ get } as unknown as AxiosInstance);

    await expect(repository.getByPlace('p1')).resolves.toBeNull();
  });

  it('getByPlace fails when the PLACE does not exist (404 place.not_found)', async () => {
    const get = jest.fn().mockRejectedValue(httpError(404, { title: 'place.not_found' }));
    const repository = new HttpDeviceRepository({ get } as unknown as AxiosInstance);

    const error = await repository.getByPlace('p1').catch((e) => e);
    expect(error).toBeInstanceOf(AppError);
    expect(error.kind).toBe('not_found');
  });

  it('getByPlace fails without internet', async () => {
    const get = jest.fn().mockRejectedValue(new AxiosError('Network Error', 'ERR_NETWORK'));
    const repository = new HttpDeviceRepository({ get } as unknown as AxiosInstance);

    await expect(repository.getByPlace('p1')).rejects.toMatchObject({ kind: 'network' });
  });

  it('link posts serial and code', async () => {
    const post = jest.fn().mockResolvedValue({ data: device });
    const repository = new HttpDeviceRepository({ post } as unknown as AxiosInstance);
    const input = { serialNumber: 'SW-ESP32-000001', pairingCode: '4HZX-VCDP' };

    await expect(repository.link('p1', input)).resolves.toEqual(device);
    expect(post).toHaveBeenCalledWith('/api/places/p1/device', input);
  });

  it('link turns a wrong code into an error on the pairingCode field', async () => {
    const post = jest.fn().mockRejectedValue(httpError(400, { title: 'device.pairing_failed' }));
    const repository = new HttpDeviceRepository({ post } as unknown as AxiosInstance);

    const error = await repository.link('p1', { serialNumber: 'X', pairingCode: 'Y' }).catch((e) => e);
    expect(error).toBeInstanceOf(AppError);
    expect(error.kind).toBe('validation');
    expect(error.fieldErrors.pairingCode).toBe('El serial o el código de emparejamiento no son correctos.');
  });

  it('unlink calls DELETE', async () => {
    const del = jest.fn().mockResolvedValue({ status: 204 });
    const repository = new HttpDeviceRepository({ delete: del } as unknown as AxiosInstance);

    await repository.unlink('p1');
    expect(del).toHaveBeenCalledWith('/api/places/p1/device');
  });
});
