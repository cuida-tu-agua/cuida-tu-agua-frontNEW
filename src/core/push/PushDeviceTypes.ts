import { PushRegistration, PushTapTarget } from '../../domain/push/Push';

/**
 * What the phone itself offers for push. Metro picks the implementation by platform:
 *  - Android / iOS (pushDevice.ts): expo-notifications.
 *  - Web (pushDevice.web.ts): nothing. The browser has no Expo push, so there the inbox + e-mail are the channels.
 */
export interface PushDevice {
  /** Asks permission (once) and returns the Expo token, or null if push is not possible here (web, simulator, denied, no project id). */
  getRegistration(): Promise<PushRegistration | null>;
  /** Called when the user taps a push. Returns how to stop listening. */
  onTap(handler: (target: PushTapTarget) => void): () => void;
  /** The push that opened the app from closed, if any. */
  initialTap(): PushTapTarget | null;
  /** Called when a push arrives while the app is open. Returns how to stop listening. */
  onReceived(handler: () => void): () => void;
}
