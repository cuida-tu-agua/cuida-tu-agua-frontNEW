import { AxiosInstance } from 'axios';
import { ADMIN_DEVICE_ENDPOINTS } from '../../config/api';
import { AdminDeviceDetail, AdminDevicePage, AdminDeviceQuery, FactoryDevice } from '../../domain/admin/AdminDevices';
import { AdminDeviceRepository } from '../../domain/admin/AdminDeviceRepository';
import { toAppError } from '../http/httpError';

export class HttpAdminDeviceRepository implements AdminDeviceRepository {
  private readonly http: AxiosInstance;

  constructor(http: AxiosInstance) {
    this.http = http;
  }

  async list(query: AdminDeviceQuery = {}): Promise<AdminDevicePage> {
    const search = query.search?.trim();
    try {
      const { data } = await this.http.get<AdminDevicePage>(ADMIN_DEVICE_ENDPOINTS.LIST, {
        params: {
          search: search || undefined,
          status: query.status && query.status !== 'ALL' ? query.status : undefined,
          link: query.link && query.link !== 'ALL' ? query.link : undefined,
          page: query.page ?? 0,
          size: query.size ?? 20,
        },
      });
      return data;
    } catch (error) {
      throw toAppError(error);
    }
  }

  async get(id: string): Promise<AdminDeviceDetail> {
    try {
      const { data } = await this.http.get<AdminDeviceDetail>(ADMIN_DEVICE_ENDPOINTS.ONE(id));
      return data;
    } catch (error) {
      throw toAppError(error);
    }
  }

  async register(input: { count?: number; serialNumber?: string }): Promise<FactoryDevice[]> {
    try {
      const { data } = await this.http.post<FactoryDevice[]>(ADMIN_DEVICE_ENDPOINTS.LIST, input);
      return data;
    } catch (error) {
      throw toAppError(error);
    }
  }

  async regenerateCredentials(id: string): Promise<FactoryDevice> {
    try {
      const { data } = await this.http.post<FactoryDevice>(ADMIN_DEVICE_ENDPOINTS.CREDENTIALS(id));
      return data;
    } catch (error) {
      throw toAppError(error);
    }
  }

  async decommission(id: string): Promise<AdminDeviceDetail> {
    try {
      const { data } = await this.http.post<AdminDeviceDetail>(ADMIN_DEVICE_ENDPOINTS.DECOMMISSION(id));
      return data;
    } catch (error) {
      throw toAppError(error);
    }
  }
}
