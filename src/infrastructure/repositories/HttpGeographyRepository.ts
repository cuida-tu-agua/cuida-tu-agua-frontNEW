import { AxiosInstance } from 'axios';
import { PLACES_ENDPOINTS } from '../../config/api';
import { City, Country, GeographyRepository, Subdivision } from '../../domain/geography/Geography';
import { toAppError } from '../http/httpError';


export class HttpGeographyRepository implements GeographyRepository {
  private readonly http: AxiosInstance;
  private readonly cache = new Map<string, unknown>();

  constructor(http: AxiosInstance) {
    this.http = http;
  }

  listCountries(): Promise<Country[]> {
    return this.cached('countries', PLACES_ENDPOINTS.COUNTRIES);
  }

  listSubdivisions(countryCode: string): Promise<Subdivision[]> {
    return this.cached(`subdivisions:${countryCode}`, PLACES_ENDPOINTS.SUBDIVISIONS(countryCode));
  }

  listCities(subdivisionId: string): Promise<City[]> {
    return this.cached(`cities:${subdivisionId}`, PLACES_ENDPOINTS.CITIES(subdivisionId));
  }

  private async cached<T>(key: string, url: string): Promise<T> {
    if (this.cache.has(key)) return this.cache.get(key) as T;
    try {
      const { data } = await this.http.get<T>(url);
      this.cache.set(key, data);
      return data;
    } catch (error) {
      throw toAppError(error);
    }
  }
}