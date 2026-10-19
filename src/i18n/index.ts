import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { getLocales } from 'expo-localization';
import { DEFAULT_LANGUAGE, Language, SUPPORTED_LANGUAGES, resolveLanguage } from './languages';
import { en } from './locales/en';
import { es } from './locales/es';

/** Language code of the phone or the browser ("es", "en", ...). Empty when it cannot be read. */
const deviceLanguageCode = (): string | null => {
  try {
    return getLocales()[0]?.languageCode ?? null;
  } catch {
    return null;
  }
};

export const initialLanguage = (): Language => resolveLanguage(deviceLanguageCode());

if (!i18n.isInitialized) {
  i18n.use(initReactI18next).init({
    resources: {
      es: { translation: es },
      en: { translation: en },
    },
    lng: initialLanguage(),
    // A text that is missing in the chosen language is shown in Spanish, never as a raw key
    fallbackLng: DEFAULT_LANGUAGE,
    supportedLngs: [...SUPPORTED_LANGUAGES],
    interpolation: { escapeValue: false }, // React already escapes what it draws
    returnNull: false,
    initAsync: false, // the dictionaries are bundled, so everything is ready before the first screen
  });
}

export const changeLanguage = (language: Language) => i18n.changeLanguage(language);

export { SUPPORTED_LANGUAGES, DEFAULT_LANGUAGE, resolveLanguage };
export type { Language };
export default i18n;
