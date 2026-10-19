import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { secureStorage } from '../core/storage/secureStorage';
import i18n, { changeLanguage } from './index';
import { DEFAULT_LANGUAGE, Language, isLanguage } from './languages';

const STORAGE_KEY = 'language.preference';

/** What was saved on the device. A value that is not a supported language (old version, damaged entry) is ignored. */
export const parseLanguagePreference = (raw: string | null): Language | null => (isLanguage(raw) ? raw : null);

interface LanguageContextValue {
  /** The language in use. */
  language: Language;
  /** false until the saved choice is read: the app shows its splash screen meanwhile (no flash of the wrong language). */
  ready: boolean;
  setLanguage: (language: Language) => void;
}

const LanguageContext = createContext<LanguageContextValue | undefined>(undefined);

const currentLanguage = (): Language => (isLanguage(i18n.language) ? i18n.language : DEFAULT_LANGUAGE);

/**
 * The language the user chose, saved on the device. Without a saved choice the language of the device is used
 * (decided in ./index). The change is immediate: every text drawn with useTranslation updates by itself.
 */
export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(currentLanguage());
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let active = true;
    secureStorage
      .getItem(STORAGE_KEY)
      .catch(() => null)
      .then(async (raw) => {
        const saved = parseLanguagePreference(raw);
        if (saved && saved !== i18n.language) await changeLanguage(saved);
        if (!active) return;
        setLanguageState(currentLanguage());
        setReady(true);
      });
    return () => {
      active = false;
    };
  }, []);

  const setLanguage = useCallback((next: Language) => {
    setLanguageState(next);
    changeLanguage(next);
    // Saved once it is applied; a storage failure never blocks the change
    secureStorage.setItem(STORAGE_KEY, next).catch(() => undefined);
  }, []);

  const value = useMemo(() => ({ language, ready, setLanguage }), [language, ready, setLanguage]);
  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
};

export const useLanguage = (): LanguageContextValue => {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useLanguage must be used inside a LanguageProvider');
  return context;
};
