import i18n from 'i18next';

/** BCP 47 tag for Intl and toLocale*String: English uses en-US, anything else Colombian Spanish. */
export const localeTag = (): string => (i18n.language === 'en' ? 'en-US' : 'es-CO');

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
