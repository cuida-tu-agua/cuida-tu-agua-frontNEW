import { AuthService, ProfileService } from '../../domain/services/AuthServices';
import { GeographyRepository } from '../../domain/geography/Geography';
import { PlaceRepository } from '../../domain/places/PlaceRepository';
import { HttpAuthService } from '../../infrastructure/repositories/HttpAuthService';
import { HttpGeographyRepository } from '../../infrastructure/repositories/HttpGeographyRepository';
import { HttpPlaceRepository } from '../../infrastructure/repositories/HttpPlaceRepository';
import { HttpProfileService } from '../../infrastructure/repositories/HttpProfileService';
import { apiClient, placesApiClient } from '../http/ApiClient';

export const authService: AuthService = new HttpAuthService(apiClient);
export const profileService: ProfileService = new HttpProfileService(apiClient);
export const placeRepository: PlaceRepository = new HttpPlaceRepository(placesApiClient);
export const geographyRepository: GeographyRepository = new HttpGeographyRepository(placesApiClient);
