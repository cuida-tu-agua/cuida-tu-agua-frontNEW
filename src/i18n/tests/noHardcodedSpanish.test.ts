import fs from 'fs';
import path from 'path';

/**
 * HU-079: Spanish words must live in the dictionary, not in the screens. This scans the source for accented letters or
 * Spanish punctuation (á é í ó ú ñ ¿ ¡) outside comments and fails with the file and line, so a new hard-coded text is
 * caught before merging. The few legitimate cases are listed below.
 */
const SRC = path.resolve(__dirname, '..', '..');
const SKIP_DIRS = new Set(['tests', 'locales', 'node_modules']);
const ALLOWED = [
  /A-Za-zÀ-ÖØ-öø-ÿ/, // the letters of the password policy (a character class, not text)
  /A-ZÀ-ÖØ-Þ/,
  /label: 'Español'/, // a language is always named in its own language
  /CUBIC_METERS: 'm³'/,
];

const files = (dir: string): string[] =>
  fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) return SKIP_DIRS.has(entry.name) ? [] : files(full);
    return /\.(ts|tsx)$/.test(entry.name) ? [full] : [];
  });

const withoutComments = (source: string): string =>
  source.replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, ' ')).replace(/(^|[^:'"`])\/\/.*$/gm, '$1');

describe('no hard-coded Spanish in the source (HU-079)', () => {
  it('every text with Spanish letters is in the dictionary', () => {
    const found: string[] = [];
    for (const file of files(SRC)) {
      withoutComments(fs.readFileSync(file, 'utf8'))
        .split('\n')
        .forEach((line, index) => {
          if (/[áéíóúñÁÉÍÓÚÑ¿¡]/.test(line) && !ALLOWED.some((rule) => rule.test(line)) && !/^\s*[^\w'"`{<]*·/.test(line)) {
            found.push(`${path.relative(SRC, file)}:${index + 1}: ${line.trim().slice(0, 90)}`);
          }
        });
    }
    expect(found).toEqual([]);
  });
});
