import { Platform } from 'react-native';
import * as Linking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';
import { API_CONFIG, AUTH_ENDPOINTS } from '../../config/api';

/**
 * HU-004 "Continuar con Google" (OAuth 2.0 authorization code flow; ms-iam is the client that talks to Google).
 *  1. The app opens  {ms-iam}/api/auth/google/start?redirect=<where to come back>
 *  2. ms-iam sends the person to Google; Google returns to ms-iam, which finds / links / creates the account
 *  3. ms-iam opens the app address with ?google_code=... (single use, 2 min) or ?google_error=<code>
 *     When the account is re-confirmed before deleting it: ?google_reauth=... (single use, 2 min)
 *  4. The app trades google_code for its session (POST /api/auth/google/exchange)
 * The browser / phone never sees Google's tokens or the client secret.
 */
export type GoogleResult = { code: string } | { reauth: string } | { error: string } | { cancelled: true };

const PARAMS = /[?&]google_(code|error|reauth)=([^&#]*)/;

/** "https://sy-water.tech/?google_code=abc" → { code: 'abc' }; an address without the parameters → null. */
export const readGoogleResult = (url: string | null | undefined): GoogleResult | null => {
  const match = url ? PARAMS.exec(url) : null;
  if (!match) return null;
  const value = decodeURIComponent(match[2].replace(/\+/g, ' '));
  if (!value) return null;
  if (match[1] === 'code') return { code: value };
  return match[1] === 'reauth' ? { reauth: value } : { error: value };
};

export const googleStartUrl = (redirect: string): string =>
  `${API_CONFIG.baseURL}${AUTH_ENDPOINTS.GOOGLE_START}?redirect=${encodeURIComponent(redirect)}`;

/**
 * Web: the same tab goes to Google and the page loads again with the result (see takeWebGoogleResult), so this
 * returns null. Phone: an in-app browser opens and the result comes back here.
 */
export const openGoogleSignIn = (): Promise<GoogleResult | null> =>
  openGoogleFlow((redirect) => Promise.resolve(googleStartUrl(redirect)));

/**
 * Opens Google's consent page for the address `urlFor` builds from the return address (sign-in or re-confirmation).
 * Web: the same tab goes to Google (null is returned, the result comes back on reload). Phone: the in-app browser
 * returns the result.
 */
export const openGoogleFlow = async (
  urlFor: (redirect: string) => Promise<string>,
): Promise<GoogleResult | null> => {
  if (Platform.OS === 'web') {
    const { origin, pathname } = window.location;
    window.location.assign(await urlFor(`${origin}${pathname}`));
    return null;
  }
  const redirect = Linking.createURL('auth/google'); // saveyourwater://auth/google (Expo Go: exp://<pc>:8081/--/auth/google)
  const session = await WebBrowser.openAuthSessionAsync(await urlFor(redirect), redirect);
  if (session.type !== 'success') return { cancelled: true };
  return readGoogleResult(session.url) ?? { cancelled: true };
};

let justTaken: GoogleResult | null = null;

/**
 * Web only: the result Google left in the address bar. It is removed at once so a reload does not reuse it.
 * React may call this twice in a row while rendering (StrictMode), so the value taken stays readable for that tick.
 */
export const takeWebGoogleResult = (): GoogleResult | null => {
  if (Platform.OS !== 'web' || typeof window === 'undefined' || !window.location) return null;
  const result = readGoogleResult(window.location.href);
  if (!result) return justTaken;

  const url = new URL(window.location.href);
  url.searchParams.delete('google_code');
  url.searchParams.delete('google_error');
  url.searchParams.delete('google_reauth');
  window.history.replaceState(window.history.state, '', `${url.pathname}${url.search}${url.hash}`);
  justTaken = result;
  setTimeout(() => {
    justTaken = null;
  }, 0);
  return result;
};
