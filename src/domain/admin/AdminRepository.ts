import { AdminUser, Page, PlatformMetrics, UserQuery } from './Admin';

export interface AdminRepository {
  /** HU-059 */
  listUsers(query?: UserQuery): Promise<Page<AdminUser>>;
  /** HU-060: closes every session of the user at once. The reason is optional and goes to the audit log. */
  blockUser(userId: string, reason?: string): Promise<AdminUser>;
  unblockUser(userId: string): Promise<AdminUser>;
  /** HU-062 */
  metrics(): Promise<PlatformMetrics>;
}
