import { AdminDeviceRepository } from '../../domain/admin/AdminDeviceRepository';
import { AdminRepository } from '../../domain/admin/AdminRepository';
import { AuthService, ProfileService } from '../../domain/services/AuthServices';
import { ConsumptionRepository } from '../../domain/consumption/ConsumptionRepository';
import { DeviceRepository } from '../../domain/devices/DeviceRepository';
import { GeographyRepository } from '../../domain/geography/Geography';
import { NotificationRepository } from '../../domain/notifications/NotificationRepository';
import { PlaceRepository } from '../../domain/places/PlaceRepository';
import { PushRepository } from '../../domain/push/Push';
import { TariffRepository } from '../../domain/tariffs/TariffRepository';
import { AdminTipRepository, TipRepository } from '../../domain/tips/TipRepository';
import { ValveRepository } from '../../domain/valve/ValveRepository';
import { HttpAdminDeviceRepository } from '../../infrastructure/repositories/HttpAdminDeviceRepository';
import { HttpAdminRepository } from '../../infrastructure/repositories/HttpAdminRepository';
import { HttpAuthService } from '../../infrastructure/repositories/HttpAuthService';
import { HttpConsumptionRepository } from '../../infrastructure/repositories/HttpConsumptionRepository';
import { HttpDeviceRepository } from '../../infrastructure/repositories/HttpDeviceRepository';
import { HttpGeographyRepository } from '../../infrastructure/repositories/HttpGeographyRepository';
import { HttpNotificationRepository } from '../../infrastructure/repositories/HttpNotificationRepository';
import { HttpTariffRepository } from '../../infrastructure/repositories/HttpTariffRepository';
import { HttpTipRepository } from '../../infrastructure/repositories/HttpTipRepository';
import { HttpPushRepository } from '../../infrastructure/repositories/HttpPushRepository';
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
import { pushDevice } from '../push/pushDevice';
import { PushService } from '../push/PushService';
import { secureStorage } from '../storage/secureStorage';

export const authService: AuthService = new HttpAuthService(apiClient);
export const profileService: ProfileService = new HttpProfileService(apiClient);
export const placeRepository: PlaceRepository = new HttpPlaceRepository(placesApiClient);
export const geographyRepository: GeographyRepository = new HttpGeographyRepository(placesApiClient);
export const deviceRepository: DeviceRepository = new HttpDeviceRepository(devicesApiClient);
export const consumptionRepository: ConsumptionRepository = new HttpConsumptionRepository(consumptionApiClient);
export const valveRepository: ValveRepository = new HttpValveRepository(valveApiClient, apiClient);
export const notificationRepository: NotificationRepository = new HttpNotificationRepository(notificationsApiClient);
export const pushRepository: PushRepository = new HttpPushRepository(notificationsApiClient);
export const pushService = new PushService(pushDevice, pushRepository, secureStorage);
export const adminRepository: AdminRepository = new HttpAdminRepository(apiClient);
export const adminDeviceRepository: AdminDeviceRepository = new HttpAdminDeviceRepository(devicesApiClient);
export const tariffRepository: TariffRepository = new HttpTariffRepository(placesApiClient);
const tips = new HttpTipRepository(placesApiClient);
export const tipRepository: TipRepository = tips;
export const adminTipRepository: AdminTipRepository = tips;
