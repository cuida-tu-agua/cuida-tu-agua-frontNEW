import React from 'react';
import { act, create } from 'react-test-renderer';
import i18n, { changeLanguage } from '../index';
import { LanguageProvider, parseLanguagePreference, useLanguage } from '../LanguageProvider';

// The device storage is replaced by a plain in-memory one
const mockStore = new Map<string, string>();
let mockReadFails = false;
jest.mock('../../core/storage/secureStorage', () => ({
  secureStorage: {
    getItem: (key: string) => (mockReadFails ? Promise.reject(new Error('storage down')) : Promise.resolve(mockStore.get(key) ?? null)),
    setItem: (key: string, value: string) => {
      mockStore.set(key, value);
      return Promise.resolve();
    },
    removeItem: (key: string) => {
      mockStore.delete(key);
      return Promise.resolve();
    },
  },
}));

type Ctx = ReturnType<typeof useLanguage>;
// The probe hands what the provider gives to the test, after every render
const seen: { current: Ctx | null } = { current: null };
const latest = () => seen.current as Ctx;
const Probe: React.FC = () => {
  const value = useLanguage();
  React.useEffect(() => {
    seen.current = value;
  });
  return null;
};

const flush = () => act(async () => { await Promise.resolve(); await Promise.resolve(); });

const mount = async () => {
  let tree!: ReturnType<typeof create>;
  await act(async () => {
    tree = create(
      <LanguageProvider>
        <Probe />
      </LanguageProvider>,
    );
  });
  await flush();
  return tree;
};

beforeEach(async () => {
  mockStore.clear();
  mockReadFails = false;
  await changeLanguage('es');
});

describe('parseLanguagePreference', () => {
  it('accepts the supported languages', () => {
    expect(parseLanguagePreference('es')).toBe('es');
    expect(parseLanguagePreference('en')).toBe('en');
  });

  it('ignores anything else', () => {
    expect(parseLanguagePreference(null)).toBeNull();
    expect(parseLanguagePreference('')).toBeNull();
    expect(parseLanguagePreference('fr')).toBeNull();
    expect(parseLanguagePreference('{"language":"en"}')).toBeNull();
  });
});

describe('LanguageProvider', () => {
  it('is ready once the saved choice is read', async () => {
    await mount();
    expect(latest().ready).toBe(true);
  });

  it('without a saved choice it keeps the language of the device', async () => {
    await mount();
    expect(latest().language).toBe('es');
    expect(i18n.t('common.cancel')).toBe('Cancelar');
  });

  it('starts in the saved language', async () => {
    mockStore.set('language.preference', 'en');
    await mount();
    expect(latest().language).toBe('en');
    expect(i18n.t('common.cancel')).toBe('Cancel');
  });

  it('a damaged saved value is ignored', async () => {
    mockStore.set('language.preference', 'klingon');
    await mount();
    expect(latest().language).toBe('es');
  });

  it('if the storage cannot be read the app still starts', async () => {
    mockReadFails = true;
    await mount();
    expect(latest().ready).toBe(true);
    expect(latest().language).toBe('es');
  });

  it('changing the language applies at once and is saved', async () => {
    await mount();
    await act(async () => latest().setLanguage('en'));
    await flush();
    expect(latest().language).toBe('en');
    expect(i18n.t('common.cancel')).toBe('Cancel');
    expect(mockStore.get('language.preference')).toBe('en');
  });
});
