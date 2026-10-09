import { PushRepository } from '../../domain/push/Push';
import { KeyValueStorage } from '../storage/secureStorage';
import { PushDevice } from './PushDeviceTypes';

export const PUSH_TOKEN_KEY = 'sywater.push_token';

/**
 * HU-026: connects this phone to the alerts of the signed-in user.
 *  - enable(): after login (and every time the app opens signed in) the token is (re)registered, so it follows the user.
 *  - disable(): on logout the token is removed, so the next person on this phone never gets the previous user's alerts.
 * Both are best effort: push never blocks the app.
 */
export class PushService {
  constructor(
    private readonly device: PushDevice,
    private readonly repository: PushRepository,
    private readonly storage: KeyValueStorage,
  ) {}

  /** @returns true if this phone is now registered. */
  async enable(): Promise<boolean> {
    try {
      const registration = await this.device.getRegistration();
      if (!registration) return false;
      await this.repository.register(registration);
      await this.storage.setItem(PUSH_TOKEN_KEY, registration.token);
      return true;
    } catch {
      return false;
    }
  }

  async disable(): Promise<void> {
    try {
      const token = await this.storage.getItem(PUSH_TOKEN_KEY);
      if (!token) return;
      await this.repository.unregister(token);
      await this.storage.removeItem(PUSH_TOKEN_KEY);
    } catch {
      // Could not reach the server: the token stays here and the next login on this phone takes it over anyway
    }
  }
}
