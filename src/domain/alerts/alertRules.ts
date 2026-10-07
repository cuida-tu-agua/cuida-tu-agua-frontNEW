import { Alert, AlertSeverity, AlertType } from './Alert';

/** HU-025: names shown to the user for each kind of alert. */
export const ALERT_TYPE_LABELS: Record<AlertType, string> = {
  LEAK_SUSPECTED: 'Fuga sospechosa',
  VALVE_CLOSED: 'Válvula cerrada',
  GOAL_EXCEEDED: 'Meta superada',
  GOAL_NEAR: 'Cerca de la meta',
  SENSOR_DISCONNECTED: 'Sensor desconectado',
  BILL_MISMATCH: 'Recibo desalineado',
  PAYMENT_REMINDER: 'Recordatorio de pago',
};

export const SEVERITY_LABELS: Record<AlertSeverity, string> = {
  CRITICAL: 'Crítica',
  IMPORTANT: 'Importante',
  INFO: 'Informativa',
};

/** Most recent first, as the acceptance criteria ask. Returns a new array. */
export const sortNewestFirst = (alerts: Alert[]): Alert[] =>
  [...alerts].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

export const countUnread = (alerts: Alert[]): number => alerts.filter((a) => !a.read).length;

/** Text of the red badge on the bell: nothing when there is nothing unread, "99+" when too many. */
export const formatBadgeCount = (count: number): string | null => {
  if (count <= 0) return null;
  return count > 99 ? '99+' : String(count);
};

/** Optimistic update: the list with one alert marked as read. */
export const markAsReadLocally = (alerts: Alert[], alertId: string): Alert[] =>
  alerts.map((a) => (a.id === alertId ? { ...a, read: true } : a));

/** Optimistic update: the list without one alert. */
export const removeLocally = (alerts: Alert[], alertId: string): Alert[] =>
  alerts.filter((a) => a.id !== alertId);
