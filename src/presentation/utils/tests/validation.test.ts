import i18n from '../../../i18n';
import {
  describeRules,
  normalizeIdentifier,
  passwordRules,
  validateCode,
  validateEmail,
  validateIdentifier,
  validateName,
  validatePassword,
  validatePasswordConfirmation,
  validatePhone,
} from '../validation';

describe('password rules (HU-001)', () => {
  it('accepts a password with 8+ characters, uppercase, number and symbol', () => {
    expect(validatePassword('Agua2026!')).toBeUndefined();
  });

  it.each([
    ['Ag1!', 'al menos 8 caracteres'],
    ['agua2026!', 'una mayúscula'],
    ['AguaAgua!', 'un número'],
    ['Agua2026', 'un símbolo'],
  ])('"%s" is missing %s', (password, missing) => {
    expect(validatePassword(password)).toContain(missing);
  });

  it('accented capitals count as uppercase and spaces are not symbols', () => {
    expect(passwordRules('Ñandú 2026').find((r) => r.id === 'UPPERCASE')?.met).toBe(true);
    expect(passwordRules('Agua 2026').find((r) => r.id === 'SPECIAL')?.met).toBe(false);
  });

  it('lists several missing rules in natural Spanish', () => {
    expect(describeRules(['UPPERCASE', 'DIGIT', 'SPECIAL'])).toBe('una mayúscula, un número y un símbolo (!@#$...)');
  });

  it('confirmation must match', () => {
    expect(validatePasswordConfirmation('Agua2026!', 'Agua2026?')).toBe('Las contraseñas no coinciden.');
    expect(validatePasswordConfirmation('Agua2026!', 'Agua2026!')).toBeUndefined();
  });
});

describe('email, name and phone', () => {
  it('email is trimmed and case-insensitive', () => {
    expect(validateEmail('  Juan@Correo.COM ')).toBeUndefined();
    expect(validateEmail('juan@correo')).toBeDefined();
    expect(validateEmail('')).toBe('Escribe tu correo.');
  });

  it('names accept Spanish letters, spaces, apostrophes and hyphens', () => {
    expect(validateName("María José O'Neil-Díaz", 'firstName')).toBeUndefined();
    expect(validateName('J', 'firstName')).toContain('al menos 2');
    expect(validateName('Juan3', 'firstName')).toContain('solo puede tener letras');
  });

  it('phone is optional and ignores spaces, dashes and parentheses', () => {
    expect(validatePhone('')).toBeUndefined();
    expect(validatePhone('(300) 123-4567')).toBeUndefined();
    expect(validatePhone('+57 300 123 4567')).toBeUndefined();
    expect(validatePhone('12345')).toBeDefined();
  });
});

describe('codes and recovery (HU-002, HU-005)', () => {
  it('a code has exactly 6 digits', () => {
    expect(validateCode('123456')).toBeUndefined();
    expect(validateCode('12345')).toBeDefined();
    expect(validateCode('12a456')).toBeDefined();
  });

  it('recovery accepts an e-mail or a phone', () => {
    expect(validateIdentifier('juan@correo.com')).toBeUndefined();
    expect(validateIdentifier('300 123 4567')).toBeUndefined();
    expect(validateIdentifier('juan')).toBeDefined();
    expect(normalizeIdentifier(' Juan@Correo.com ')).toBe('juan@correo.com');
    expect(normalizeIdentifier('300-123-4567')).toBe('3001234567');
  });
});

describe('messages in English (HU-072)', () => {
  beforeEach(async () => {
    await i18n.changeLanguage('en');
  });

  it('form validation messages follow the language', () => {
    expect(validateEmail('')).toBe('Enter your email.');
    expect(validateName('J', 'lastName')).toBe('The last name must have at least 2 letters.');
    expect(validatePasswordConfirmation('Agua2026!', 'Agua2026?')).toBe('The passwords do not match.');
  });

  it('lists several missing password rules in natural English', () => {
    expect(describeRules(['UPPERCASE', 'DIGIT', 'SPECIAL'])).toBe('an uppercase letter, a number and a symbol (!@#$...)');
    expect(validatePassword('agua')).toBe('Your password needs at least 8 characters, an uppercase letter, a number and a symbol (!@#$...).');
  });
});
