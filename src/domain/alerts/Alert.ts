/**
 * HU-025. Urgency levels of the E7 matrix in the product backlog:
 * critical = leak / closed valve, important = goal exceeded / sensor / bill, info = near the goal.
 */
export type AlertSeverity = 'CRITICAL' | 'IMPORTANT' | 'INFO';

/**
 * Kinds of alert named in E7 (HU-029..HU-033 and the bill alerts).
 * NOTE: the names of these values are assumed. When the alerts API contract is known,
 * adjust them here; the screens only read them through alertRules.
 */
export type AlertType =
  | 'LEAK_SUSPECTED'
  | 'VALVE_CLOSED'
  | 'GOAL_EXCEEDED'
  | 'GOAL_NEAR'
  | 'SENSOR_DISCONNECTED'
  | 'BILL_MISMATCH'
  | 'PAYMENT_REMINDER';

/** One alert of the notification center. Dates are ISO UTC. */
export interface Alert {
  id: string;
  placeId: string;
  placeName: string;
  type: AlertType;
  severity: AlertSeverity;
  message: string;
  createdAt: string;
  read: boolean;
}
