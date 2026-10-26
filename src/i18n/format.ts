import i18n from 'i18next';

/** BCP 47 tag of each language for Intl and toLocale*String. Spanish is the Colombian one; Portuguese is the Brazilian one. */
const LOCALE_TAGS: Record<string, string> = { es: 'es-CO', en: 'en-US', fr: 'fr-FR', pt: 'pt-BR' };

/** The tag of a given language (the legal texts are drawn in a language that is not always the current one). */
export const localeTagOf = (language: string): string => LOCALE_TAGS[language] ?? LOCALE_TAGS.es;

export const localeTag = (): string => localeTagOf(i18n.language);

/** The marks that separate thousands and decimals: "1.234,5" (es, pt), "1,234.5" (en), "1 234,5" (fr, with a no-break space). */
export const numberMarks = (): { group: string; decimal: string } => {
  switch (i18n.language) {
    case 'en':
      return { group: ',', decimal: '.' };
    case 'fr':
      return { group: '\u00a0', decimal: ',' };
    default:
      return { group: '.', decimal: ',' };
  }
};

type DateInput = string | number | Date;

const toDate = (value: DateInput): Date => (value instanceof Date ? value : new Date(value));

/** "19 oct 2026, 11:44 a. m." in Spanish, "Oct 19, 2026, 11:44 AM" in English. */
export const formatDateTime = (value: DateInput): string =>
  toDate(value).toLocaleString(localeTag(), { dateStyle: 'medium', timeStyle: 'short' });

/** "19 oct 2026" in Spanish, "Oct 19, 2026" in English. */
export const formatDate = (value: DateInput): string =>
  toDate(value).toLocaleDateString(localeTag(), { day: 'numeric', month: 'short', year: 'numeric' });

/** Hours and minutes only, in the format of the current language. */
export const formatTime = (value: DateInput): string =>
  toDate(value).toLocaleTimeString(localeTag(), { hour: '2-digit', minute: '2-digit' });

/** A number with the grouping and decimal marks of the current language. */
export const formatNumber = (value: number, maximumFractionDigits = 2): string =>
  value.toLocaleString(localeTag(), { maximumFractionDigits });
