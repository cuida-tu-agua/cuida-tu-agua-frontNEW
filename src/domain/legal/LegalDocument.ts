/**
 * The legal texts of the app: terms, data policy, privacy notice, account deletion and the device warranty. Their words
 * live in i18n/locales/legal (one file per language); this is their shape and what does not depend on the language.
 */
export const LEGAL_DOCUMENT_IDS = ['terms', 'privacy', 'notice', 'deletion', 'device'] as const;

export type LegalDocumentId = (typeof LEGAL_DOCUMENT_IDS)[number];

/** Version and start date of the texts in force. A new version must be accepted again (when the backend keeps it). */
export const LEGAL_VERSION = '1.0';
export const LEGAL_EFFECTIVE_DATE = '2026-10-26T12:00:00';

/** The web address of each document: {app}/legal/{slug}. The stores ask for the privacy and deletion ones. */
export const LEGAL_SLUGS: Record<LegalDocumentId, string> = {
  terms: 'terminos',
  privacy: 'privacidad',
  notice: 'aviso',
  deletion: 'eliminar-cuenta',
  device: 'dispositivo',
};

export const legalDocumentFromSlug = (slug: string | undefined): LegalDocumentId | null =>
  LEGAL_DOCUMENT_IDS.find((id) => LEGAL_SLUGS[id] === slug?.trim().toLowerCase()) ?? null;

/** A paragraph, or a list. **Words between double asterisks** are drawn in bold. */
export type LegalBlock = string | { items: string[] };

export interface LegalSection {
  title: string;
  blocks: LegalBlock[];
}

export interface LegalDocument {
  id: LegalDocumentId;
  title: string;
  /** One line under the title and in the list of documents. */
  summary: string;
  sections: LegalSection[];
}

/** The texts of one language. The documents carry {{responsible}}, {{city}}, {{email}} and {{date}}. */
export interface LegalTexts {
  /** Joins the last two names: "A, B y C". */
  and: string;
  /** Where the responsible people live when no city is configured. */
  country: string;
  documents: Record<LegalDocumentId, Omit<LegalDocument, 'id'>>;
}

export interface LegalValues {
  responsible: string;
  city: string;
  email: string;
  date: string;
}

/** "A", "A y B", "A, B y C". */
export const joinNames = (names: readonly string[], and: string): string =>
  names.length <= 1 ? (names[0] ?? '') : `${names.slice(0, -1).join(', ')} ${and} ${names[names.length - 1]}`;

const fill = (text: string, values: LegalValues): string =>
  text.replace(/{{\s*(\w+)\s*}}/g, (token, name: string) => (name in values ? values[name as keyof LegalValues] : token));

/** The document with the contact data in place. */
export const fillLegalDocument = (id: LegalDocumentId, texts: LegalTexts, values: LegalValues): LegalDocument => {
  const source = texts.documents[id];
  return {
    id,
    title: fill(source.title, values),
    summary: fill(source.summary, values),
    sections: source.sections.map((section) => ({
      title: fill(section.title, values),
      blocks: section.blocks.map((block) =>
        typeof block === 'string' ? fill(block, values) : { ...block, items: block.items.map((item) => fill(item, values)) },
      ),
    })),
  };
};

/** Splits "a **b** c" into the plain and the bold pieces. */
export const boldPieces = (text: string): { text: string; bold: boolean }[] =>
  text
    .split(/(\*\*[^*]+\*\*)/g)
    .filter((piece) => piece !== '')
    .map((piece) => (piece.startsWith('**') && piece.endsWith('**') ? { text: piece.slice(2, -2), bold: true } : { text: piece, bold: false }));
