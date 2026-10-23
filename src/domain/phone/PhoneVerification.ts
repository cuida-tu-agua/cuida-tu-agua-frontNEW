import i18n from '../../i18n';

/** HU-028: how the phone receives the code and, afterwards, the critical alerts. */
export type PhoneChannel = 'SMS' | 'WHATSAPP';

/** The countries where phones are verified today. */
export type PhoneCountry = 'CO' | 'EC';

export interface PhoneCodeSent {
  maskedPhone: string;
  channel: PhoneChannel;
  expiresAt: string;
}

export const PHONE_CHANNELS: PhoneChannel[] = ['WHATSAPP', 'SMS'];
export const PHONE_COUNTRIES: PhoneCountry[] = ['CO', 'EC'];

export const DIAL_CODES: Record<PhoneCountry, string> = { CO: '+57', EC: '+593' };

/** Same rules as ms-iam: a Colombian mobile has 10 digits and starts with 3; an Ecuadorian one 9 digits starting with 9. */
const MOBILE: Record<PhoneCountry, RegExp> = { CO: /^3\d{9}$/, EC: /^9\d{8}$/ };

/** Getters: the text follows the active language. */
export const PHONE_CHANNEL_LABELS: Record<PhoneChannel, string> = {
  get SMS() {
    return i18n.t('phone.channel.SMS');
  },
  get WHATSAPP() {
    return i18n.t('phone.channel.WHATSAPP');
  },
};

export const PHONE_COUNTRY_LABELS: Record<PhoneCountry, string> = {
  get CO() {
    return i18n.t('phone.country.CO');
  },
  get EC() {
    return i18n.t('phone.country.EC');
  },
};

/**
 * What the user typed → the national digits ms-iam expects, or null when it is not a mobile of that country.
 * Spaces, dashes, dots, parentheses and the country code are tolerated; Ecuador also accepts its leading 0.
 */
export const nationalMobile = (country: PhoneCountry, text: string): string | null => {
  let digits = text.replace(/[\s\-.()]/g, '');
  const code = DIAL_CODES[country].slice(1);
  if (digits.startsWith(`+${code}`)) digits = digits.slice(code.length + 1);
  else if (digits.startsWith(code) && digits.length > code.length + 8) digits = digits.slice(code.length);
  if (country === 'EC' && digits.startsWith('0')) digits = digits.slice(1);
  return MOBILE[country].test(digits) ? digits : null;
};

/** The error to show under the number field, or null when it is valid. */
export const validateMobile = (country: PhoneCountry, text: string): string | null => {
  if (!text.trim()) return i18n.t('phone.required');
  return nationalMobile(country, text) ? null : i18n.t(`phone.invalid.${country}`);
};

/** Which country an already saved phone belongs to ("+593…" → Ecuador; anything else → Colombia, the main market). */
export const countryOf = (phone: string | null | undefined): PhoneCountry => (phone?.startsWith('+593') ? 'EC' : 'CO');

/** The saved phone without its country code, to prefill the field ("+573001112233" → "3001112233"). */
export const nationalPartOf = (phone: string | null | undefined): string => {
  if (!phone) return '';
  const country = countryOf(phone);
  return phone.startsWith(DIAL_CODES[country]) ? phone.slice(DIAL_CODES[country].length) : phone.replace(/^\+/, '');
};

/** "+573001112233" → "+57300***233" (same as ms-iam). */
export const maskPhone = (phone: string | null | undefined): string =>
  !phone || phone.length < 8 ? '***' : `${phone.slice(0, 6)}***${phone.slice(-3)}`;
