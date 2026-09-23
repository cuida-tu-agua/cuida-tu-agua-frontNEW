import { colors } from './colors';
import { typography, textStyles } from './typography';
import { spacing, borderRadius, shadows, paddingHorizontal, paddingVertical } from './spacing';

export const theme = {
  colors,
  typography,
  textStyles,
  spacing,
  borderRadius,
  shadows,
  paddingHorizontal,
  paddingVertical,
};

export type Theme = typeof theme;