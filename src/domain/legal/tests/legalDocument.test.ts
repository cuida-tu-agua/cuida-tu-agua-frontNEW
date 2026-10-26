import { LegalTexts, boldPieces, fillLegalDocument, joinNames, legalDocumentFromSlug } from '../LegalDocument';

describe('legal documents', () => {
  it('finds a document by its web address and ignores unknown ones', () => {
    expect(legalDocumentFromSlug('privacidad')).toBe('privacy');
    expect(legalDocumentFromSlug(' Terminos ')).toBe('terms');
    expect(legalDocumentFromSlug('eliminar-cuenta')).toBe('deletion');
    expect(legalDocumentFromSlug('cookies')).toBeNull();
    expect(legalDocumentFromSlug(undefined)).toBeNull();
  });

  it('joins the names of the people responsible with the word of the language', () => {
    expect(joinNames(['Ana'], 'y')).toBe('Ana');
    expect(joinNames(['Ana', 'Luis'], 'and')).toBe('Ana and Luis');
    expect(joinNames(['Ana', 'Luis', 'Eva'], 'y')).toBe('Ana, Luis y Eva');
  });

  it('puts the contact data in the titles, the paragraphs and the lists', () => {
    const texts = {
      and: 'y',
      emailPending: '-',
      country: 'Colombia',
      documents: {
        terms: {
          title: 'Términos de {{responsible}}',
          summary: 'Desde el {{date}}',
          sections: [{ title: 'Contacto', blocks: ['Escribe a {{email}}', { items: ['En {{city}}', '{{unknown}} queda igual'] }] }],
        },
      },
    } as unknown as LegalTexts;

    const document = fillLegalDocument('terms', texts, { responsible: 'Ana', city: 'Pasto', email: 'a@b.co', date: '1 de enero' });

    expect(document.title).toBe('Términos de Ana');
    expect(document.summary).toBe('Desde el 1 de enero');
    expect(document.sections[0].blocks).toEqual(['Escribe a a@b.co', { items: ['En Pasto', '{{unknown}} queda igual'] }]);
  });

  it('splits the bold words of a text', () => {
    expect(boldPieces('No es **un medidor oficial**: es referencial.')).toEqual([
      { text: 'No es ', bold: false },
      { text: 'un medidor oficial', bold: true },
      { text: ': es referencial.', bold: false },
    ]);
    expect(boldPieces('Sin negrilla')).toEqual([{ text: 'Sin negrilla', bold: false }]);
  });
});
