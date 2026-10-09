import { AppNotification, LevelPreference, NotificationPage } from './Notification';

export interface ListOptions {
  unreadOnly?: boolean;
  /** createdAt (ISO) of the last item already shown: returns the ones older than it. */
  before?: string;
  limit?: number;
}

export interface NotificationRepository {
  list(options?: ListOptions): Promise<NotificationPage>;
  unreadCount(): Promise<number>;
  markRead(id: string): Promise<AppNotification>;
  /** Returns how many were marked. */
  markAllRead(): Promise<number>;
  getPreferences(): Promise<LevelPreference[]>;
  updatePreference(preference: LevelPreference): Promise<LevelPreference>;
}
