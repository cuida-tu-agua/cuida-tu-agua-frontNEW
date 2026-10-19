/**
 * The four themes of Cuida Tu Agua (Manual visual web 2026, section 2.3): classic light, classic dark, eco light and
 * eco dark. All four share the SAME tokens, so a component never changes when the theme does.
 *
 * Values marked "manual" are the ones written in the manual. The rest of a palette (hover / active states, borders,
 * semantic backgrounds) is derived from it keeping the manual's rule: text over its background reaches 4.5:1
 * (3:1 only for headlines and large bold labels); a state is never told by color alone (always icon or text too).
 * Those pairs are verified by tests (palettes.test.ts).
 */
export interface ColorTokens {
  // Primary
  primary: string;
  primaryHover: string;
  primaryActive: string;
  primaryDisabled: string;

  // Secondary and accent
  secondary: string;
  secondaryHover: string;
  secondaryActive: string;
  accent: string;
  accentHover: string;

  // Background and surfaces
  background: string;
  surface: string;
  surfaceAlt: string;

  // Text
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  /** Text over a primary / danger colored button. */
  textOnPrimary: string;

  // Neutrals
  grayLight: string;
  grayMedium: string;
  grayDark: string;
  border: string;

  // Semantic
  success: string;
  successBg: string;
  error: string;
  errorBg: string;
  warning: string;
  warningBg: string;
  info: string;
  infoBg: string;

  /** Veil behind modals. */
  overlay: string;
  /** Color of the shadows (a shadow on a dark theme is darker than the page, never white). */
  shadow: string;
}

export type ThemeStyle = 'classic' | 'eco';
export type ThemeMode = 'light' | 'dark';
export type ThemeName = `${ThemeStyle}-${ThemeMode}`;

/** Classic light: the colors of the app until now, all written in the manual. */
export const lightColors: ColorTokens = {
  primary: '#0096C7', // manual
  primaryHover: '#0077A3', // manual
  primaryActive: '#005F82', // manual
  primaryDisabled: '#7FC7DE', // manual

  secondary: '#48CAE4', // manual
  secondaryHover: '#2BB3D6', // manual
  secondaryActive: '#1E9CBF', // manual
  accent: '#90E0EF', // manual
  accentHover: '#6DD3E8', // manual

  background: '#F8FBFD', // manual
  surface: '#FFFFFF', // manual
  surfaceAlt: '#EDF6FA', // manual

  textPrimary: '#023E8A', // manual
  textSecondary: '#0B5FA5', // manual
  textMuted: '#6B7280', // manual
  textOnPrimary: '#FFFFFF', // manual

  grayLight: '#F2F2F2', // manual
  grayMedium: '#C2C2C2', // manual
  grayDark: '#6B7280',
  border: '#E5E7EB', // manual

  success: '#10853B', // manual
  successBg: '#DCFCE7', // manual
  error: '#A91B1B', // manual
  errorBg: '#FEE2E2', // manual
  warning: '#C98107', // manual
  warningBg: '#FEF3C7', // manual
  info: '#0284C7', // manual
  infoBg: '#E0F2FE',

  overlay: 'rgba(2, 62, 138, 0.35)',
  shadow: '#000000',
};

/** Classic dark (darkColors in the manual). */
export const darkColors: ColorTokens = {
  primary: '#38BDF8', // manual
  primaryHover: '#0EA5E9', // manual
  primaryActive: '#0284C7', // manual
  primaryDisabled: '#1E3A5F', // manual

  secondary: '#67E8F9', // manual
  secondaryHover: '#22D3EE',
  secondaryActive: '#06B6D4',
  accent: '#67E8F9', // manual
  accentHover: '#A5F3FC',

  background: '#0B1724', // manual
  surface: '#0F1F33', // manual
  surfaceAlt: '#13263D', // manual

  textPrimary: '#E0F2FE', // manual
  textSecondary: '#BAE6FD', // manual
  textMuted: '#94A3B8', // manual
  textOnPrimary: '#0B1724', // dark text: white would not reach 3:1 over the light blue of this theme

  grayLight: '#13263D',
  grayMedium: '#475569',
  grayDark: '#94A3B8',
  border: '#1F2A44', // manual

  success: '#22C55E', // manual
  successBg: '#0F2E1D',
  error: '#EF4444', // manual
  errorBg: '#3A1518',
  warning: '#F59E0B', // manual
  warningBg: '#3A2A0A',
  info: '#38BDF8',
  infoBg: '#0C2A44',

  overlay: 'rgba(0, 0, 0, 0.6)',
  shadow: '#000000',
};

/** Eco light (ecoLightColors in the manual): the same product in greens-teals. */
export const ecoLightColors: ColorTokens = {
  primary: '#0F6D6D', // manual
  primaryHover: '#0C5C5C', // manual
  primaryActive: '#094848',
  primaryDisabled: '#8DBDBD',

  secondary: '#2A9D9D', // manual
  secondaryHover: '#238686',
  secondaryActive: '#1C6F6F',
  accent: '#5CCFCF', // manual
  accentHover: '#45BDBD',

  background: '#F4FBFB', // manual
  surface: '#FFFFFF',
  surfaceAlt: '#E6F4F4', // manual

  textPrimary: '#0B3C3C', // manual
  textSecondary: '#145757', // manual
  textMuted: '#587575',
  textOnPrimary: '#FFFFFF',

  grayLight: '#EEF3F3',
  grayMedium: '#B8C7C7',
  grayDark: '#587575',
  border: '#CFE6E6',

  success: '#0E632E', // manual
  successBg: '#DDF3E5',
  error: '#A81B1B', // manual
  errorBg: '#FEE2E2',
  warning: '#C88007', // manual
  warningBg: '#FEF3C7',
  info: '#0EA5A5', // manual
  infoBg: '#D9F3F3',

  overlay: 'rgba(7, 26, 26, 0.4)',
  shadow: '#000000',
};

/** Eco dark (ecoDarkColors in the manual). The semantic colors are the brighter versions so they read over the dark. */
export const ecoDarkColors: ColorTokens = {
  primary: '#2A9D9D', // manual (eco/primary)
  primaryHover: '#35B3B3',
  primaryActive: '#1F8080',
  primaryDisabled: '#1C4A4A',

  secondary: '#5CCFCF',
  secondaryHover: '#7ADADA',
  secondaryActive: '#45BDBD',
  accent: '#5CCFCF',
  accentHover: '#7ADADA',

  background: '#071A1A', // manual (eco/background)
  surface: '#0B2626', // manual (eco/surface)
  surfaceAlt: '#103030',

  textPrimary: '#D9F3F3', // manual (eco/textPrimary)
  textSecondary: '#A9D8D8',
  textMuted: '#7FA6A6',
  textOnPrimary: '#071A1A',

  grayLight: '#103030',
  grayMedium: '#3E6666',
  grayDark: '#7FA6A6',
  border: '#18403F',

  success: '#22C55E',
  successBg: '#0D2E1C',
  error: '#F87171',
  errorBg: '#3A1618',
  warning: '#F59E0B',
  warningBg: '#38280A',
  info: '#2DD4BF',
  infoBg: '#0C3030',

  overlay: 'rgba(0, 0, 0, 0.6)',
  shadow: '#000000',
};

const PALETTES: Record<ThemeName, ColorTokens> = {
  'classic-light': lightColors,
  'classic-dark': darkColors,
  'eco-light': ecoLightColors,
  'eco-dark': ecoDarkColors,
};

export const THEME_NAMES = Object.keys(PALETTES) as ThemeName[];

export const themeNameOf = (style: ThemeStyle, mode: ThemeMode): ThemeName => `${style}-${mode}`;

export const paletteFor = (name: ThemeName): ColorTokens => PALETTES[name];

export const isDark = (name: ThemeName): boolean => name.endsWith('-dark');

// ── WCAG contrast (the rule of the manual: 4.5:1 for text, 3:1 for headlines) ─────────────────────────────────────

const channel = (value: number) => {
  const c = value / 255;
  return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
};

const luminance = (hex: string): number => {
  const n = parseInt(hex.slice(1), 16);
  return 0.2126 * channel((n >> 16) & 255) + 0.7152 * channel((n >> 8) & 255) + 0.0722 * channel(n & 255);
};

/** Contrast ratio between two #RRGGBB colors, from 1 (equal) to 21 (black on white). */
export const contrastRatio = (foreground: string, background: string): number => {
  const [light, dark] = [luminance(foreground), luminance(background)].sort((a, b) => b - a);
  return (light + 0.05) / (dark + 0.05);
};
