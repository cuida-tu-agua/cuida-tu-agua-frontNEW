/** Languages the app is translated into. Spanish is the original one and the fallback of everything. */
export const SUPPORTED_LANGUAGES = ['es', 'en', 'fr', 'pt'] as const;

export type Language = (typeof SUPPORTED_LANGUAGES)[number];

export const DEFAULT_LANGUAGE: Language = 'es';

export const isLanguage = (value: unknown): value is Language =>
  typeof value === 'string' && (SUPPORTED_LANGUAGES as readonly string[]).includes(value);

/**
 * The language to use for a device language code such as "en", "en-US" or "es-CO".
 * Anything that is not supported (or unknown) gets the default language.
 */
export const resolveLanguage = (code: string | null | undefined): Language => {
  if (!code) return DEFAULT_LANGUAGE;
  const base = code.toLowerCase().split(/[-_]/)[0];
  return isLanguage(base) ? base : DEFAULT_LANGUAGE;
};
