import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { authService, pushService } from '../di/container';
import { refreshAccessToken, setSessionExpiredHandler } from '../http/ApiClient';
import { tokenManager } from './TokenManager';
import { AppError } from '../../domain/common/AppError';
import { User } from '../../domain/entities/User';
import { normalizeEmail } from '../../presentation/utils/validation';

export type AuthStatus = 'loading' | 'signedOut' | 'signedIn';

export type SignedOutReason = 'expired' | 'deleted' | null;

interface AuthContextValue {
  status: AuthStatus;
  user: User | null;
  signedOutReason: SignedOutReason;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  endSession: (reason: SignedOutReason) => Promise<void>;
  updateUser: (user: User) => Promise<void>;
  clearSignedOutReason: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const MIN_SPLASH_MS = 800; // enough to see the logo, short enough not to annoy

const restoreSession = async (): Promise<User | null> => {
  const [user, refreshToken, accessToken] = await Promise.all([
    tokenManager.getUser(),
    tokenManager.getRefreshToken(),
    tokenManager.getAccessToken(),
  ]);
  if (!user || !refreshToken) return null;
  if (!tokenManager.isExpiring(accessToken)) return user;

  try {
    await refreshAccessToken();
    return (await tokenManager.getUser()) ?? user;
  } catch (error) {
    return error instanceof AppError && error.kind === 'network' ? user : null;
  }
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [status, setStatus] = useState<AuthStatus>('loading');
  const [user, setUser] = useState<User | null>(null);
  const [signedOutReason, setSignedOutReason] = useState<SignedOutReason>(null);

  useEffect(() => {
    let active = true;
    const minimumSplash = new Promise((resolve) => setTimeout(resolve, MIN_SPLASH_MS));

    Promise.all([restoreSession().catch(() => null), minimumSplash]).then(([restored]) => {
      if (!active) return;
      setUser(restored);
      setStatus(restored ? 'signedIn' : 'signedOut');
    });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    setSessionExpiredHandler(() => {
      setUser(null);
      setStatus('signedOut');
      setSignedOutReason('expired');
    });
    return () => setSessionExpiredHandler(null);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const session = await authService.login(normalizeEmail(email), password);
    await tokenManager.saveSession(session);
    setSignedOutReason(null);
    setUser(session.user);
    setStatus('signedIn');
  }, []);

  const endSession = useCallback(async (reason: SignedOutReason) => {
    await tokenManager.clear();
    setUser(null);
    setStatus('signedOut');
    setSignedOutReason(reason);
  }, []);

  const logout = useCallback(async () => {
    // First, while the session still works: this phone must stop receiving the alerts of the user who is leaving
    await pushService.disable();
    if (tokenManager.isExpiring(await tokenManager.getAccessToken())) {
      await refreshAccessToken().catch(() => undefined);
    }
    const refreshToken = await tokenManager.getRefreshToken();
    await authService.logout(refreshToken).catch(() => undefined);
    await endSession(null);
  }, [endSession]);

  const updateUser = useCallback(async (updated: User) => {
    await tokenManager.saveUser(updated);
    setUser(updated);
  }, []);

  const clearSignedOutReason = useCallback(() => setSignedOutReason(null), []);

  const value = useMemo<AuthContextValue>(
    () => ({ status, user, signedOutReason, login, logout, endSession, updateUser, clearSignedOutReason }),
    [status, user, signedOutReason, login, logout, endSession, updateUser, clearSignedOutReason],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextValue => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside AuthProvider');
  return context;
};
