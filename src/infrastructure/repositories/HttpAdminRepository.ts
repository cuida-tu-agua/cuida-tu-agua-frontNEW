import { AxiosInstance } from 'axios';
import { ADMIN_ENDPOINTS } from '../../config/api';
import { AdminUser, DEFAULT_PAGE_SIZE, Page, PlatformMetrics, UserQuery } from '../../domain/admin/Admin';
import { AdminRepository } from '../../domain/admin/AdminRepository';
import { toAppError } from '../http/httpError';

export class HttpAdminRepository implements AdminRepository {
  private readonly http: AxiosInstance;

  constructor(http: AxiosInstance) {
    this.http = http;
  }

  async listUsers(query: UserQuery = {}): Promise<Page<AdminUser>> {
    const search = query.search?.trim();
    try {
      const { data } = await this.http.get<Page<AdminUser>>(ADMIN_ENDPOINTS.USERS, {
        params: {
          search: search || undefined,
          status: query.status ?? undefined,
          page: query.page ?? 0,
          size: query.size ?? DEFAULT_PAGE_SIZE,
        },
      });
      return data;
    } catch (error) {
      throw toAppError(error);
    }
  }

  async blockUser(userId: string, reason?: string): Promise<AdminUser> {
    const note = reason?.trim();
    try {
      const { data } = await this.http.put<AdminUser>(ADMIN_ENDPOINTS.BLOCK(userId), note ? { reason: note } : undefined);
      return data;
    } catch (error) {
      throw toAppError(error);
    }
  }

  async unblockUser(userId: string): Promise<AdminUser> {
    try {
      const { data } = await this.http.put<AdminUser>(ADMIN_ENDPOINTS.UNBLOCK(userId));
      return data;
    } catch (error) {
      throw toAppError(error);
    }
  }

  async metrics(): Promise<PlatformMetrics> {
    try {
      const { data } = await this.http.get<PlatformMetrics>(ADMIN_ENDPOINTS.METRICS);
      return data;
    } catch (error) {
      throw toAppError(error);
    }
  }
}
