import React from 'react';
import {
  View,
  ViewStyle,
  StyleProp,
} from 'react-native';
import { theme } from '../../styles/theme';
import { themed } from '../../styles/themeRuntime';

interface CardProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  variant?: 'default' | 'elevated' | 'outlined';
}

const cardBase: ViewStyle = themed(() => ({
  backgroundColor: theme.colors.surface,
  borderRadius: theme.borderRadius.medium,
  paddingHorizontal: theme.spacing.lg,
  paddingVertical: theme.spacing.lg,
}));

const variantStyles: Record<'default' | 'elevated' | 'outlined', ViewStyle> = themed(() => ({
  default: {
    ...theme.shadows.subtle,
  },
  elevated: {
    ...theme.shadows.medium,
  },
  outlined: {
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
}));

export const Card: React.FC<CardProps> = ({
  children,
  style,
  variant = 'default',
}) => {
  const cardStyle: StyleProp<ViewStyle> = [
    cardBase,
    variantStyles[variant],
    style,
  ];

  return <View style={cardStyle}>{children}</View>;
};