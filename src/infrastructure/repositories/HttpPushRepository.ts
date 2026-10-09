import { AxiosInstance } from 'axios';
import { PUSH_ENDPOINTS } from '../../config/api';
import { PushRegistration, PushRepository } from '../../domain/push/Push';
import { toAppError } from '../http/httpError';

export class HttpPushRepository implements PushRepository {
  private readonly http: AxiosInstance;

  constructor(http: AxiosInstance) {
    this.http = http;
  }

  async register({ token, platform }: PushRegistration): Promise<void> {
    try {
      await this.http.post(PUSH_ENDPOINTS.TOKENS, { token, platform });
    } catch (error) {
      throw toAppError(error);
    }
  }

  async unregister(token: string): Promise<void> {
    try {
      await this.http.delete(PUSH_ENDPOINTS.TOKENS, { data: { token } });
    } catch (error) {
      throw toAppError(error);
    }
  }
}
