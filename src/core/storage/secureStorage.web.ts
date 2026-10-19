import type { KeyValueStorage } from './secureStorage';

/**
 * Web version of the session storage: the browser's localStorage (it survives a reload, which is what keeps the
 * user signed in). Browsers have no keychain, so the tokens are readable by scripts of the same origin: that is why
 * the access token is short-lived and every request goes only to our own services.
 * If localStorage is blocked (private mode, disabled cookies) it falls back to memory: the session then lasts
 * until the tab is closed instead of failing.
 */
const memory = new Map<string, string>();

const local = (): Storage | null => {
  try {
    return typeof globalThis !== 'undefined' && 'localStorage' in globalThis ? (globalThis as { localStorage: Storage }).localStorage : null;
  } catch {
    return null; // accessing localStorage can throw when the browser blocks it
  }
};

export const secureStorage: KeyValueStorage = {
  async getItem(key) {
    try {
      const store = local();
      if (store) return store.getItem(key);
    } catch {
      /* use memory */
    }
    return memory.get(key) ?? null;
  },
  async setItem(key, value) {
    try {
      const store = local();
      if (store) {
        store.setItem(key, value);
        return;
      }
    } catch {
      /* use memory */
    }
    memory.set(key, value);
  },
  async removeItem(key) {
    memory.delete(key);
    try {
      local()?.removeItem(key);
    } catch {
      /* nothing else to clean */
    }
  },
};
