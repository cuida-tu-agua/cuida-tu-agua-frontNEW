import { secureStorage } from '../secureStorage.web';

class FakeLocalStorage {
  private data = new Map<string, string>();
  getItem(key: string) { return this.data.has(key) ? this.data.get(key)! : null; }
  setItem(key: string, value: string) { this.data.set(key, value); }
  removeItem(key: string) { this.data.delete(key); }
}

const g = globalThis as unknown as { localStorage?: unknown };

describe('secureStorage.web: the session survives a reload in the browser', () => {
  const original = g.localStorage;
  afterEach(() => {
    if (original === undefined) delete g.localStorage;
    else g.localStorage = original;
  });

  it('keeps, reads and removes values in localStorage', async () => {
    const fake = new FakeLocalStorage();
    g.localStorage = fake;

    await secureStorage.setItem('access_token', 'abc');
    expect(fake.getItem('access_token')).toBe('abc');               // really written to the browser storage
    expect(await secureStorage.getItem('access_token')).toBe('abc');

    await secureStorage.removeItem('access_token');
    expect(await secureStorage.getItem('access_token')).toBeNull();
  });

  it('an unknown key is null, not an error', async () => {
    g.localStorage = new FakeLocalStorage();
    expect(await secureStorage.getItem('nope')).toBeNull();
  });

  it('without localStorage (blocked browser) it keeps the session in memory instead of failing', async () => {
    delete g.localStorage;

    await secureStorage.setItem('refresh_token', 'r1');
    expect(await secureStorage.getItem('refresh_token')).toBe('r1');
    await secureStorage.removeItem('refresh_token');
    expect(await secureStorage.getItem('refresh_token')).toBeNull();
  });

  it('a localStorage that throws (storage disabled) also falls back to memory', async () => {
    g.localStorage = {
      getItem() { throw new Error('SecurityError'); },
      setItem() { throw new Error('SecurityError'); },
      removeItem() { throw new Error('SecurityError'); },
    };

    await secureStorage.setItem('user', 'u');
    expect(await secureStorage.getItem('user')).toBe('u');
    await expect(secureStorage.removeItem('user')).resolves.toBeUndefined();
  });
});
