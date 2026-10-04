import { LinkDeviceInput } from './Device';

// Same rules as DeviceSecrets in ms-devices, so most mistakes are caught before calling the API.

/** Characters of the pairing code: no 0/O and no 1/I/L. */
export const PAIRING_ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
export const PAIRING_CODE_LENGTH = 8;
const SERIAL_PATTERN = /^[A-Z0-9-]{4,32}$/;

// A "type" (not an "interface") so it fits useForm<T extends Record<string, ...>>
export type LinkDeviceFormValues = {
  serialNumber: string;
  pairingCode: string;
};

export type LinkDeviceFormField = keyof LinkDeviceFormValues;
export type LinkDeviceFormErrors = Partial<Record<LinkDeviceFormField, string>>;

export const EMPTY_LINK_DEVICE_FORM: LinkDeviceFormValues = { serialNumber: '', pairingCode: '' };

/** While typing: uppercase, no spaces. "sw-esp32 0001" → "SW-ESP320001". */
export const formatSerialInput = (text: string): string =>
  text.toUpperCase().replace(/\s+/g, '').slice(0, 32);

/**
 * While typing: keeps only valid characters and adds the dash like the box label.
 * "4hzxv" → "4HZX-V", "4HZX-VCDP" → "4HZX-VCDP".
 */
export const formatPairingCodeInput = (text: string): string => {
  const clean = text
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '')
    .slice(0, PAIRING_CODE_LENGTH);
  return clean.length > 4 ? `${clean.slice(0, 4)}-${clean.slice(4)}` : clean;
};

const pairingCodeChars = (code: string) => code.replace(/-/g, '');

export const validateLinkDeviceForm = (values: LinkDeviceFormValues): LinkDeviceFormErrors => {
  const errors: LinkDeviceFormErrors = {};
  const serial = values.serialNumber.trim();
  const code = pairingCodeChars(values.pairingCode);

  if (!serial) {
    errors.serialNumber = 'Escribe el serial que aparece en la caja.';
  } else if (!SERIAL_PATTERN.test(serial)) {
    errors.serialNumber = 'El serial solo tiene letras, números y guiones (ej. SW-ESP32-000001).';
  }

  if (!code) {
    errors.pairingCode = 'Escribe el código de emparejamiento.';
  } else if (code.length !== PAIRING_CODE_LENGTH) {
    errors.pairingCode = `El código tiene ${PAIRING_CODE_LENGTH} caracteres (ej. ABCD-EFGH).`;
  } else if ([...code].some((c) => !PAIRING_ALPHABET.includes(c))) {
    errors.pairingCode = 'El código no usa 0, O, 1, I ni L. Revisa la etiqueta.';
  }

  return errors;
};

export const hasLinkDeviceErrors = (errors: LinkDeviceFormErrors): boolean =>
  Object.values(errors).some(Boolean);

export const toLinkDeviceInput = (values: LinkDeviceFormValues): LinkDeviceInput => ({
  serialNumber: values.serialNumber.trim(),
  pairingCode: values.pairingCode,
});
