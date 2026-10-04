import {
  formatPairingCodeInput,
  formatSerialInput,
  hasLinkDeviceErrors,
  toLinkDeviceInput,
  validateLinkDeviceForm,
} from '../linkDeviceForm';

describe('formatSerialInput', () => {
  it('uppercases and removes spaces', () => {
    expect(formatSerialInput(' sw-esp32 000001')).toBe('SW-ESP32000001');
  });
});

describe('formatPairingCodeInput', () => {
  it.each([
    ['4hz', '4HZ'],
    ['4hzx', '4HZX'],
    ['4hzxv', '4HZX-V'],
    ['4hzx-vcdp', '4HZX-VCDP'],
    ['4HZX VCDP', '4HZX-VCDP'],
    ['4HZXVCDPQQQ', '4HZX-VCDP'], // max 8 characters
  ])('"%s" → "%s"', (input, expected) => {
    expect(formatPairingCodeInput(input)).toBe(expected);
  });
});

describe('validateLinkDeviceForm', () => {
  const valid = { serialNumber: 'SW-ESP32-000001', pairingCode: '4HZX-VCDP' };

  it('accepts the values printed on the box', () => {
    expect(hasLinkDeviceErrors(validateLinkDeviceForm(valid))).toBe(false);
  });

  it('requires both fields', () => {
    const errors = validateLinkDeviceForm({ serialNumber: ' ', pairingCode: '' });
    expect(Object.keys(errors).sort()).toEqual(['pairingCode', 'serialNumber']);
  });

  it('rejects serials with strange characters', () => {
    expect(validateLinkDeviceForm({ ...valid, serialNumber: 'SW_ESP32/1' }).serialNumber).toBeDefined();
  });

  it('rejects short codes', () => {
    expect(validateLinkDeviceForm({ ...valid, pairingCode: '4HZX-VC' }).pairingCode).toMatch(/8 caracteres/);
  });

  it('rejects look-alike characters that are never printed', () => {
    expect(validateLinkDeviceForm({ ...valid, pairingCode: '0HZX-VCDP' }).pairingCode).toMatch(/0, O, 1, I ni L/);
  });

  it('builds the request body with the trimmed serial', () => {
    expect(toLinkDeviceInput({ ...valid, serialNumber: ' SW-ESP32-000001 ' })).toEqual(valid);
  });
});
