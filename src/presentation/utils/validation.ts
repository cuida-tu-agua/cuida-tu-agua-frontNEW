import i18n from '../../i18n';
import {
  LETTERS,
  PASSWORD_MAX_LENGTH,
  describeRules,
  passwordRules,
} from '../../domain/auth/passwordPolicy';

export { PASSWORD_MAX_LENGTH, PASSWORD_MIN_LENGTH, describeRules, passwordRules } from '../../domain/auth/passwordPolicy';
export type { PasswordRule, PasswordRuleId } from '../../domain/auth/passwordPolicy';


const NAME_REGEX = new RegExp(`^[${LETTERS}][${LETTERS} '.-]*$`);
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE_REGEX = /^\+?[0-9]{7,15}$/;
const CODE_REGEX = /^[0-9]{6}$/;

export const NAME_MAX_LENGTH = 100;
export const EMAIL_MAX_LENGTH = 320;
export const CODE_LENGTH = 6;

export const normalizeEmail = (value: string): string => value.trim().toLowerCase();

export const normalizePhone = (value: string): string => value.replace(/[\s\-.()]/g, '');

export const validateEmail = (value: string): string | undefined => {
  const email = normalizeEmail(value);
  if (!email) return i18n.t('validation.emailRequired');
  if (email.length > EMAIL_MAX_LENGTH || !EMAIL_REGEX.test(email)) return i18n.t('validation.emailInvalid');
  return undefined;
};

export const validateName = (value: string, field: 'firstName' | 'lastName'): string | undefined => {
  const name = value.trim();
  if (!name) return i18n.t(`validation.${field}Required`);
  if (name.length < 2) return i18n.t(`validation.${field}TooShort`);
  if (name.length > NAME_MAX_LENGTH) return i18n.t(`validation.${field}TooLong`, { max: NAME_MAX_LENGTH });
  if (!NAME_REGEX.test(name)) return i18n.t(`validation.${field}Invalid`);
  return undefined;
};

export const validatePhone = (value: string): string | undefined => {
  const phone = normalizePhone(value);
  if (!phone) return undefined;
  if (!PHONE_REGEX.test(phone)) return i18n.t('validation.phoneInvalid');
  return undefined;
};

export const validatePassword = (value: string): string | undefined => {
  if (!value) return i18n.t('validation.passwordRequired');
  if (value.length > PASSWORD_MAX_LENGTH) return i18n.t('validation.passwordTooLong', { max: PASSWORD_MAX_LENGTH });
  const unmet = passwordRules(value).filter((rule) => !rule.met).map((rule) => rule.id);
  if (unmet.length > 0) return i18n.t('validation.passwordMissing', { rules: describeRules(unmet) });
  return undefined;
};

export const validatePasswordConfirmation = (password: string, confirmation: string): string | undefined => {
  if (!confirmation) return i18n.t('validation.confirmationRequired');
  if (password !== confirmation) return i18n.t('validation.confirmationMismatch');
  return undefined;
};

export const validateRequired = (value: string, message: string): string | undefined =>
  value.trim() ? undefined : message;

export const validateCode = (value: string): string | undefined => {
  if (!value) return i18n.t('validation.codeRequired');
  if (!CODE_REGEX.test(value)) return i18n.t('validation.codeInvalid');
  return undefined;
};

export const validateIdentifier = (value: string): string | undefined => {
  const trimmed = value.trim();
  if (!trimmed) return i18n.t('validation.identifierRequired');
  if (trimmed.includes('@')) return validateEmail(trimmed);
  return PHONE_REGEX.test(normalizePhone(trimmed)) ? undefined : i18n.t('validation.identifierInvalid');
};

export const normalizeIdentifier = (value: string): string =>
  value.includes('@') ? normalizeEmail(value) : normalizePhone(value);

export const hasNoErrors = (errors: Record<string, string | undefined>): boolean =>
  Object.values(errors).every((message) => !message);
