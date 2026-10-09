import { PushRegistration, PushRepository } from '../../../domain/push/Push';
import { KeyValueStorage } from '../../storage/secureStorage';
import { PushDevice } from '../PushDeviceTypes';
import { PUSH_TOKEN_KEY, PushService } from '../PushService';

const registration: PushRegistration = { token: 'ExponentPushToken[phone]', platform: 'android' };

const memoryStorage = (): KeyValueStorage & { data: Map<string, string> } => {
  const data = new Map<string, string>();
  return {
    data,
    getItem: async (key) => data.get(key) ?? null,
    setItem: async (key, value) => void data.set(key, value),
    removeItem: async (key) => void data.delete(key),
  };
};

const deviceReturning = (value: PushRegistration | null | Error): PushDevice => ({
  getRegistration: async () => {
    if (value instanceof Error) throw value;
    return value;
  },
  onTap: () => () => undefined,
  initialTap: () => null,
  onReceived: () => () => undefined,
});

const repository = (): jest.Mocked<PushRepository> => ({ register: jest.fn().mockResolvedValue(undefined), unregister: jest.fn().mockResolvedValue(undefined) });

describe('PushService', () => {
  it('registers the token of the phone and remembers it for the logout', async () => {
    const repo = repository();
    const storage = memoryStorage();

    expect(await new PushService(deviceReturning(registration), repo, storage).enable()).toBe(true);

    expect(repo.register).toHaveBeenCalledWith(registration);
    expect(storage.data.get(PUSH_TOKEN_KEY)).toBe(registration.token);
  });

  it('does nothing where push is not possible (web, simulator, permission denied)', async () => {
    const repo = repository();
    const storage = memoryStorage();

    expect(await new PushService(deviceReturning(null), repo, storage).enable()).toBe(false);

    expect(repo.register).not.toHaveBeenCalled();
    expect(storage.data.size).toBe(0);
  });

  it('never throws: a failing server or device just means no push', async () => {
    const repo = repository();
    repo.register.mockRejectedValue(new Error('offline'));
    const storage = memoryStorage();

    expect(await new PushService(deviceReturning(registration), repo, storage).enable()).toBe(false);
    expect(await new PushService(deviceReturning(new Error('boom')), repository(), storage).enable()).toBe(false);
    expect(storage.data.size).toBe(0);   // nothing is remembered if the server did not accept it
  });

  it('logout removes the remembered token from the server and from the phone', async () => {
    const repo = repository();
    const storage = memoryStorage();
    storage.data.set(PUSH_TOKEN_KEY, registration.token);

    await new PushService(deviceReturning(registration), repo, storage).disable();

    expect(repo.unregister).toHaveBeenCalledWith(registration.token);
    expect(storage.data.size).toBe(0);
  });

  it('logout without a remembered token does not call the server', async () => {
    const repo = repository();

    await new PushService(deviceReturning(registration), repo, memoryStorage()).disable();

    expect(repo.unregister).not.toHaveBeenCalled();
  });

  it('logout survives an unreachable server and keeps the token to take over later', async () => {
    const repo = repository();
    repo.unregister.mockRejectedValue(new Error('offline'));
    const storage = memoryStorage();
    storage.data.set(PUSH_TOKEN_KEY, registration.token);

    await expect(new PushService(deviceReturning(registration), repo, storage).disable()).resolves.toBeUndefined();
    expect(storage.data.get(PUSH_TOKEN_KEY)).toBe(registration.token);
  });
});
