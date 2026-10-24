import fs from 'fs';
import path from 'path';
import { PERMISSIONS } from '../../domain/sharing/Sharing';
import { es } from '../locales/es';

const flat = (node: Record<string, unknown>, prefix = ''): Record<string, string> =>
  Object.entries(node).reduce<Record<string, string>>((all, [key, value]) => {
    const path = prefix ? `${prefix}.${key}` : key;
    return typeof value === 'string' ? { ...all, [path]: value } : { ...all, ...flat(value as Record<string, unknown>, path) };
  }, {});

const texts = flat(es);
const SRC = path.resolve(__dirname, '..', '..');

const sourceFiles = (dir: string): string[] =>
  fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) return entry.name === 'tests' || entry.name === 'locales' ? [] : sourceFiles(full);
    return /\.(ts|tsx)$/.test(entry.name) ? [full] : [];
  });

/** Sharing and guest screens (HU-039..HU-046): every text key they ask for must exist, so no screen shows a raw key. */
describe('sharing and guest texts', () => {
  it('every t("sharing.*") and t("guest.*") used in the source exists in the dictionary', () => {
    const missing: string[] = [];
    for (const file of sourceFiles(SRC)) {
      const source = fs.readFileSync(file, 'utf8');
      for (const match of source.matchAll(/\bt\(\s*'((?:sharing|guest)\.[A-Za-z.]+)'/g)) {
        const key = match[1];
        const exists = key in texts || `${key}_other` in texts || `${key}_one` in texts;
        if (!exists) missing.push(`${path.relative(SRC, file)}: ${key}`);
      }
    }
    expect(missing).toEqual([]);
  });

  it('every permission has a label and a hint', () => {
    PERMISSIONS.forEach((permission) => {
      expect(texts[`sharing.permissions.${permission}.label`]).toBeTruthy();
      expect(texts[`sharing.permissions.${permission}.hint`]).toBeTruthy();
    });
  });

  it('every error code of the sharing rules has a message', () => {
    [
      'permission_invalid',
      'permission_denied',
      'invitation_invalid',
      'invitation_not_found',
      'invitation_already_pending',
      'invitation_already_member',
      'invitation_expired',
      'invitation_not_pending',
      'member_not_found',
      'guest_link_not_found',
    ].forEach((code) => expect(texts[`errors.code.${code}`]).toBeTruthy());
  });
});
