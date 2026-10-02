import { AxiosInstance } from 'axios';
import { AUTH_ENDPOINTS } from '../../config/api';
import { CodeSent, RegisterInput, ResetPasswordInput, Session } from '../../domain/entities/Auth';
import { AuthService } from '../../domain/services/AuthServices';
import { toAppError } from '../http/httpError';

export class HttpAuthService implements AuthService {
  constructor(private readonly http: AxiosInstance) {}

  register(input: RegisterInput): Promise<CodeSent> {
    return this.call(() => this.http.post<CodeSent>(AUTH_ENDPOINTS.REGISTER, input));
  }

  async verifyEmail(email: string, code: string): Promise<void> {
    await this.call(() => this.http.post(AUTH_ENDPOINTS.VERIFY_EMAIL, { email, code }));
  }

  resendVerificationCode(email: string): Promise<CodeSent> {
    return this.call(() => this.http.post<CodeSent>(AUTH_ENDPOINTS.RESEND_VERIFICATION, { email }));
  }

  login(email: string, password: string): Promise<Session> {
    return this.call(() => this.http.post<Session>(AUTH_ENDPOINTS.LOGIN, { email, password }));
  }

  async logout(refreshToken: string | null): Promise<void> {
    await this.call(() => this.http.post(AUTH_ENDPOINTS.LOGOUT, refreshToken ? { refreshToken } : {}));
  }

  forgotPassword(identifier: string): Promise<CodeSent> {
    return this.call(() => this.http.post<CodeSent>(AUTH_ENDPOINTS.FORGOT_PASSWORD, { identifier }));
  }

  async resetPassword(input: ResetPasswordInput): Promise<void> {
    await this.call(() => this.http.post(AUTH_ENDPOINTS.RESET_PASSWORD, input));
  }

  private async call<T>(request: () => Promise<{ data: T }>): Promise<T> {
    try {
      const { data } = await request();
      return data;
    } catch (error) {
      throw toAppError(error);
    }
  }
}
