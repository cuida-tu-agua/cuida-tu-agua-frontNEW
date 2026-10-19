import { CodeSent, RegisterInput, ResetPasswordInput, Session } from '../entities/Auth';
import { AvatarFile, SignInMethods, UpdateProfileInput, User } from '../entities/User';

export interface AuthService {
  register(input: RegisterInput): Promise<CodeSent>;
  verifyEmail(email: string, code: string): Promise<void>;
  resendVerificationCode(email: string): Promise<CodeSent>;
  login(email: string, password: string): Promise<Session>;
  logout(refreshToken: string | null): Promise<void>;
  forgotPassword(identifier: string): Promise<CodeSent>;
  resetPassword(input: ResetPasswordInput): Promise<void>;
  /** HU-004: true when the server has "Continuar con Google" configured. */
  googleEnabled(): Promise<boolean>;
  /** HU-004: trades the single-use code that comes back from Google for the session. */
  exchangeGoogleCode(code: string): Promise<Session>;
}

export interface ProfileService {
  getMe(): Promise<User>;
  update(input: UpdateProfileInput): Promise<User>;
  changePassword(currentPassword: string, newPassword: string): Promise<void>;
  changeAvatar(file: AvatarFile): Promise<User>;
  removeAvatar(): Promise<User>;
  signInMethods(): Promise<SignInMethods>;
  /** HU-004: Google's consent page to confirm the account; the app opens the returned address. */
  startGoogleReauth(redirect: string): Promise<string>;
  /** Pass the password, or the Google code of startGoogleReauth for accounts created with Google. */
  deleteAccount(password?: string, googleReauthCode?: string): Promise<void>;
}
