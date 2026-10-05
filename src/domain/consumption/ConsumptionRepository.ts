import { Consumption, ConsumptionPeriod } from './Consumption';

export interface ConsumptionRepository {
  get(placeId: string, period: ConsumptionPeriod, timeZone: string): Promise<Consumption>;
}
