import { Currency, MeasurementUnit } from '../places/Place';

export interface Country {
  code: string; // 'CO' | 'EC'
  name: string;
  defaultCurrency: Currency;
  defaultUnit: MeasurementUnit;
}

/** Departamento (CO) or provincia (EC). */
export interface Subdivision {
  id: string;
  code: string;
  name: string;
}

/** Municipio (CO) or cantón (EC). */
export interface City {
  id: string;
  code: string;
  name: string;
}

/** Port: read-only geographic catalog. */
export interface GeographyRepository {
  listCountries(): Promise<Country[]>;
  listSubdivisions(countryCode: string): Promise<Subdivision[]>;
  listCities(subdivisionId: string): Promise<City[]>;
}