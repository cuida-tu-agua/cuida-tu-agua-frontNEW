import { changeLanguage } from '..';
import { formatDate, formatDateTime, formatNumber, formatTime, localeTag, numberMarks } from '../format';

const SAMPLE = new Date(Date.UTC(2026, 9, 19, 16, 44)); // 19 Oct 2026

describe('shared formatters (HU-077)', () => {
  it('Spanish uses es-CO: comma decimals and dot thousands', () => {
    expect(localeTag()).toBe('es-CO');
    expect(formatNumber(1234.5)).toBe('1.234,5');
    expect(formatDate(SAMPLE)).toMatch(/2026/);
    expect(formatDate(SAMPLE)).toMatch(/oct/i);
  });

  it('English uses en-US: point decimals and comma thousands', async () => {
    await changeLanguage('en');
    expect(localeTag()).toBe('en-US');
    expect(formatNumber(1234.5)).toBe('1,234.5');
    expect(formatDate(SAMPLE)).toMatch(/Oct/);
    expect(formatDateTime(SAMPLE)).toMatch(/2026/);
    expect(formatTime(SAMPLE)).toMatch(/AM|PM/);
  });

  it('accepts ISO strings and timestamps as well as dates', async () => {
    await changeLanguage('en');
    expect(formatDate(SAMPLE.toISOString())).toBe(formatDate(SAMPLE));
    expect(formatDate(SAMPLE.getTime())).toBe(formatDate(SAMPLE));
  });
});

describe('formats of French and Portuguese (HU-080)', () => {
  it('French uses a no-break space for thousands and a comma for decimals', async () => {
    await changeLanguage('fr');
    expect(localeTag()).toBe('fr-FR');
    expect(numberMarks()).toEqual({ group: ' ', decimal: ',' });
    expect(formatNumber(1234.5)).toMatch(/^1\s234,5$/);
    expect(formatDate(SAMPLE)).toMatch(/oct/i);
  });
});
