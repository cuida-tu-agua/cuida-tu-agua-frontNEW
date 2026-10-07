import { Alert, AlertSeverity, AlertType } from './Alert';

/** HU-025: names shown to the user for each kind of alert. */
export const ALERT_TYPE_LABELS: Record<AlertType, string> = {
  SUSPECTED_LEAK: 'Fuga sospechosa',
  VALVE_CLOSED: 'Válvula cerrada',
  GOAL_EXCEEDED: 'Meta superada',
  SENSOR_DISCONNECTED: 'Sensor desconectado',
  GOAL_80_PERCENT: 'Cerca de la meta',
  BILL_MISALIGNED: 'Recibo desalineado',
  BILL_REGISTER_REMINDER: 'Recordatorio de recibo',
  BILL_PAYMENT_REMINDER: 'Recordatorio de pago',
};

export const SEVERITY_LABELS: Record<AlertSeverity, string> = {
  CRITICAL: 'Crítica',
  IMPORTANT: 'Importante',
  INFORMATIVE: 'Informativa',
};

export const isRead = (alert: Alert): boolean => alert.readAt !== null;

/** Most recent first, as the acceptance criteria ask. Returns a new array. */
export const sortNewestFirst = (alerts: Alert[]): Alert[] =>
  [...alerts].sort((a, b) => new Date(b.triggeredAt).getTime() - new Date(a.triggeredAt).getTime());

export const countUnread = (alerts: Alert[]): number => alerts.filter((a) => !isRead(a)).length;

/** Text of the red badge on the bell: nothing when there is nothing unread, "99+" when too many. */
export const formatBadgeCount = (count: number): string | null => {
  if (count <= 0) return null;
  return count > 99 ? '99+' : String(count);
};

/** Optimistic update: the list with one alert marked as read (an alert already read keeps its date). */
export const markAsReadLocally = (alerts: Alert[], alertId: string, now: Date = new Date()): Alert[] =>
  alerts.map((a) => (a.id === alertId && !isRead(a) ? { ...a, readAt: now.toISOString() } : a));

/** Optimistic update: the list without one alert. */
export const removeLocally = (alerts: Alert[], alertId: string): Alert[] =>
  alerts.filter((a) => a.id !== alertId);
