import {
  FactoryDevice,
  badgeOf,
  credentialsCsv,
  normalizeSerial,
  parseCount,
  qrPayload,
  secretsPy,
  setupPassword,
} from '../AdminDevices';

const device: FactoryDevice = { id: 'd1', serialNumber: 'SW-ESP32-000009', pairingCode: 'QWER-TYUP', authToken: 'k3Jd9_xQ0pL2mN8vB4cT6yR1wE5uI7oA' };

describe('badgeOf', () => {
  it('a decommissioned device is never "connected", whatever it last reported', () => {
    expect(badgeOf({ status: 'CONNECTED', decommissioned: true })).toEqual({ label: 'Dado de baja', tone: 'bad' });
  });

  it.each([
    ['CONNECTED', 'Conectado', 'good'],
    ['DISCONNECTED', 'Desconectado', 'warn'],
    ['NEVER_REPORTED', 'Nunca ha reportado', 'neutral'],
  ] as const)('%s is "%s"', (status, label, tone) => {
    expect(badgeOf({ status, decommissioned: false })).toEqual({ label, tone });
  });
});

describe('parseCount', () => {
  it.each(['1', '50', ' 7 '])('accepts %p', (text) => expect(parseCount(text).ok).toBe(true));
  it.each(['', '0', '51', '-1', '2.5', 'abc', '1e1'])('rejects %p with a message', (text) => {
    const result = parseCount(text);
    expect(result.ok).toBe(false);
    expect(result.ok ? '' : result.error).not.toBe('');
  });
});

describe('normalizeSerial', () => {
  it('capitals and trimmed, like the server', () => expect(normalizeSerial(' sw-esp32-000100 ')).toBe('SW-ESP32-000100'));
  it.each(['', 'a b', 'ab', 'x'.repeat(33), 'sw_esp32'])('rejects %p', (text) => expect(normalizeSerial(text)).toBeNull());
});

describe('credentials for the label and the firmware', () => {
  it('the setup WiFi password is the pairing code without the dash', () => expect(setupPassword(device)).toBe('QWERTYUP'));

  it('the QR carries the serial and the code', () => {
    expect(qrPayload(device)).toBe('saveyourwater://link-device?serial=SW-ESP32-000009&code=QWERTYUP');
  });

  it('the CSV has one line per device and quotes what needs it', () => {
    const csv = credentialsCsv([device, { ...device, id: 'd2', serialNumber: 'SW-ESP32-000010', authToken: 'a,b"c' }]);

    expect(csv.split('\n')).toEqual([
      'serial,codigo_emparejamiento,token_firmware',
      'SW-ESP32-000009,QWER-TYUP,k3Jd9_xQ0pL2mN8vB4cT6yR1wE5uI7oA',
      'SW-ESP32-000010,QWER-TYUP,"a,b""c"',
      '',
    ]);
  });

  it('secrets.py has the identity of THAT device and the broker the administrator typed', () => {
    const text = secretsPy(device, ' 192.168.1.20 ');

    expect(text).toContain('MQTT_HOST = "192.168.1.20"');
    expect(text).toContain('DEVICE_SERIAL = "SW-ESP32-000009"');
    expect(text).toContain('DEVICE_TOKEN = "k3Jd9_xQ0pL2mN8vB4cT6yR1wE5uI7oA"');
    expect(text).toContain('SETUP_PASSWORD = "QWERTYUP"');
  });

  it('without a broker it leaves the template placeholder', () => {
    expect(secretsPy(device, '  ')).toContain('MQTT_HOST = "192.168.X.X"');
  });
});
