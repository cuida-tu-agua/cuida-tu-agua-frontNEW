import { DeviceStatus } from './Device';

/** HU-013 labels, exactly as the acceptance criteria name them. */
export const DEVICE_STATUS_LABELS: Record<DeviceStatus, string> = {
  CONNECTED: 'Conectado',
  DISCONNECTED: 'Desconectado',
  NEVER_REPORTED: 'Nunca ha reportado',
};

/** What the user should do for each status (null = nothing to do). */
export const DEVICE_STATUS_HINTS: Record<DeviceStatus, string | null> = {
  CONNECTED: null,
  DISCONNECTED: 'El medidor dejó de reportar. Revisa que tenga energía y que el WiFi funcione.',
  NEVER_REPORTED: 'El medidor aún no ha enviado datos. Revisa que esté encendido y conectado al WiFi.',
};

/**
 * "hace 2 min", "hace 3 h", "hace 5 días". Pure function: "now" is a parameter so it can be tested.
 */
export const formatLastReport = (iso: string | null, now: Date = new Date()): string => {
  if (!iso) return 'Sin reportes todavía';

  // max(0): if the phone clock is a bit behind the server, never show "hace -1 min"
  const seconds = Math.max(0, Math.floor((now.getTime() - new Date(iso).getTime()) / 1000));
  if (seconds < 60) return 'hace menos de 1 min';

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `hace ${minutes} min`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `hace ${hours} h`;

  const days = Math.floor(hours / 24);
  return days === 1 ? 'hace 1 día' : `hace ${days} días`;
};
