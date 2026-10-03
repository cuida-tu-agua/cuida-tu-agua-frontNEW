import { AxiosInstance } from 'axios';
import { DEVICES_ENDPOINTS } from '../../config/api';
import { Device, LinkDeviceInput } from '../../domain/devices/Device';
import { DeviceRepository } from '../../domain/devices/DeviceRepository';
import { toAppError } from '../http/httpError';

/** Adapter: implements the DeviceRepository port with HTTP calls to ms-devices. */
export class HttpDeviceRepository implements DeviceRepository {
  private readonly http: AxiosInstance;

  constructor(http: AxiosInstance) {
    this.http = http;
  }

  async getByPlace(placeId: string): Promise<Device | null> {
    try {
      const { data } = await this.http.get<Device>(DEVICES_ENDPOINTS.PLACE_DEVICE(placeId));
      return data;
    } catch (error) {
      const appError = toAppError(error);
      // ONLY "device.not_linked" means "no meter yet". A 404 "place.not_found" (the place was
      // deleted on another phone) is a real error and must reach the screen.
      if (appError.code === 'device.not_linked') return null;
      throw appError;
    }
  }

  async link(placeId: string, input: LinkDeviceInput): Promise<Device> {
    try {
      const { data } = await this.http.post<Device>(DEVICES_ENDPOINTS.PLACE_DEVICE(placeId), input);
      return data;
    } catch (error) {
      throw toAppError(error);
    }
  }

  async unlink(placeId: string): Promise<void> {
    try {
      await this.http.delete(DEVICES_ENDPOINTS.PLACE_DEVICE(placeId));
    } catch (error) {
      throw toAppError(error);
    }
  }
}
