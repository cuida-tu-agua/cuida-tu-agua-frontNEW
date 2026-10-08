import { Alert } from './Alert';

/**
 * Port: what the notification center needs from the alerts service (HU-025).
 * The adapter throws AppError, never axios errors.
 */
export interface AlertRepository {
  /** All the alerts of the user, in any order (the screen sorts them). */
  list(): Promise<Alert[]>;

  /** Marks one alert as read. */
  markAsRead(alertId: string): Promise<void>;

  /** Deletes one alert. */
  remove(alertId: string): Promise<void>;
}
