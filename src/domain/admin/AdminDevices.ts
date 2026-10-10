import { DeviceStatus } from '../devices/Device';

/** Admin panel of meters (ms-device, ADMIN role). Dates arrive in ISO 8601, UTC. */
export type AdminStatusFilter = 'ALL' | 'CONNECTED' | 'DISCONNECTED' | 'NEVER_REPORTED' | 'DECOMMISSIONED';
export type AdminLinkFilter = 'ALL' | 'LINKED' | 'FREE';

export const STATUS_FILTERS: { value: AdminStatusFilter; label: string }[] = [
  { value: 'ALL', label: 'Todos' },
  { value: 'CONNECTED', label: 'Conectados' },
  { value: 'DISCONNECTED', label: 'Desconectados' },
  { value: 'NEVER_REPORTED', label: 'Nunca han reportado' },
  { value: 'DECOMMISSIONED', label: 'Dados de baja' },
];

export const LINK_FILTERS: { value: AdminLinkFilter; label: string }[] = [
  { value: 'ALL', label: 'Vinculados y libres' },
  { value: 'LINKED', label: 'Vinculados' },
  { value: 'FREE', label: 'Libres' },
];

export interface AdminDeviceQuery {
  search?: string;
  status?: AdminStatusFilter;
  link?: AdminLinkFilter;
  page?: number;
  size?: number;
}

export interface AdminDeviceRow {
  id: string;
  serialNumber: string;
  status: DeviceStatus;
  decommissioned: boolean;
  linked: boolean;
  lastReportAt: string | null;
  firmwareVersion: string | null;
}

export interface AdminDeviceCounts {
  registered: number;
  linked: number;
  connected: number;
  disconnected: number;
  neverReported: number;
  decommissioned: number;
}

export interface AdminDevicePage {
  items: AdminDeviceRow[];
  page: number;
  size: number;
  totalItems: number;
  totalPages: number;
  counts: AdminDeviceCounts;
}

export type AdminAction = 'REGISTERED' | 'CREDENTIALS_REGENERATED' | 'DECOMMISSIONED';

export interface AdminLogEntry {
  action: AdminAction;
  adminUserId: string;
  adminName: string | null;
  occurredAt: string;
}

export interface AdminPlaceStay {
  placeId: string;
  from: string;
  until: string | null;
}

export interface AdminDeviceDetail {
  id: string;
  serialNumber: string;
  status: DeviceStatus;
  decommissioned: boolean;
  decommissionedAt: string | null;
  placeId: string | null;
  linkedAt: string | null;
  lastReportAt: string | null;
  firmwareVersion: string | null;
  createdAt: string;
  tokenLastUsedAt: string | null;
  failedPairingAttempts: number;
  places: AdminPlaceStay[];
  log: AdminLogEntry[];
}

/** What the server answers when a device is registered or its credentials are renewed. The plain secrets are shown ONCE. */
export interface FactoryDevice {
  id: string;
  serialNumber: string;
  /** As printed on the box: ABCD-EFGH. */
  pairingCode: string;
  authToken: string;
}

export const MAX_BATCH = 50;

export const ACTION_LABELS: Record<AdminAction, string> = {
  REGISTERED: 'Registrado en fábrica',
  CREDENTIALS_REGENERATED: 'Credenciales nuevas',
  DECOMMISSIONED: 'Dado de baja',
};

export type AdminDeviceBadge = { label: string; tone: 'good' | 'warn' | 'bad' | 'neutral' };

/** Decommissioned wins over the connection status: a device that was withdrawn is not "connected" whatever it reported. */
export const badgeOf = (device: Pick<AdminDeviceRow, 'status' | 'decommissioned'>): AdminDeviceBadge => {
  if (device.decommissioned) return { label: 'Dado de baja', tone: 'bad' };
  switch (device.status) {
    case 'CONNECTED':
      return { label: 'Conectado', tone: 'good' };
    case 'DISCONNECTED':
      return { label: 'Desconectado', tone: 'warn' };
    default:
      return { label: 'Nunca ha reportado', tone: 'neutral' };
  }
};

export type CountParseResult = { ok: true; count: number } | { ok: false; error: string };

/** The quantity field of the factory form: a whole number from 1 to 50. */
export const parseCount = (text: string): CountParseResult => {
  const value = text.trim();
  if (!/^\d+$/.test(value)) return { ok: false, error: `Escribe un número entero de 1 a ${MAX_BATCH}.` };
  const count = Number(value);
  return count >= 1 && count <= MAX_BATCH ? { ok: true, count } : { ok: false, error: `Debe ser de 1 a ${MAX_BATCH}.` };
};

/** The serial typed by hand, like the server normalizes it ("sw-esp32-000100" → "SW-ESP32-000100"); null if it is not valid. */
export const normalizeSerial = (text: string): string | null => {
  const value = text.trim().toUpperCase();
  return /^[A-Z0-9-]{4,32}$/.test(value) ? value : null;
};

/** The pairing code without the dash: it is also the password of the setup WiFi of the device. */
export const setupPassword = (device: Pick<FactoryDevice, 'pairingCode'>): string => device.pairingCode.replace('-', '');

/** What the QR of the label says. The app does not read it yet; it carries the same two values the user types. */
export const qrPayload = (device: Pick<FactoryDevice, 'serialNumber' | 'pairingCode'>): string =>
  `saveyourwater://link-device?serial=${encodeURIComponent(device.serialNumber)}&code=${setupPassword(device)}`;

const csvCell = (value: string): string => (/[",\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value);

/** The sheet of the batch (serial, code of the box, token of the firmware). The token is NOT recoverable later. */
export const credentialsCsv = (devices: FactoryDevice[]): string =>
  ['serial,codigo_emparejamiento,token_firmware', ...devices.map((d) => [d.serialNumber, d.pairingCode, d.authToken].map(csvCell).join(','))].join('\n') + '\n';

/** The secrets.py of the ESP32 (see secrets.example.py of the firmware). The broker password is left for the administrator to write. */
export const secretsPy = (device: FactoryDevice, brokerHost: string): string =>
  [
    '# secrets.py of ' + device.serialNumber + ' - generated by the admin panel. NEVER goes into git.',
    `MQTT_HOST = "${brokerHost.trim() || '192.168.X.X'}"`,
    'MQTT_PORT = 1883',
    'MQTT_USER = "sywater-device"',
    'MQTT_PASSWORD = "password-of-sywater-device"   # write the real one (see the mosquitto password file)',
    '',
    `DEVICE_SERIAL = "${device.serialNumber}"`,
    `DEVICE_TOKEN = "${device.authToken}"`,
    '',
    `SETUP_PASSWORD = "${setupPassword(device)}"`,
    '',
    'WIFI_SSID = ""',
    'WIFI_PASSWORD = ""',
    '',
  ].join('\n');
