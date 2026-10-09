import {
  THEME_NAMES,
  ThemeName,
  contrastRatio,
  darkColors,
  ecoDarkColors,
  ecoLightColors,
  isDark,
  lightColors,
  paletteFor,
  themeNameOf,
} from '../palettes';

const HEX = /^#[0-9A-F]{6}$/i;

describe('the four themes share the same tokens (the manual: "a component does not change when the theme does")', () => {
  it('there are exactly four: classic and eco, light and dark', () => {
    expect([...THEME_NAMES].sort()).toEqual(['classic-dark', 'classic-light', 'eco-dark', 'eco-light']);
    expect(themeNameOf('eco', 'dark')).toBe('eco-dark');
    expect(isDark('classic-dark')).toBe(true);
    expect(isDark('eco-light')).toBe(false);
  });

  it('every palette defines every token', () => {
    const tokens = Object.keys(lightColors).sort();
    for (const palette of [darkColors, ecoLightColors, ecoDarkColors]) {
      expect(Object.keys(palette).sort()).toEqual(tokens);
    }
  });

  it('colors are #RRGGBB (the contrast calculation needs it), except the veil and the shadow', () => {
    for (const name of THEME_NAMES) {
      const palette = paletteFor(name);
      for (const [token, value] of Object.entries(palette)) {
        if (token === 'overlay') continue;
        expect({ name, token, ok: HEX.test(value) }).toEqual({ name, token, ok: true });
      }
    }
  });

  it('the values written in the manual are exactly those', () => {
    expect(lightColors.primary).toBe('#0096C7');
    expect(lightColors.textPrimary).toBe('#023E8A');
    expect(lightColors.background).toBe('#F8FBFD');
    expect(darkColors.background).toBe('#0B1724');
    expect(darkColors.primary).toBe('#38BDF8');
    expect(ecoLightColors.primary).toBe('#0F6D6D');
    expect(ecoLightColors.background).toBe('#F4FBFB');
    expect(ecoDarkColors.background).toBe('#071A1A');
    expect(ecoDarkColors.textPrimary).toBe('#D9F3F3');
  });
});

describe('contrast: text reaches 4.5:1, headlines and large bold labels 3:1 (manual, "Reglas de color")', () => {
  const NAMES: ThemeName[] = THEME_NAMES;

  it.each(NAMES)('%s: body text over the page and over cards', (name) => {
    const c = paletteFor(name);
    for (const background of [c.background, c.surface, c.surfaceAlt]) {
      expect(contrastRatio(c.textPrimary, background)).toBeGreaterThanOrEqual(4.5);
      expect(contrastRatio(c.textSecondary, background)).toBeGreaterThanOrEqual(4.5);
    }
  });

  it.each(NAMES)('%s: captions and labels (textMuted)', (name) => {
    const c = paletteFor(name);
    expect(contrastRatio(c.textMuted, c.background)).toBeGreaterThanOrEqual(4.5);
    expect(contrastRatio(c.textMuted, c.surface)).toBeGreaterThanOrEqual(4.5);
  });

  it.each(NAMES)('%s: the label of a primary button (large bold text, 3:1) in every state', (name) => {
    const c = paletteFor(name);
    for (const fill of [c.primary, c.primaryHover, c.primaryActive]) {
      expect(contrastRatio(c.textOnPrimary, fill)).toBeGreaterThanOrEqual(3);
    }
  });

  it.each(NAMES)('%s: links and icons in primary over the page (3:1, they are large or accompanied by icon)', (name) => {
    const c = paletteFor(name);
    expect(contrastRatio(c.primary, c.background)).toBeGreaterThanOrEqual(3);
    expect(contrastRatio(c.primary, c.surface)).toBeGreaterThanOrEqual(3);
  });

  it.each(NAMES)('%s: a notice keeps its text readable and its semantic color works as icon and border', (name) => {
    const c = paletteFor(name);
    // The semantic color is for the icon and the border (3:1 over the card). The words of a notice use the text color,
    // which must read over the tinted background (4.5:1): the status is never told by color alone.
    for (const bg of [c.successBg, c.errorBg, c.warningBg, c.infoBg]) {
      expect(contrastRatio(c.textPrimary, bg)).toBeGreaterThanOrEqual(4.5);
    }
    for (const fg of [c.success, c.error, c.warning, c.info]) {
      expect(contrastRatio(fg, c.surface)).toBeGreaterThanOrEqual(3);
    }
  });

  it('the contrast function itself: black on white is 21:1 and equal colors are 1:1', () => {
    expect(contrastRatio('#000000', '#FFFFFF')).toBeCloseTo(21, 0);
    expect(contrastRatio('#123456', '#123456')).toBe(1);
  });
});
