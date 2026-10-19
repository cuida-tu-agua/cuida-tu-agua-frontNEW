import i18n from 'i18next';

/** BCP 47 tag for Intl and toLocale*String. HU-077 grows this file into the shared number/date/currency formatters. */
export const localeTag = (): string => (i18n.language === 'en' ? 'en-US' : 'es-CO');
