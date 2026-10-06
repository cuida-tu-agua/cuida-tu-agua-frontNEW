import { AxiosInstance } from 'axios';
import { CONSUMPTION_ENDPOINTS } from '../../config/api';
import { Consumption, ConsumptionPeriod } from '../../domain/consumption/Consumption';
import { ConsumptionRepository } from '../../domain/consumption/ConsumptionRepository';
import { toAppError } from '../http/httpError';

/** Adapter: ConsumptionRepository over HTTP (ms-consumption :3004). */
export class HttpConsumptionRepository implements ConsumptionRepository {
  private readonly http: AxiosInstance;

  constructor(http: AxiosInstance) {
    this.http = http;
  }

  async get(placeId: string, period: ConsumptionPeriod, timeZone: string): Promise<Consumption> {
    try {
      const { data } = await this.http.get<Consumption>(CONSUMPTION_ENDPOINTS.PLACE_CONSUMPTION(placeId), {
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
