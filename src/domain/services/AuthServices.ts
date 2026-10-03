import { CodeSent, RegisterInput, ResetPasswordInput, Session } from '../entities/Auth';
import { AvatarFile, UpdateProfileInput, User } from '../entities/User';

export interface AuthService {
  register(input: RegisterInput): Promise<CodeSent>;
  verifyEmail(email: string, code: string): Promise<void>;
  resendVerificationCode(email: string): Promise<CodeSent>;
  login(email: string, password: string): Promise<Session>;
  logout(refreshToken: string | null): Promise<void>;
  forgotPassword(identifier: string): Promise<CodeSent>;
  resetPassword(input: ResetPasswordInput): Promise<void>;
}

export interface ProfileService {
  getMe(): Promise<User>;
  update(input: UpdateProfileInput): Promise<User>;
  changePassword(currentPassword: string, newPassword: string): Promise<void>;
  changeAvatar(file: AvatarFile): Promise<User>;
  removeAvatar(): Promise<User>;
  deleteAccount(password: string): Promise<void>;
}
