import { AdminRepository } from '../../domain/admin/AdminRepository';
import { AuthService, ProfileService } from '../../domain/services/AuthServices';
import { ConsumptionRepository } from '../../domain/consumption/ConsumptionRepository';
import { DeviceRepository } from '../../domain/devices/DeviceRepository';
import { GeographyRepository } from '../../domain/geography/Geography';
import { NotificationRepository } from '../../domain/notifications/NotificationRepository';
import { PlaceRepository } from '../../domain/places/PlaceRepository';
import { ValveRepository } from '../../domain/valve/ValveRepository';
import { HttpAdminRepository } from '../../infrastructure/repositories/HttpAdminRepository';
import { HttpAuthService } from '../../infrastructure/repositories/HttpAuthService';
import { HttpConsumptionRepository } from '../../infrastructure/repositories/HttpConsumptionRepository';
import { HttpDeviceRepository } from '../../infrastructure/repositories/HttpDeviceRepository';
import { HttpGeographyRepository } from '../../infrastructure/repositories/HttpGeographyRepository';
import { HttpNotificationRepository } from '../../infrastructure/repositories/HttpNotificationRepository';
import { HttpPlaceRepository } from '../../infrastructure/repositories/HttpPlaceRepository';
import { HttpProfileService } from '../../infrastructure/repositories/HttpProfileService';
import { HttpValveRepository } from '../../infrastructure/repositories/HttpValveRepository';
import {
  apiClient,
  consumptionApiClient,
  devicesApiClient,
  notificationsApiClient,
  placesApiClient,
  valveApiClient,
} from '../http/ApiClient';

export const authService: AuthService = new HttpAuthService(apiClient);
export const profileService: ProfileService = new HttpProfileService(apiClient);
export const placeRepository: PlaceRepository = new HttpPlaceRepository(placesApiClient);
export const geographyRepository: GeographyRepository = new HttpGeographyRepository(placesApiClient);
export const deviceRepository: DeviceRepository = new HttpDeviceRepository(devicesApiClient);
export const consumptionRepository: ConsumptionRepository = new HttpConsumptionRepository(consumptionApiClient);
export const valveRepository: ValveRepository = new HttpValveRepository(valveApiClient, apiClient);
export const notificationRepository: NotificationRepository = new HttpNotificationRepository(notificationsApiClient);
export const adminRepository: AdminRepository = new HttpAdminRepository(apiClient);
