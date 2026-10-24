import { Consumption, ConsumptionPeriod } from '../consumption/Consumption';
import { GuestPlace } from './Sharing';

/** Read-only access with the token of a guest link; there is no login and nothing can be changed (HU-040, HU-041). */
export interface GuestRepository {
  /** Fails with not_found when the link does not exist, was turned off or the place was deleted. */
  getPlace(token: string): Promise<GuestPlace>;
  getConsumption(token: string, period: ConsumptionPeriod, timeZone: string): Promise<Consumption>;
}
