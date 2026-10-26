import { changeLanguage } from '../../../i18n';
import { MessageTemplate, renderMessage, sampleValues, smsCount, validateMessage, whatsAppShareUrl } from '../MessageTemplate';

const code: MessageTemplate = {
  key: 'PHONE_CODE',
  body: '{app}: tu código es {code}. Vence en {minutes} minutos.',
  defaultBody: '{app}: tu código es {code}. Vence en {minutes} minutos.',
  isCustom: false,
  placeholders: [
    { name: 'app', token: '{app}', required: false },
    { name: 'code', token: '{code}', required: true },
    { name: 'minutes', token: '{minutes}', required: false },
  ],
  maxLength: 320,
  updatedAt: null,
};

describe('renderMessage (same rules as ms-notification)', () => {
  it('fills the values and always puts the brand in {app}', () => {
    expect(renderMessage(code.body, { code: '123456', minutes: '5' })).toBe('Cuida Tu Agua: tu código es 123456. Vence en 5 minutos.');
  });

  it('leaves a missing value empty and keeps a value in one line', () => {
    expect(renderMessage('Hola {place}{owner}', { place: 'Casa\ncentro' })).toBe('Hola Casa centro');
  });
});

describe('validateMessage', () => {
  it('accepts the default text', () => {
    expect(validateMessage(code, code.defaultBody)).toBeNull();
  });

  it.each([
    ['', /Escribe el texto/],
    ['Tu código ya llegó', /\{code\}/],                       // a required one removed
    ['Tu código es {codigo}', /no es un dato de este mensaje/], // unknown placeholder
    ['Tu código es {code', /Cierra cada llave/],
    ['x'.repeat(321) + '{code}', /hasta 320 caracteres/],
  ])('refuses "%s"', (body, error) => {
    expect(validateMessage(code, body)).toMatch(error);
  });
});

describe('helpers', () => {
  afterAll(async () => {
    await changeLanguage('es');
  });

  it('counts the SMS of a text', () => {
    expect(smsCount('a'.repeat(160))).toBe(1);
    expect(smsCount('a'.repeat(161))).toBe(2);
    expect(smsCount('')).toBe(1);
  });

  it('opens WhatsApp with the text ready to send', () => {
    expect(whatsAppShareUrl('Mira mi consumo: https://x.co/g/1?a=b')).toBe(
      'https://wa.me/?text=Mira%20mi%20consumo%3A%20https%3A%2F%2Fx.co%2Fg%2F1%3Fa%3Db',
    );
  });

  it('gives example values in the active language', async () => {
    expect(sampleValues().place).toBe('Casa centro');
    await changeLanguage('en');
    expect(sampleValues().place).toBe('Downtown house');
    expect(validateMessage(code, '')).toMatch(/Write the text/);
  });
});
