import { en } from '../locales/en';
import { es } from '../locales/es';

/** Every text of a dictionary as "group.key": "value" (nested groups become dotted keys). */
const flatten = (node: Record<string, unknown>, prefix = ''): Record<string, string> =>
  Object.entries(node).reduce<Record<string, string>>((all, [key, value]) => {
    const path = prefix ? `${prefix}.${key}` : key;
    return typeof value === 'string' ? { ...all, [path]: value } : { ...all, ...flatten(value as Record<string, unknown>, path) };
  }, {});

const spanish = flatten(es);
const english = flatten(en);

describe('dictionaries: Spanish and English have the same texts', () => {
  it('no key is missing in English', () => {
    const missing = Object.keys(spanish).filter((key) => !(key in english));
    expect(missing).toEqual([]);
  });

  it('no key exists only in English', () => {
    const extra = Object.keys(english).filter((key) => !(key in spanish));
    expect(extra).toEqual([]);
  });

  it('no text is empty', () => {
    const empty = [...Object.entries(spanish), ...Object.entries(english)].filter(([, text]) => text.trim() === '').map(([key]) => key);
    expect(empty).toEqual([]);
  });

  it('a text with {{placeholders}} uses the same ones in both languages', () => {
    const placeholders = (text: string) => (text.match(/{{\s*\w+\s*}}/g) ?? []).map((p) => p.replace(/\s/g, '')).sort();
    const different = Object.keys(spanish).filter((key) => key in english && placeholders(spanish[key]).join() !== placeholders(english[key]).join());
    expect(different).toEqual([]);
  });
});
