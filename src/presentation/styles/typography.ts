import { Dimensions, Platform } from 'react-native';
import { FONT, withFallback } from './fonts';
import { themed } from './themeRuntime';

/** Desktop sizes apply to a web window from a tablet up; phones and narrow windows use the mobile sizes. */
export const isWideScreen = (): boolean => Platform.OS === 'web' && Dimensions.get('window').width >= 768;

/**
 * Manual visual, section 3.3. Minimum 16 px on desktop and 18 px on mobile for body text, and never under 14 px in any
 * text (only the data label, in mono, goes down to 11-12 px). Line height 1.5 to 1.75 for any running text.
 */
const SIZES = {
  desktop: { h1: 40, h2: 30, h3: 22, body: 16, bodyLong: 18, button: 18, caption: 13, label: 11 },
  mobile: { h1: 32, h2: 26, h3: 20, body: 18, bodyLong: 18, button: 18, caption: 14, label: 12 },
} as const;

const LINE_HEIGHTS = { h1: 1.1, h2: 1.2, h3: 1.3, body: 1.65, bodyLong: 1.75, button: 1, caption: 1.5, label: 1.4 } as const;

const WEIGHTS = { regular: 400, semibold: 600, bold: 800 } as const;

const sizesNow = () => (isWideScreen() ? SIZES.desktop : SIZES.mobile);

/** Values of the typography that change with the width of the window, so a style is recalculated when it crosses 768. */
export const typography = themed(
  () => ({
    fontFamily: { manrope: withFallback(FONT.regular), monospace: withFallback(FONT.mono) },
    weights: WEIGHTS,
    sizes: sizesNow(),
    lineHeights: LINE_HEIGHTS,
  }),
  isWideScreen,
);

const px = (size: number, ratio: number) => Math.round(size * ratio * 100) / 100;

/** Ready-made text styles. Colors are not here: each screen paints the text with the theme. */
export const textStyles = themed(
  () => {
    const s = sizesNow();
    return {
      h1: { fontSize: s.h1, fontWeight: '800' as const, lineHeight: px(s.h1, LINE_HEIGHTS.h1), fontFamily: withFallback(FONT.bold) },
      h2: { fontSize: s.h2, fontWeight: '800' as const, lineHeight: px(s.h2, LINE_HEIGHTS.h2), fontFamily: withFallback(FONT.bold) },
      h3: { fontSize: s.h3, fontWeight: '600' as const, lineHeight: px(s.h3, LINE_HEIGHTS.h3), fontFamily: withFallback(FONT.semibold) },
      body: { fontSize: s.body, fontWeight: '400' as const, lineHeight: px(s.body, LINE_HEIGHTS.body), fontFamily: withFallback(FONT.regular) },
      bodyLong: { fontSize: s.bodyLong, fontWeight: '400' as const, lineHeight: px(s.bodyLong, LINE_HEIGHTS.bodyLong), fontFamily: withFallback(FONT.regular) },
      button: {
        fontSize: s.button,
        fontWeight: '800' as const,
        lineHeight: px(s.button, 1.2), // the manual says 1; a little room keeps accents and descenders from touching the border
        letterSpacing: 0.9,
        fontFamily: withFallback(FONT.bold),
      },
      label: {
        fontSize: s.label,
        fontWeight: '500' as const,
        lineHeight: px(s.label, LINE_HEIGHTS.label),
        letterSpacing: 1.2,
        fontFamily: withFallback(FONT.mono),
      },
      caption: { fontSize: s.caption, fontWeight: '400' as const, lineHeight: px(s.caption, LINE_HEIGHTS.caption), fontFamily: withFallback(FONT.regular) },
    };
  },
  isWideScreen,
);
