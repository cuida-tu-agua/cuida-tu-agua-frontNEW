import { BODY_MAX, TITLE_MAX, Tip, validateTip, withFavorite } from '../Tip';

describe('validateTip (HU-063: title, body and category)', () => {
  it('all three are required', () => {
    const { errors, value } = validateTip({ title: ' ', body: '', category: null });
    expect(errors.title).toMatch(/título/);
    expect(errors.body).toMatch(/consejo/);
    expect(errors.category).toMatch(/tipo de lugar/);
    expect(value).toBeNull();
  });

  it('a valid form is trimmed and sent', () => {
    expect(validateTip({ title: '  Cierra la llave ', body: ' Ahorra agua. ', category: 'COMMERCIAL' }).value).toEqual({
      title: 'Cierra la llave',
      body: 'Ahorra agua.',
      category: 'COMMERCIAL',
    });
  });

  it('respects the limits of the server', () => {
    expect(validateTip({ title: 'a'.repeat(TITLE_MAX + 1), body: 'x', category: 'RESIDENTIAL' }).errors.title).toMatch(/máximo/);
    expect(validateTip({ title: 'a', body: 'x'.repeat(BODY_MAX + 1), category: 'RESIDENTIAL' }).errors.body).toMatch(/máximo/);
    expect(validateTip({ title: 'a'.repeat(TITLE_MAX), body: 'x'.repeat(BODY_MAX), category: 'RESIDENTIAL' }).value).not.toBeNull();
  });
});

describe('withFavorite', () => {
  const tip = (id: string, isFavorite = false): Tip => ({ id, title: id, body: '', category: 'RESIDENTIAL', isFavorite });

  it('changes only the tip asked for and does not touch the original list', () => {
    const list = [tip('a'), tip('b')];

    const next = withFavorite(list, 'b', true);

    expect(next.map((t) => t.isFavorite)).toEqual([false, true]);
    expect(list[1].isFavorite).toBe(false);
  });
});
