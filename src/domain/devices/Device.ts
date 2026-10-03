/** HU-013: same values as the backend enum (JsonStringEnumConverter SnakeCaseUpper). */
export type DeviceStatus = 'CONNECTED' | 'DISCONNECTED' | 'NEVER_REPORTED';

/** Response of GET/POST /api/places/{placeId}/device (ms-devices DeviceView). Dates are ISO UTC. */
export interface Device {
  id: string;
  serialNumber: string;
  placeId: string;
  status: DeviceStatus;
  lastReportAt: string | null;
  linkedAt: string;
  firmwareVersion: string | null;
  inactivityThresholdMinutes: number;
}

/** Body of POST /api/places/{placeId}/device (HU-012). */
export interface LinkDeviceInput {
  serialNumber: string;
  pairingCode: string;
}
