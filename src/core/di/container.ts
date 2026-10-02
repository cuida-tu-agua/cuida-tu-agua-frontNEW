import { GeographyRepository } from '../../domain/geography/Geography';
import { PlaceRepository } from '../../domain/places/PlaceRepository';
import { HttpGeographyRepository } from '../../infrastructure/repositories/HttpGeographyRepository';
import { HttpPlaceRepository } from '../../infrastructure/repositories/HttpPlaceRepository';
import { placesApiClient } from '../http/ApiClient';


export const placeRepository: PlaceRepository = new HttpPlaceRepository(placesApiClient);
export const geographyRepository: GeographyRepository = new HttpGeographyRepository(placesApiClient);