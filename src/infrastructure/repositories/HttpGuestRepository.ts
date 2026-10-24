import { AxiosInstance } from 'axios';
import { SHARING_ENDPOINTS } from '../../config/api';
import { Consumption, ConsumptionPeriod } from '../../domain/consumption/Consumption';
import { GuestRepository } from '../../domain/sharing/GuestRepository';
import { GuestPlace } from '../../domain/sharing/Sharing';
import { toAppError } from '../http/httpError';

/**
 * Adapter: GuestRepository over HTTP. It takes clients WITHOUT the session interceptors: a guest has no token, and a
 * 401/404 here must never trigger a refresh or sign somebody else out.
 */
export class HttpGuestRepository implements GuestRepository {
  private readonly places: AxiosInstance;
  private readonly consumption: AxiosInstance;

  constructor(places: AxiosInstance, consumption: AxiosInstance) {
    this.places = places;
    this.consumption = consumption;
  }

  async getPlace(token: string): Promise<GuestPlace> {
    try {
      const { data } = await this.places.get<GuestPlace>(SHARING_ENDPOINTS.GUEST_PLACE(token));
      return data;
    } catch (error) {
      throw toAppError(error);
    }
  }

  async getConsumption(token: string, period: ConsumptionPeriod, timeZone: string): Promise<Consumption> {
    try {
      const { data } = await this.consumption.get<Consumption>(SHARING_ENDPOINTS.GUEST_CONSUMPTION(token), {
        params: { period: period.toLowerCase(), tz: timeZone },
      });
      return {
        ...data,
        totalLiters: Number(data.totalLiters),
        currentFlowLpm: data.currentFlowLpm === null ? null : Number(data.currentFlowLpm),
        buckets: data.buckets.map((b) => ({ start: b.start, liters: Number(b.liters) })),
      };
    } catch (error) {
      throw toAppError(error);
    }
  }
}
