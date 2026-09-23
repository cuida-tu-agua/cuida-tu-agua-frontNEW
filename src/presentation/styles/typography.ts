export const typography = {
  // Font families
  fontFamily: {
    manrope: 'Manrope',
    monospace: 'IBM Plex Mono',
  },

  // Font weights
  weights: {
    regular: 400,
    semibold: 600,
    bold: 800,
  },

  // Font sizes (mobile)
  sizes: {
    h1: 32,
    h2: 26,
    h3: 20,
    body: 18,
    button: 16,
    caption: 14,
    label: 12,
  },

  // Line heights
  lineHeights: {
    h1: 1.1,
    h2: 1.2,
    h3: 1.3,
    body: 1.65,
    button: 1,
    caption: 1.5,
    label: 1.4,
  },
} as const;

// Helper: crear estilos de texto
export const textStyles = {
  h1: {
    fontSize: typography.sizes.h1,
    fontWeight: typography.weights.bold,
    lineHeight: typography.sizes.h1 * typography.lineHeights.h1,
    fontFamily: typography.fontFamily.manrope,
  },
  h2: {
    fontSize: typography.sizes.h2,
    fontWeight: typography.weights.bold,
    lineHeight: typography.sizes.h2 * typography.lineHeights.h2,
    fontFamily: typography.fontFamily.manrope,
  },
  body: {
    fontSize: typography.sizes.body,
    fontWeight: typography.weights.regular,
    lineHeight: typography.sizes.body * typography.lineHeights.body,
    fontFamily: typography.fontFamily.manrope,
  },
  button: {
    fontSize: typography.sizes.button,
    fontWeight: typography.weights.bold,
    lineHeight: typography.sizes.button * typography.lineHeights.button,
    fontFamily: typography.fontFamily.manrope,
  },
  label: {
    fontSize: typography.sizes.label,
    fontWeight: typography.weights.semibold,
    lineHeight: typography.sizes.label * typography.lineHeights.label,
    fontFamily: typography.fontFamily.monospace,
  },
  caption: {
    fontSize: typography.sizes.caption,
    fontWeight: typography.weights.regular,
    lineHeight: typography.sizes.caption * typography.lineHeights.caption,
    fontFamily: typography.fontFamily.manrope,
  },
};