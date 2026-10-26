import { LEGAL_CONTACT } from '../config/legal';
import { LEGAL_EFFECTIVE_DATE, LegalDocument, LegalDocumentId, LegalTexts, fillLegalDocument, joinNames } from '../domain/legal/LegalDocument';
import { localeTagOf } from './format';
import { Language, resolveLanguage } from './languages';
import { legalEn } from './locales/legal/en';
import { legalEs } from './locales/legal/es';
import { legalFr } from './locales/legal/fr';
import { legalPt } from './locales/legal/pt';
import { LEGAL_RESPONSIBLES } from './locales/legal/responsibles';

/** The legal texts are long, so they live apart from the dictionaries of the screens (one file per language). */
export const LEGAL_TEXTS: Record<Language, LegalTexts> = { es: legalEs, en: legalEn, fr: legalFr, pt: legalPt };

/** "26 de octubre de 2026", "October 26, 2026"... */
export const legalEffectiveDate = (language: string): string =>
  new Date(LEGAL_EFFECTIVE_DATE).toLocaleDateString(localeTagOf(resolveLanguage(language)), { day: 'numeric', month: 'long', year: 'numeric' });

/** A legal document in the given language, with the names, the e-mail, the city and the date in place. */
export const legalDocument = (id: LegalDocumentId, language: string): LegalDocument => {
  const lang = resolveLanguage(language);
  const texts = LEGAL_TEXTS[lang];
  return fillLegalDocument(id, texts, {
    responsible: joinNames(LEGAL_RESPONSIBLES, texts.and),
    city: LEGAL_CONTACT.city ?? texts.country,
    email: LEGAL_CONTACT.email ?? texts.emailPending,
    date: legalEffectiveDate(lang),
  });
};
