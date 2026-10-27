/** The mailbox of the project for privacy requests, claims and the warranty. */
const PROJECT_EMAIL = 'sywater2026@gmail.com';

/**
 * Contact data of the legal texts. EXPO_PUBLIC_LEGAL_EMAIL and EXPO_PUBLIC_LEGAL_CITY can replace them in a build
 * without touching the texts; without a city the documents give only the country. The names of the people
 * responsible are in i18n/locales/legal/responsibles.ts.
 */
export const LEGAL_CONTACT = {
  email: process.env.EXPO_PUBLIC_LEGAL_EMAIL?.trim() || PROJECT_EMAIL,
  city: process.env.EXPO_PUBLIC_LEGAL_CITY?.trim() || null,
};
