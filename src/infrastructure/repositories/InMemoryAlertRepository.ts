import { AppError } from '../../domain/common/AppError';
import { Alert } from '../../domain/alerts/Alert';
import { AlertRepository } from '../../domain/alerts/AlertRepository';

const hoursAgo = (hours: number): string => new Date(Date.now() - hours * 3_600_000).toISOString();

/**
 * Example data to see the notification center working WITHOUT a backend: the same shape as the
 * AlertEvent of the docs, one alert of each level, some read and some not. The metadata of the leak
 * and of the closed valve follow the payloads of the LeakSuspected and ValveClosed events.
 * Only used while ms-notifications does not exist yet (see container.ts).
 */
export const sampleAlerts = (): Alert[] => [
  {
    id: 'sample-1',
    placeId: 'place-1',
    alertType: 'SUSPECTED_LEAK',
    severity: 'CRITICAL',
    title: 'Posible fuga de agua',
    message: 'El agua lleva más de 30 minutos corriendo sin parar. Podría ser una fuga.',
    metadata: { detectedAt: hoursAgo(1), durationMinutes: 35, volumeConsumed: 120.5, isNighttime: true, unit: 'LITERS' },
    triggeredAt: hoursAgo(1),
    readAt: null,
  },
  {
    id: 'sample-2',
    placeId: 'place-1',
    alertType: 'VALVE_CLOSED',
    severity: 'CRITICAL',
    title: 'Se cerró el paso del agua',
    message: 'La válvula se cerró de forma manual.',
    metadata: { origin: 'MANUAL', confirmedAt: hoursAgo(5) },
    triggeredAt: hoursAgo(5),
    readAt: null,
  },
  {
    id: 'sample-3',
    placeId: 'place-2',
    alertType: 'SENSOR_DISCONNECTED',
    severity: 'IMPORTANT',
    title: 'Sensor desconectado',
    message: 'El medidor dejó de reportar. Revisa que tenga energía y WiFi.',
    metadata: null,
    triggeredAt: hoursAgo(26),
    readAt: hoursAgo(20),
  },
  {
    id: 'sample-4',
    placeId: 'place-1',
    alertType: 'GOAL_80_PERCENT',
    severity: 'INFORMATIVE',
    title: 'Vas en el 80% de tu meta',
    message: 'Ya usaste el 80% de tu meta de este mes.',
    metadata: null,
    triggeredAt: hoursAgo(72),
    readAt: hoursAgo(70),
  },
];

/** Adapter that keeps the alerts in memory. Implements the port without any network call. */
export class InMemoryAlertRepository implements AlertRepository {
  private alerts: Alert[];

  constructor(initial: Alert[] = []) {
    this.alerts = initial.map((a) => ({ ...a }));
  }

  async list(): Promise<Alert[]> {
    return this.alerts.map((a) => ({ ...a }));
  }

  async markAsRead(alertId: string): Promise<void> {
    const alert = this.requireAlert(alertId);
    if (alert.readAt === null) alert.readAt = new Date().toISOString();
  }

  async remove(alertId: string): Promise<void> {
    this.requireAlert(alertId);
    this.alerts = this.alerts.filter((a) => a.id !== alertId);
  }

  private requireAlert(alertId: string): Alert {
    const found = this.alerts.find((a) => a.id === alertId);
    if (!found) throw new AppError('not_found', 'La alerta ya no existe.', {}, { code: 'alert.not_found' });
    return found;
  }
}
