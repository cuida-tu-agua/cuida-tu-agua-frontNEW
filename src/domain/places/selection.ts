import { Place } from './Place';

export const markSelected = (places: Place[], placeId: string): Place[] =>
  places.map((place) => (place.isDefault === (place.id === placeId) ? place : { ...place, isDefault: place.id === placeId }));

export const selectedPlace = (places: Place[]): Place | undefined => places.find((place) => place.isDefault);
