import { AxiosInstance } from 'axios';
import { Platform } from 'react-native';
import { PROFILE_ENDPOINTS } from '../../config/api';
import { AvatarFile, SignInMethods, UpdateProfileInput, User } from '../../domain/entities/User';
import { PhoneChannel, PhoneCodeSent, PhoneCountry } from '../../domain/phone/PhoneVerification';
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

  async changeAvatar(file: AvatarFile): Promise<User> {
    const form = new FormData();
    if (Platform.OS === 'web') {
      // The browser needs a real File; a { uri } object would be sent as plain text
      const blob = await (await fetch(file.uri)).blob();
      form.append('file', blob, file.fileName);
      // The client's default is JSON: drop it so the browser writes multipart/form-data with its boundary
      return this.call(() =>
        this.http.put<User>(PROFILE_ENDPOINTS.AVATAR, form, { headers: { 'Content-Type': false }, timeout: 30000 }),
      );
    }
    // React Native's FormData accepts { uri, name, type } for a local file
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

  signInMethods(): Promise<SignInMethods> {
    return this.call(() => this.http.get<SignInMethods>(PROFILE_ENDPOINTS.SIGN_IN_METHODS));
  }

  async startGoogleReauth(redirect: string): Promise<string> {
    const { url } = await this.call(() =>
      this.http.post<{ url: string }>(`${PROFILE_ENDPOINTS.GOOGLE_REAUTH}?redirect=${encodeURIComponent(redirect)}`),
    );
    return url;
  }

  async deleteAccount(password?: string, googleReauthCode?: string): Promise<void> {
    await this.call(() => this.http.delete(PROFILE_ENDPOINTS.ME, { data: { password, googleReauthCode } }));
  }

  requestPhoneCode(country: PhoneCountry, phone: string, channel: PhoneChannel): Promise<PhoneCodeSent> {
    return this.call(() => this.http.post<PhoneCodeSent>(PROFILE_ENDPOINTS.PHONE_VERIFICATION, { country, phone, channel }));
  }

  confirmPhone(code: string): Promise<User> {
    return this.call(() => this.http.post<User>(PROFILE_ENDPOINTS.PHONE_VERIFICATION_CONFIRM, { code }));
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
