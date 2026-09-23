export const spacing = {
  // Base unit: 4px
  xs: 4,      // Tiny gaps
  sm: 8,      // Small gaps
  md: 12,     // Medium (default gap)
  lg: 16,     // Large (default padding)
  xl: 24,     // Extra large
  xxl: 32,    // 2xl
  xxxl: 40,   // 3xl
  huge: 48,   // Huge spacing
};

// Shortcuts para paddding/margin comunes
export const paddingHorizontal = {
  small: spacing.md,    // 12px
  medium: spacing.lg,   // 16px
  large: spacing.xl,    // 24px
};

export const paddingVertical = {
  small: spacing.md,    // 12px
  medium: spacing.lg,   // 16px
  large: spacing.xl,    // 24px
};

// Border radius
export const borderRadius = {
  small: 8,
  medium: 12,
  large: 16,
  full: 9999,
};

// Shadow (React Native)
export const shadows = {
  subtle: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  medium: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 4,
  },
  prominent: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
};