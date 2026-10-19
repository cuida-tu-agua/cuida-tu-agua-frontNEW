import { AxiosInstance } from 'axios';
import { TARIFF_ENDPOINTS } from '../../config/api';
import { API_PERIOD, CostEstimate, ManualTariffInput, PlaceTariffs, Tariff, TariffCatalog } from '../../domain/tariffs/Tariff';
import { TariffRepository } from '../../domain/tariffs/TariffRepository';
import { toAppError } from '../http/httpError';

export class HttpTariffRepository implements TariffRepository {
  private readonly http: AxiosInstance;

  constructor(http: AxiosInstance) {
    this.http = http;
  }

  async get(placeId: string): Promise<PlaceTariffs> {
    try {
      const { data } = await this.http.get<PlaceTariffs>(TARIFF_ENDPOINTS.TARIFF(placeId));
      return data;
    } catch (error) {
      throw toAppError(error);
    }
  }

  async setManual(placeId: string, input: ManualTariffInput): Promise<Tariff> {
    try {
      const { data } = await this.http.put<Tariff>(TARIFF_ENDPOINTS.MANUAL(placeId), {
        unitPricePerM3: input.unitPricePerM3,
        fixedMonthlyCharge: input.fixedMonthlyCharge,
      });
      return data;
    } catch (error) {
      throw toAppError(error);
    }
  }

  async setCatalog(placeId: string, stratum: number): Promise<Tariff> {
    try {
      const { data } = await this.http.put<Tariff>(TARIFF_ENDPOINTS.CATALOG_CHOICE(placeId), { stratum });
      return data;
    } catch (error) {
      throw toAppError(error);
    }
  }

  async catalog(cityId: string): Promise<TariffCatalog> {
    try {
      const { data } = await this.http.get<TariffCatalog>(TARIFF_ENDPOINTS.CATALOG(cityId));
      return data;
    } catch (error) {
      throw toAppError(error);
    }
  }

  async cost(placeId: string, period: 'DAY' | 'WEEK' | 'MONTH', timeZone: string): Promise<CostEstimate> {
    try {
      const { data } = await this.http.get<CostEstimate>(TARIFF_ENDPOINTS.COST(placeId), {
        params: { period: API_PERIOD[period], tz: timeZone },
      });
      return data;
    } catch (error) {
      throw toAppError(error);
    }
  }
}
