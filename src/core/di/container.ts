import { AuthService, ProfileService } from '../../domain/services/AuthServices';
import { DeviceRepository } from '../../domain/devices/DeviceRepository';
import { GeographyRepository } from '../../domain/geography/Geography';
import { PlaceRepository } from '../../domain/places/PlaceRepository';
import { HttpAuthService } from '../../infrastructure/repositories/HttpAuthService';
import { HttpDeviceRepository } from '../../infrastructure/repositories/HttpDeviceRepository';
import { HttpGeographyRepository } from '../../infrastructure/repositories/HttpGeographyRepository';
import { HttpPlaceRepository } from '../../infrastructure/repositories/HttpPlaceRepository';
import { HttpProfileService } from '../../infrastructure/repositories/HttpProfileService';
import { apiClient, devicesApiClient, placesApiClient } from '../http/ApiClient';

export const authService: AuthService = new HttpAuthService(apiClient);
export const profileService: ProfileService = new HttpProfileService(apiClient);
export const placeRepository: PlaceRepository = new HttpPlaceRepository(placesApiClient);
export const geographyRepository: GeographyRepository = new HttpGeographyRepository(placesApiClient);
export const deviceRepository: DeviceRepository = new HttpDeviceRepository(devicesApiClient);
