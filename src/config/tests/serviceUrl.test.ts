import { resolveServiceUrl } from '../serviceUrl';

describe('resolveServiceUrl: one project for web and mobile', () => {
  it('uses the configured address first, without a trailing slash', () => {
    expect(resolveServiceUrl({ configured: 'https://api.cuidatuagua.co/', port: 3001, web: { protocol: 'http:', hostname: 'localhost' } }))
      .toBe('https://api.cuidatuagua.co');
  });

  it('ignores an empty or blank variable', () => {
    expect(resolveServiceUrl({ configured: '   ', port: 3002, web: { protocol: 'http:', hostname: 'localhost' } }))
      .toBe('http://localhost:3002');
    expect(resolveServiceUrl({ configured: '', port: 3002, devHost: '10.3.234.128' })).toBe('http://10.3.234.128:3002');
  });

  it('on web it follows the host of the page, so it works from the PC and from the LAN', () => {
    expect(resolveServiceUrl({ port: 3003, web: { protocol: 'http:', hostname: 'localhost' } })).toBe('http://localhost:3003');
    expect(resolveServiceUrl({ port: 3003, web: { protocol: 'http:', hostname: '10.3.234.128' } })).toBe('http://10.3.234.128:3003');
    expect(resolveServiceUrl({ port: 3003, web: { protocol: 'https:', hostname: 'app.cuidatuagua.co' } })).toBe('https://app.cuidatuagua.co:3003');
  });

  it('on a phone in development it uses the PC that runs Expo', () => {
    expect(resolveServiceUrl({ port: 3006, devHost: '10.3.234.128', platform: 'android' })).toBe('http://10.3.234.128:3006');
    expect(resolveServiceUrl({ port: 3006, devHost: '192.168.1.20', platform: 'ios' })).toBe('http://192.168.1.20:3006');
  });

  it('falls back to the emulator address on Android and to localhost elsewhere', () => {
    expect(resolveServiceUrl({ port: 3001, platform: 'android' })).toBe('http://10.0.2.2:3001');
    expect(resolveServiceUrl({ port: 3001, platform: 'ios' })).toBe('http://localhost:3001');
  });
});
