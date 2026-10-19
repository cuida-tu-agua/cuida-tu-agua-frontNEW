import React from 'react';
import { act, create } from 'react-test-renderer';
import { changeLanguage } from '../../../../i18n';
import { PasswordStrengthMeter } from '../PasswordStrengthMeter';

/** Every accessibility label and text drawn by the meter, in order. */
const textsOf = (password: string): string[] => {
  let tree!: ReturnType<typeof create>;
  act(() => {
    tree = create(<PasswordStrengthMeter password={password} />);
  });
  const found: string[] = [];
  const visit = (node: { props?: Record<string, unknown>; children?: unknown[] } | string) => {
    if (typeof node === 'string') {
      found.push(node);
      return;
    }
    const label = node.props?.accessibilityLabel;
    if (typeof label === 'string') found.push(label);
    (node.children ?? []).forEach((child) => visit(child as never));
  };
  visit(tree.toJSON() as never);
  return found;
};

describe('PasswordStrengthMeter language (HU-072)', () => {
  it('shows the level and the rules in Spanish', async () => {
    await changeLanguage('es');
    const texts = textsOf('Agua2026!');
    expect(texts).toContain('Muy fuerte');
    expect(texts).toContain('Mayúscula');
    expect(texts.some((t) => t.startsWith('Seguridad de la contraseña'))).toBe(true);
  });

  it('shows the level and the rules in English', async () => {
    await changeLanguage('en');
    const texts = textsOf('Agua2026!');
    expect(texts).toContain('Very strong');
    expect(texts).toContain('Uppercase');
    expect(texts).toContain('Password strength: Very strong');
    expect(texts).toContain('a number: met');
  });

  it('says "not evaluated" when the password is empty', async () => {
    await changeLanguage('en');
    expect(textsOf('')).toContain('Password strength: not evaluated');
  });
});
