/**
 * Contact data of the legal texts. The e-mail and the city come from EXPO_PUBLIC_LEGAL_EMAIL and EXPO_PUBLIC_LEGAL_CITY
 * so production can publish them without a new build of the texts; while they are empty the documents say the e-mail
 * is pending and give only the country. The names of the people responsible are in i18n/locales/legal/responsibles.ts.
 */
export const LEGAL_CONTACT = {
  email: process.env.EXPO_PUBLIC_LEGAL_EMAIL?.trim() || null,
  city: process.env.EXPO_PUBLIC_LEGAL_CITY?.trim() || null,
};
