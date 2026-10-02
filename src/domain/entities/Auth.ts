import { User } from './User';

export interface Session {
  accessToken: string;
  accessExpiresAt: string;
  refreshToken: string;
  refreshExpiresAt: string;
  user: User;
}

export interface CodeSent {
  maskedEmail: string;
  expiresAt: string;
}

export interface RegisterInput {
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  password: string;
}

export interface ResetPasswordInput {
  identifier: string; // e-mail or phone
  code: string;
  newPassword: string;
}
