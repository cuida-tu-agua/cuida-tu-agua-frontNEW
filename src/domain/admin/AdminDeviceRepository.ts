import { AdminDeviceDetail, AdminDevicePage, AdminDeviceQuery, FactoryDevice } from './AdminDevices';

export interface AdminDeviceRepository {
  list(query?: AdminDeviceQuery): Promise<AdminDevicePage>;
  get(id: string): Promise<AdminDeviceDetail>;
  /** Factory registration: the next `count` serials, or one specific serial. Returns the plain credentials (shown once). */
  register(input: { count?: number; serialNumber?: string }): Promise<FactoryDevice[]>;
  regenerateCredentials(id: string): Promise<FactoryDevice>;
  decommission(id: string): Promise<AdminDeviceDetail>;
}
