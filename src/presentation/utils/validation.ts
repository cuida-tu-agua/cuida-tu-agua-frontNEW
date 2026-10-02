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
  if (!email) return 'Escribe tu correo.';
  if (email.length > EMAIL_MAX_LENGTH || !EMAIL_REGEX.test(email)) return 'Escribe un correo válido, por ejemplo nombre@correo.com.';
  return undefined;
};

export const validateName = (value: string, field: 'nombre' | 'apellido'): string | undefined => {
  const name = value.trim();
  if (!name) return `Escribe tu ${field}.`;
  if (name.length < 2) return `El ${field} debe tener al menos 2 letras.`;
  if (name.length > NAME_MAX_LENGTH) return `El ${field} puede tener máximo ${NAME_MAX_LENGTH} caracteres.`;
  if (!NAME_REGEX.test(name)) return `El ${field} solo puede tener letras, espacios, puntos, guiones o apóstrofes.`;
  return undefined;
};

export const validatePhone = (value: string): string | undefined => {
  const phone = normalizePhone(value);
  if (!phone) return undefined;
  if (!PHONE_REGEX.test(phone)) return 'Escribe un teléfono de 7 a 15 dígitos (puede empezar con +).';
  return undefined;
};

export const validatePassword = (value: string): string | undefined => {
  if (!value) return 'Escribe una contraseña.';
  if (value.length > PASSWORD_MAX_LENGTH) return `La contraseña puede tener máximo ${PASSWORD_MAX_LENGTH} caracteres.`;
  const unmet = passwordRules(value).filter((rule) => !rule.met).map((rule) => rule.id);
  if (unmet.length > 0) return `A tu contraseña le falta ${describeRules(unmet)}.`;
  return undefined;
};

export const validatePasswordConfirmation = (password: string, confirmation: string): string | undefined => {
  if (!confirmation) return 'Repite la contraseña.';
  if (password !== confirmation) return 'Las contraseñas no coinciden.';
  return undefined;
};

export const validateRequired = (value: string, message: string): string | undefined =>
  value.trim() ? undefined : message;

export const validateCode = (value: string): string | undefined => {
  if (!value) return 'Escribe el código de 6 dígitos.';
  if (!CODE_REGEX.test(value)) return 'El código tiene 6 dígitos.';
  return undefined;
};

export const validateIdentifier = (value: string): string | undefined => {
  const trimmed = value.trim();
  if (!trimmed) return 'Escribe tu correo o tu teléfono.';
  if (trimmed.includes('@')) return validateEmail(trimmed);
  return PHONE_REGEX.test(normalizePhone(trimmed)) ? undefined : 'Escribe un correo o un teléfono válido.';
};

export const normalizeIdentifier = (value: string): string =>
  value.includes('@') ? normalizeEmail(value) : normalizePhone(value);

export const hasNoErrors = (errors: Record<string, string | undefined>): boolean =>
  Object.values(errors).every((message) => !message);
