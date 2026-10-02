import { AxiosInstance } from 'axios';
import { PROFILE_ENDPOINTS } from '../../config/api';
import { AvatarFile, UpdateProfileInput, User } from '../../domain/entities/User';
import { ProfileService } from '../../domain/services/AuthServices';
import { toAppError } from '../http/httpError';

export class HttpProfileService implements ProfileService {
  constructor(private readonly http: AxiosInstance) {}

  getMe(): Promise<User> {
    return this.call(() => this.http.get<User>(PROFILE_ENDPOINTS.ME));
  }

  update(input: UpdateProfileInput): Promise<User> {
    return this.call(() => this.http.patch<User>(PROFILE_ENDPOINTS.ME, input));
  }

  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    await this.call(() => this.http.put(PROFILE_ENDPOINTS.PASSWORD, { currentPassword, newPassword }));
  }

  changeAvatar(file: AvatarFile): Promise<User> {
    // React Native's FormData accepts { uri, name, type } for a local file
    const form = new FormData();
    form.append('file', { uri: file.uri, name: file.fileName, type: file.mimeType } as unknown as Blob);

    return this.call(() =>
      this.http.put<User>(PROFILE_ENDPOINTS.AVATAR, form, {
        headers: { 'Content-Type': 'multipart/form-data' },
        transformRequest: (data) => data, // let React Native write the multipart body
        timeout: 30000, // a photo on a slow network takes longer than JSON
      }),
    );
  }

  removeAvatar(): Promise<User> {
    return this.call(() => this.http.delete<User>(PROFILE_ENDPOINTS.AVATAR));
  }

  async deleteAccount(password: string): Promise<void> {
    await this.call(() => this.http.delete(PROFILE_ENDPOINTS.ME, { data: { password } }));
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
