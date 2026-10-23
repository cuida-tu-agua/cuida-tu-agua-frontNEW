import { changeLanguage } from '../../../i18n';
import {
  PHONE_CHANNEL_LABELS,
  countryOf,
  maskPhone,
  nationalMobile,
  nationalPartOf,
  validateMobile,
} from '../PhoneVerification';

describe('nationalMobile (same rules as ms-iam)', () => {
  it.each([
    ['CO', '3001112233', '3001112233'],
    ['CO', '300 111 2233', '3001112233'],
    ['CO', '300-111-2233', '3001112233'],
    ['CO', '+57 300 111 2233', '3001112233'],
    ['CO', '573001112233', '3001112233'],
    ['EC', '991112233', '991112233'],
    ['EC', '0991112233', '991112233'],
    ['EC', '099 111 2233', '991112233'],
    ['EC', '+593991112233', '991112233'],
  ] as const)('%s "%s" → %s', (country, text, digits) => {
    expect(nationalMobile(country, text)).toBe(digits);
  });

  it.each([
    ['CO', '6011112233'],    // landline
    ['CO', '300111223'],     // 9 digits
    ['CO', '30011122334'],   // 11 digits
    ['EC', '22111223'],
    ['EC', '99111223'],
    ['CO', 'abc'],
    ['EC', '3001112233'],    // a Colombian number with Ecuador selected
  ] as const)('%s "%s" is not a mobile of that country', (country, text) => {
    expect(nationalMobile(country, text)).toBeNull();
  });
});

describe('phone texts', () => {
  afterAll(async () => {
    await changeLanguage('es');
  });

  it('explains what is wrong, per country', () => {
    expect(validateMobile('CO', '')).toMatch(/Escribe tu número/);
    expect(validateMobile('CO', '6011112233')).toMatch(/10 dígitos y empieza por 3/);
    expect(validateMobile('EC', '22111223')).toMatch(/9 dígitos/);
    expect(validateMobile('EC', '0991112233')).toBeNull();
  });

  it('prefills the saved phone and masks it', () => {
    expect(countryOf('+593991112233')).toBe('EC');
    expect(countryOf('+573001112233')).toBe('CO');
    expect(countryOf(null)).toBe('CO');
    expect(nationalPartOf('+593991112233')).toBe('991112233');
    expect(nationalPartOf('+573001112233')).toBe('3001112233');
    expect(nationalPartOf('3001112233')).toBe('3001112233');   // an old phone saved without country code
    expect(nationalPartOf(null)).toBe('');
    expect(maskPhone('+573001112233')).toBe('+57300***233');
  });

  it('names the modes in the active language', async () => {
    expect(PHONE_CHANNEL_LABELS.WHATSAPP).toBe('WhatsApp');
    await changeLanguage('en');
    expect(validateMobile('CO', '123')).toMatch(/Colombian mobile/);
  });
});
