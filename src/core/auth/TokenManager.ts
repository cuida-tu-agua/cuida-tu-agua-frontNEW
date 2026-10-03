import * as SecureStore from 'expo-secure-store';
import { jwtDecode } from 'jwt-decode';
import { Session } from '../../domain/entities/Auth';
import { User } from '../../domain/entities/User';

interface AccessTokenClaims {
  sub: string;
  exp: number; // seconds since epoch
}

const ACCESS_TOKEN_KEY = 'access_token';
const REFRESH_TOKEN_KEY = 'refresh_token';
const USER_KEY = 'session_user';

class TokenManagerClass {
  async saveSession(session: Session): Promise<void> {
    await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, session.refreshToken);
    await SecureStore.setItemAsync(ACCESS_TOKEN_KEY, session.accessToken);
    await this.saveUser(session.user);
  }

  async saveUser(user: User): Promise<void> {
    await SecureStore.setItemAsync(USER_KEY, JSON.stringify(user));
  }

  getAccessToken(): Promise<string | null> {
    return SecureStore.getItemAsync(ACCESS_TOKEN_KEY);
  }

  getRefreshToken(): Promise<string | null> {
    return SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
  }

  async getUser(): Promise<User | null> {
    const raw = await SecureStore.getItemAsync(USER_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as User;
    } catch {
      return null; // corrupted value: behave as "no session"
    }
  }

  isExpiring(token: string | null, marginMs = 30_000): boolean {
    if (!token) return true;
    try {
      const { exp } = jwtDecode<AccessTokenClaims>(token);
      return exp * 1000 - Date.now() < marginMs;
    } catch {
      return true;
    }
  }

  async clear(): Promise<void> {
    await Promise.all([
      SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY),
      SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY),
      SecureStore.deleteItemAsync(USER_KEY),
    ]);
  }
}

// Singleton: one instance for the whole app
export const tokenManager = new TokenManagerClass();
