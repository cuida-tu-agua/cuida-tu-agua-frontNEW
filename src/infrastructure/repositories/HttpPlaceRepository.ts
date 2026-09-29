import { AxiosInstance } from 'axios';
import { PLACES_ENDPOINTS } from '../../config/api';
import { CreatePlaceInput, Place, UpdatePlaceInput } from '../../domain/places/Place';
import { PlaceRepository } from '../../domain/places/PlaceRepository';
import { toAppError } from '../http/httpError';

export class HttpPlaceRepository implements PlaceRepository {
  private readonly http: AxiosInstance;

  constructor(http: AxiosInstance) {
    this.http = http;
  }

  async create(input: CreatePlaceInput): Promise<Place> {
    try {
      const { data } = await this.http.post<Place>(PLACES_ENDPOINTS.PLACES, input);
      return data;
    } catch (error) {
      throw toAppError(error);
    }
  }

  async getById(placeId: string): Promise<Place> {
    try {
      const { data } = await this.http.get<Place>(PLACES_ENDPOINTS.PLACE(placeId));
      return data;
    } catch (error) {
      throw toAppError(error);
    }
  }

  async update(placeId: string, input: UpdatePlaceInput): Promise<Place> {
    try {
      const { data } = await this.http.put<Place>(PLACES_ENDPOINTS.PLACE(placeId), input);
      return data;
    } catch (error) {
      throw toAppError(error);
    }
  }
}