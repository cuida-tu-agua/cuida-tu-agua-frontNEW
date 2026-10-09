import Constants from 'expo-constants';
import { Platform } from 'react-native';

export interface UrlContext {
  /** Value of the EXPO_PUBLIC_* variable, if the project defines one. */
  configured?: string | null;
  /** Port the service listens on (3001 ms-iam ... 3006 ms-notification). */
  port: number;
  /** Set on web: the address the site itself was loaded from. */
  web?: { protocol: string; hostname: string } | null;
  /** Set in development on Android / iOS: the computer that serves the bundle (Expo's hostUri). */
  devHost?: string | null;
  platform?: string;
}

/**
 * Address of one backend service. ONE project for web and mobile, so the address is decided here and not by hand:
 *  1. The EXPO_PUBLIC_* variable, when it is set (production builds, or to force a specific server).
 *  2. Web: the same host that served the page, on the service port (open the site from the PC or from the LAN
 *     and the API is found by itself; in production a reverse proxy or the variable of step 1 takes over).
 *  3. Phone with Expo (development): the computer running `expo start`, so nobody types an IP.
 *  4. Android emulator: 10.0.2.2 is the PC; anything else falls back to localhost.
 */
export const resolveServiceUrl = ({ configured, port, web, devHost, platform = Platform.OS }: UrlContext): string => {
  const explicit = configured?.trim();
  if (explicit) return explicit.replace(/\/+$/, '');
  if (web?.hostname) return `${web.protocol}//${web.hostname}:${port}`;
  if (devHost) return `http://${devHost}:${port}`;
  return `http://${platform === 'android' ? '10.0.2.2' : 'localhost'}:${port}`;
};

const webLocation = (): UrlContext['web'] => {
  if (Platform.OS !== 'web' || typeof window === 'undefined' || !window.location) return null;
  return { protocol: window.location.protocol, hostname: window.location.hostname };
};

const expoDevHost = (): string | null => {
  const hostUri = Constants.expoConfig?.hostUri;   // "10.3.234.128:8081" while `expo start` is running
  const host = hostUri?.split(':')[0];
  return host || null;
};

/** The EXPO_PUBLIC_* value must be read by its literal name at the call site: Metro replaces it at build time. */
export const serviceUrl = (configured: string | undefined, port: number): string =>
  resolveServiceUrl({ configured, port, web: webLocation(), devHost: expoDevHost() });
