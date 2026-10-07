import { AppError } from '../../domain/common/AppError';
import { Alert } from '../../domain/alerts/Alert';
import { AlertRepository } from '../../domain/alerts/AlertRepository';

const hoursAgo = (hours: number): string => new Date(Date.now() - hours * 3_600_000).toISOString();

/**
 * Example data to see the notification center working WITHOUT a backend:
 * one alert of each level, some read and some not. Only used while the real alerts
 * service contract is unknown (see container.ts).
 */
export const sampleAlerts = (): Alert[] => [
  {
    id: 'sample-1',
    placeId: 'place-1',
    placeName: 'Casa',
    type: 'LEAK_SUSPECTED',
    severity: 'CRITICAL',
    message: 'El agua lleva corriendo más de 30 minutos sin parar. Podría ser una fuga.',
    createdAt: hoursAgo(1),
    read: false,
  },
  {
    id: 'sample-2',
    placeId: 'place-1',
    placeName: 'Casa',
    type: 'VALVE_CLOSED',
    severity: 'CRITICAL',
    message: 'Se cerró el paso del agua.',
    createdAt: hoursAgo(5),
    read: false,
  },
  {
    id: 'sample-3',
    placeId: 'place-2',
    placeName: 'Local',
    type: 'SENSOR_DISCONNECTED',
    severity: 'IMPORTANT',
    message: 'El medidor dejó de reportar. Revisa que tenga energía y WiFi.',
    createdAt: hoursAgo(26),
    read: true,
  },
  {
    id: 'sample-4',
    placeId: 'place-1',
    placeName: 'Casa',
    type: 'GOAL_NEAR',
    severity: 'INFO',
    message: 'Ya usaste el 80% de tu meta de este mes.',
    createdAt: hoursAgo(72),
    read: true,
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
    this.requireAlert(alertId).read = true;
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
