import { LEGAL_DOCUMENT_IDS, LegalBlock } from '../../domain/legal/LegalDocument';
import { LEGAL_TEXTS, legalDocument } from '../legal';
import { LEGAL_RESPONSIBLES } from '../locales/legal/responsibles';

const placeholders = (text: string) => (text.match(/{{\s*\w+\s*}}/g) ?? []).sort().join();
const shape = (block: LegalBlock) => (typeof block === 'string' ? 'text' : `list:${block.items.length}`);
const textsOf = (block: LegalBlock) => (typeof block === 'string' ? [block] : block.items);

describe.each(['en', 'fr', 'pt'] as const)('legal texts: Spanish and %s say the same', (language) => {
  const spanish = LEGAL_TEXTS.es.documents;
  const other = LEGAL_TEXTS[language].documents;

  it.each(LEGAL_DOCUMENT_IDS)('%s has the same sections, paragraphs and lists', (id) => {
    expect(other[id].sections.map((s) => s.blocks.map(shape))).toEqual(spanish[id].sections.map((s) => s.blocks.map(shape)));
  });

  it.each(LEGAL_DOCUMENT_IDS)('%s keeps the same contact data in each paragraph', (id) => {
    const marks = (sections: typeof spanish.terms.sections) => sections.flatMap((s) => s.blocks.flatMap(textsOf)).map(placeholders);
    expect(marks(other[id].sections)).toEqual(marks(spanish[id].sections));
  });
});

describe('legal texts', () => {
  it.each(['es', 'en', 'fr', 'pt'] as const)('no text is empty in %s', (language) => {
    const { documents } = LEGAL_TEXTS[language];
    const all = LEGAL_DOCUMENT_IDS.flatMap((id) => [
      documents[id].title,
      documents[id].summary,
      ...documents[id].sections.flatMap((s) => [s.title, ...s.blocks.flatMap(textsOf)]),
    ]);
    expect(all.filter((text) => text.trim() === '')).toEqual([]);
  });

  it('fills in the people responsible, the date and the e-mail of the project', () => {
    const policy = legalDocument('privacy', 'es');
    const all = policy.sections.flatMap((s) => s.blocks.flatMap(textsOf)).join('\n');

    expect(all).not.toMatch(/{{/);
    expect(all).toContain(`${LEGAL_RESPONSIBLES[0]}, ${LEGAL_RESPONSIBLES[1]} y ${LEGAL_RESPONSIBLES[2]}`);
    expect(all).toContain('26 de octubre de 2026');
    expect(all).toContain('sywater2026@gmail.com');
  });

  it('draws a document in the language asked for, and in Spanish for an unknown one', () => {
    expect(legalDocument('terms', 'en').title).toBe('Terms and Conditions');
    expect(legalDocument('terms', 'pt').sections[0].blocks[0]).toContain(' e Juan Manuel');
    expect(legalDocument('terms', 'de').title).toBe('Términos y Condiciones');
  });
});
