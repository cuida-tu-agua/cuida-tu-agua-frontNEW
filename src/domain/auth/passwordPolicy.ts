import i18n from '../../i18n';

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

const text = (rule: PasswordRuleId, kind: 'label' | 'short') => i18n.t(`password.rules.${rule}.${kind}`);

export const passwordRules = (password: string): PasswordRule[] => [
  { id: 'MIN_LENGTH', label: text('MIN_LENGTH', 'label'), shortLabel: text('MIN_LENGTH', 'short'), met: password.length >= PASSWORD_MIN_LENGTH },
  { id: 'UPPERCASE', label: text('UPPERCASE', 'label'), shortLabel: text('UPPERCASE', 'short'), met: /[A-ZÀ-ÖØ-Þ]/.test(password) },
  { id: 'DIGIT', label: text('DIGIT', 'label'), shortLabel: text('DIGIT', 'short'), met: /[0-9]/.test(password) },
  { id: 'SPECIAL', label: text('SPECIAL', 'label'), shortLabel: text('SPECIAL', 'short'), met: new RegExp(`[^${LETTERS}0-9\\s]`).test(password) },
];

export const describeRules = (ids: string[]): string => {
  const labels = passwordRules('')
    .filter((rule) => ids.includes(rule.id))
    .map((rule) => rule.label);
  if (ids.includes('MAX_LENGTH')) labels.push(i18n.t('password.maxLength', { max: PASSWORD_MAX_LENGTH }));
  if (labels.length <= 1) return labels.join('');
  return `${labels.slice(0, -1).join(', ')} ${i18n.t('password.and')} ${labels[labels.length - 1]}`;
};
