import { Device, LinkDeviceInput } from './Device';

/**
 * Port: what the screens need from device-service. The adapter (HttpDeviceRepository)
 * throws AppError, never axios errors.
 */
export interface DeviceRepository {
  /** HU-013: the device of the place, or null when the place has none. */
  getByPlace(placeId: string): Promise<Device | null>;

  /** HU-012: link a device using the serial and the pairing code printed on the box. */
  link(placeId: string, input: LinkDeviceInput): Promise<Device>;

  /** HU-014: unlink the device of the place (the history is kept in the backend). */
  unlink(placeId: string): Promise<void>;
}
