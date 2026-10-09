import { CostEstimate, ManualTariffInput, PlaceTariffs, Tariff, TariffCatalog } from './Tariff';

export interface TariffRepository {
  /** HU-054: the tariff in force and the history of a place. */
  get(placeId: string): Promise<PlaceTariffs>;
  /** HU-054: the user types the price of their bill. */
  setManual(placeId: string, input: ManualTariffInput): Promise<Tariff>;
  /** HU-066: the user picks the stratum and the preloaded tariff of the city is used. */
  setCatalog(placeId: string, stratum: number): Promise<Tariff>;
  /** HU-066: the preloaded tariffs of a city. */
  catalog(cityId: string): Promise<TariffCatalog>;
  /** HU-056: what the water of a period costs (an estimate). */
  cost(placeId: string, period: 'DAY' | 'WEEK' | 'MONTH', timeZone: string): Promise<CostEstimate>;
}
