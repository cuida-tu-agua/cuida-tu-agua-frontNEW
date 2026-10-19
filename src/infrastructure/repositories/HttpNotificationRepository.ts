import { AxiosInstance } from 'axios';
import { NOTIFICATION_ENDPOINTS } from '../../config/api';
import { AppNotification, LevelPreference, NotificationPage, PAGE_SIZE } from '../../domain/notifications/Notification';
import { ListOptions, NotificationRepository } from '../../domain/notifications/NotificationRepository';
import { toAppError } from '../http/httpError';

export class HttpNotificationRepository implements NotificationRepository {
  private readonly http: AxiosInstance;

  constructor(http: AxiosInstance) {
    this.http = http;
  }

  async list(options: ListOptions = {}): Promise<NotificationPage> {
    const limit = options.limit ?? PAGE_SIZE;
    try {
      const { data } = await this.http.get<AppNotification[]>(NOTIFICATION_ENDPOINTS.LIST, {
        params: { unreadOnly: options.unreadOnly ? true : undefined, before: options.before, limit },
      });
      // A full page means there may be more; a short one is the end of the inbox
      return { items: data, hasMore: data.length >= limit };
    } catch (error) {
      throw toAppError(error);
    }
  }

  async unreadCount(): Promise<number> {
    try {
      const { data } = await this.http.get<{ count: number }>(NOTIFICATION_ENDPOINTS.UNREAD_COUNT);
      return data.count;
    } catch (error) {
      throw toAppError(error);
    }
  }

  async markRead(id: string): Promise<AppNotification> {
    try {
      const { data } = await this.http.post<AppNotification>(NOTIFICATION_ENDPOINTS.READ(id));
      return data;
    } catch (error) {
      throw toAppError(error);
    }
  }

  async markAllRead(): Promise<number> {
    try {
      const { data } = await this.http.post<{ marked: number }>(NOTIFICATION_ENDPOINTS.READ_ALL);
      return data.marked;
    } catch (error) {
      throw toAppError(error);
    }
  }

  async getPreferences(): Promise<LevelPreference[]> {
    try {
      const { data } = await this.http.get<{ levels: LevelPreference[] }>(NOTIFICATION_ENDPOINTS.PREFERENCES);
      return data.levels;
    } catch (error) {
      throw toAppError(error);
    }
  }

  async updatePreference(preference: LevelPreference): Promise<LevelPreference> {
    const { severity, ...channels } = preference;
    try {
      const { data } = await this.http.put<LevelPreference>(NOTIFICATION_ENDPOINTS.PREFERENCE(severity), channels);
      return data;
    } catch (error) {
      throw toAppError(error);
    }
  }
}
