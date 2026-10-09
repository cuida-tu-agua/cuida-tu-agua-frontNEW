import * as SecureStore from 'expo-secure-store';

/**
 * Where the session lives. Same contract on every platform; Metro picks the file by platform:
 *  - Android / iOS (this file): the system keychain (expo-secure-store).
 *  - Web: secureStorage.web.ts (expo-secure-store does not exist in a browser).
 */
export interface KeyValueStorage {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
  removeItem(key: string): Promise<void>;
}

export const secureStorage: KeyValueStorage = {
  getItem: (key) => SecureStore.getItemAsync(key),
  setItem: (key, value) => SecureStore.setItemAsync(key, value),
  removeItem: (key) => SecureStore.deleteItemAsync(key),
};
