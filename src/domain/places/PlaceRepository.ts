import { CreatePlaceInput, Place, UpdatePlaceInput } from './Place';

export interface PlaceRepository {
  create(input: CreatePlaceInput): Promise<Place>;
  getById(placeId: string): Promise<Place>;
  update(placeId: string, input: UpdatePlaceInput): Promise<Place>;
}