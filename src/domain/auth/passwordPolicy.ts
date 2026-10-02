export const LETTERS = 'A-Za-zÀ-ÖØ-öø-ÿ';

export const PASSWORD_MIN_LENGTH = 8;
export const PASSWORD_MAX_LENGTH = 128;

export type PasswordRuleId = 'MIN_LENGTH' | 'UPPERCASE' | 'DIGIT' | 'SPECIAL';

export interface PasswordRule {
  id: PasswordRuleId;
  label: string; // long text, for messages
  shortLabel: string; // chip under the password field
  met: boolean;
}

export const passwordRules = (password: string): PasswordRule[] => [
  { id: 'MIN_LENGTH', label: 'al menos 8 caracteres', shortLabel: '8+ carac.', met: password.length >= PASSWORD_MIN_LENGTH },
  { id: 'UPPERCASE', label: 'una mayúscula', shortLabel: 'Mayúscula', met: /[A-ZÀ-ÖØ-Þ]/.test(password) },
  { id: 'DIGIT', label: 'un número', shortLabel: 'Número', met: /[0-9]/.test(password) },
  { id: 'SPECIAL', label: 'un símbolo (!@#$...)', shortLabel: 'Símbolo', met: new RegExp(`[^${LETTERS}0-9\\s]`).test(password) },
];

export const describeRules = (ids: string[]): string => {
  const labels = passwordRules('')
    .filter((rule) => ids.includes(rule.id))
    .map((rule) => rule.label);
  if (ids.includes('MAX_LENGTH')) labels.push(`máximo ${PASSWORD_MAX_LENGTH} caracteres`);
  if (labels.length <= 1) return labels.join('');
  return `${labels.slice(0, -1).join(', ')} y ${labels[labels.length - 1]}`;
};
