import { darkColors, lightColors } from '../palettes';
import { colors, currentPalette, getThemeName, getThemeVersion, setThemeName, themed } from '../themeRuntime';

afterEach(() => {
  setThemeName('classic-light');
});

describe('colors: always the palette of the current theme', () => {
  it('reads the live value on every access', () => {
    expect(colors.background).toBe(lightColors.background);
    setThemeName('classic-dark');
    expect(colors.background).toBe(darkColors.background);
    expect(currentPalette().primary).toBe(darkColors.primary);
  });

  it('can be spread and listed like a plain object', () => {
    setThemeName('eco-dark');
    const copy = { ...colors };
    expect(copy.primary).toBe(colors.primary);
    expect(Object.keys(copy).length).toBe(Object.keys(lightColors).length);
  });

  it('refuses to be written', () => {
    expect(() => {
      'use strict';
      (colors as { primary: string }).primary = '#000000';
    }).toThrow();
  });
});

describe('setThemeName', () => {
  it('only counts a real change', () => {
    const before = getThemeVersion();
    expect(setThemeName('classic-light')).toBe(false);
    expect(getThemeVersion()).toBe(before);
    expect(setThemeName('eco-light')).toBe(true);
    expect(getThemeName()).toBe('eco-light');
    expect(getThemeVersion()).toBe(before + 1);
  });
});

describe('themed: styles that follow the theme', () => {
  it('re-evaluates after the theme changed and not before', () => {
    let runs = 0;
    const style = themed(() => {
      runs += 1;
      return { backgroundColor: colors.surface, padding: 8 };
    });

    expect(style.backgroundColor).toBe(lightColors.surface);
    expect(style.padding).toBe(8);
    expect(runs).toBe(1);                       // the second read did not run the factory again

    setThemeName('classic-dark');
    expect(style.backgroundColor).toBe(darkColors.surface);
    expect(runs).toBe(2);
  });

  it('spreads, lists keys and works inside an array of styles', () => {
    const base = themed(() => ({ color: colors.textPrimary, fontSize: 16 }));
    const derived = themed(() => ({ ...base, backgroundColor: colors.surface }));

    setThemeName('eco-light');
    expect({ ...derived }).toEqual({ color: colors.textPrimary, fontSize: 16, backgroundColor: colors.surface });
    expect(Object.keys(derived).sort()).toEqual(['backgroundColor', 'color', 'fontSize']);
    expect('fontSize' in derived).toBe(true);
    expect(JSON.parse(JSON.stringify(derived)).fontSize).toBe(16);
  });

  it('a table of styles keeps working after a change', () => {
    const tones = themed(() => ({ ok: { fg: colors.success }, bad: { fg: colors.error } }));

    setThemeName('classic-dark');
    expect(tones.ok.fg).toBe(darkColors.success);
    expect(tones.bad.fg).toBe(darkColors.error);
  });

  it('an array stays an array', () => {
    const levels = themed(() => [{ color: colors.error }, { color: colors.success }]);

    expect(Array.isArray(levels)).toBe(true);
    expect(levels.length).toBe(2);
    expect(levels.map((l) => l.color)).toEqual([lightColors.error, lightColors.success]);
    setThemeName('classic-dark');
    expect(levels[1].color).toBe(darkColors.success);
  });

  it('also re-evaluates when its variant changes (values that depend on the screen width)', () => {
    let wide = false;
    let runs = 0;
    const text = themed(() => { runs += 1; return { fontSize: wide ? 16 : 18 }; }, () => wide);

    expect(text.fontSize).toBe(18);
    wide = true;
    expect(text.fontSize).toBe(16);
    expect(runs).toBe(2);
  });
});
