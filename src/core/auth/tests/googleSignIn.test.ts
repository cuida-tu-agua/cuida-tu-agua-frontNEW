import { googleStartUrl, readGoogleResult } from '../googleSignIn';

describe('readGoogleResult (HU-004)', () => {
  it('reads the single-use code that ms-iam sends back', () => {
    expect(readGoogleResult('https://sy-water.tech/?google_code=abc-123_X')).toEqual({ code: 'abc-123_X' });
    expect(readGoogleResult('saveyourwater://auth/google?google_code=q%2Bw')).toEqual({ code: 'q+w' });
    expect(readGoogleResult('exp://192.168.1.20:8081/--/auth/google?x=1&google_code=zz')).toEqual({ code: 'zz' });
  });

  it('reads the error code', () => {
    expect(readGoogleResult('https://sy-water.tech/?google_error=auth.account_blocked')).toEqual({
      error: 'auth.account_blocked',
    });
  });

  it('ignores addresses without a result', () => {
    expect(readGoogleResult('https://sy-water.tech/')).toBeNull();
    expect(readGoogleResult('https://sy-water.tech/?google_code=')).toBeNull();
    expect(readGoogleResult(null)).toBeNull();
  });
});

describe('googleStartUrl', () => {
  it('sends the return address encoded', () => {
    expect(googleStartUrl('saveyourwater://auth/google')).toMatch(
      /\/api\/auth\/google\/start\?redirect=saveyourwater%3A%2F%2Fauth%2Fgoogle$/,
    );
  });
});
