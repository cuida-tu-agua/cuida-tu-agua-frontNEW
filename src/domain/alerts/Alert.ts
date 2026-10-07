/**
 * HU-025. Urgency levels of the AlertEvent in the docs (02-domain/entities-and-rules.md):
 * critical = leak / closed valve, important = goal exceeded / sensor / bill misaligned,
 * informative = near the goal and reminders.
 */
export type AlertSeverity = 'CRITICAL' | 'IMPORTANT' | 'INFORMATIVE';

/** The 8 alert types configured in the docs (alerts.alert_type_config). */
export type AlertType =
  | 'SUSPECTED_LEAK'
  | 'VALVE_CLOSED'
  | 'GOAL_EXCEEDED'
  | 'SENSOR_DISCONNECTED'
  | 'GOAL_80_PERCENT'
  | 'BILL_MISALIGNED'
  | 'BILL_REGISTER_REMINDER'
  | 'BILL_PAYMENT_REMINDER';

/**
 * One alert of the notification center. Same fields as AlertEvent in the docs
 * (06-data/models.md, alerts.alert_events). Dates are ISO UTC.
 * NOTE: ms-notifications is still "Planned", so this is the DESIGN, not a running contract.
 * If its API names a field differently, adjust it here.
 */
export interface Alert {
  id: string;
  placeId: string;
  alertType: AlertType;
  severity: AlertSeverity;
  /** Short description (max 200 characters). */
  title: string;
  /** Detailed message (max 2000 characters). */
  message: string;
  /** Extra context of the event: e.g. durationMinutes and volumeConsumed of a leak. */
  metadata: Record<string, unknown> | null;
  triggeredAt: string;
  /** When the user marked it as read; null while it is unread. */
  readAt: string | null;
}
