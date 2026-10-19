import { en } from '../locales/en';
import { es } from '../locales/es';
import { fr } from '../locales/fr';

/** Every text of a dictionary as "group.key": "value" (nested groups become dotted keys). */
const flatten = (node: Record<string, unknown>, prefix = ''): Record<string, string> =>
  Object.entries(node).reduce<Record<string, string>>((all, [key, value]) => {
    const path = prefix ? `${prefix}.${key}` : key;
    return typeof value === 'string' ? { ...all, [path]: value } : { ...all, ...flatten(value as Record<string, unknown>, path) };
  }, {});

const spanish = flatten(es);
const placeholders = (text: string) => (text.match(/{{\s*\w+\s*}}/g) ?? []).map((p) => p.replace(/\s/g, '')).sort();

/** Spanish is the reference: every other language must have exactly its keys and its placeholders. */
const OTHERS: [string, Record<string, unknown>][] = [
  ['English', en],
  ['French', fr],
];

describe.each(OTHERS)('dictionaries: Spanish and %s have the same texts', (_name, dictionary) => {
  const other = flatten(dictionary);

  it('no key is missing', () => {
    expect(Object.keys(spanish).filter((key) => !(key in other))).toEqual([]);
  });

  it('no key exists only in this language', () => {
    expect(Object.keys(other).filter((key) => !(key in spanish))).toEqual([]);
  });

  it('no text is empty', () => {
    const empty = Object.entries(other).filter(([, text]) => text.trim() === '').map(([key]) => key);
    expect(empty).toEqual([]);
  });

  it('a text with {{placeholders}} uses the same ones as in Spanish', () => {
    const different = Object.keys(spanish).filter((key) => key in other && placeholders(spanish[key]).join() !== placeholders(other[key]).join());
    expect(different).toEqual([]);
  });
});

it('no Spanish text is empty', () => {
  expect(Object.entries(spanish).filter(([, text]) => text.trim() === '')).toEqual([]);
});
