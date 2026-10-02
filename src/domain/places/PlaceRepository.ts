import { CreatePlaceInput, Place, UpdatePlaceInput } from './Place';

export interface PlaceRepository {
  list(): Promise<Place[]>;
  create(input: CreatePlaceInput): Promise<Place>;
  getById(placeId: string): Promise<Place>;
  update(placeId: string, input: UpdatePlaceInput): Promise<Place>;
  select(placeId: string): Promise<Place>;
  remove(placeId: string): Promise<void>;
}
