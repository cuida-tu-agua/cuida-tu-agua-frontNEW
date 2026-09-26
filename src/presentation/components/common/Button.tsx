import React from 'react';
import {
  View,
  TouchableOpacity,
  Text,
  ViewStyle,
  TextStyle,
  ActivityIndicator,
  StyleProp,
} from 'react-native';
import { theme } from '../../styles/theme';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
type ButtonSize = 'small' | 'medium' | 'large';

interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  loading?: boolean;
  style?: StyleProp<ViewStyle>;
  icon?: React.ReactNode;
}

const containerStyles: Record<ButtonSize, ViewStyle> = {
  small: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.small,
    alignItems: 'center',
    justifyContent: 'center',
    height: 40,
  },
  medium: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.medium,
    alignItems: 'center',
    justifyContent: 'center',
    height: 48,
  },
  large: {
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.lg,
    borderRadius: theme.borderRadius.medium,
    alignItems: 'center',
    justifyContent: 'center',
    height: 56,
  },
};

const variantStyles: Record<ButtonVariant, ViewStyle> = {
  primary: {
    backgroundColor: theme.colors.primary,
    borderWidth: 0,
  },
  secondary: {
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  ghost: {
    backgroundColor: 'transparent',
    borderWidth: 0,
  },
  danger: {
    backgroundColor: theme.colors.errorBg,
    borderWidth: 1,
    borderColor: theme.colors.error,
  },
};

const textVariantStyles: Record<ButtonVariant, TextStyle> = {
  primary: {
    color: theme.colors.textOnPrimary,
  },
  secondary: {
    color: theme.colors.textPrimary,
  },
  ghost: {
    color: theme.colors.primary,
  },
  danger: {
    color: theme.colors.error,
  },
};

export const Button: React.FC<ButtonProps> = ({
  label,
  onPress,
  variant = 'primary',
  size = 'large',
  disabled = false,
  loading = false,
  style,
  icon,
}) => {
  const isDisabled = disabled || loading;

  const getContainerStyle = (): StyleProp<ViewStyle> => {
    return [containerStyles[size], variantStyles[variant], isDisabled && styles.disabled, style];
  };

  const getTextStyle = (): StyleProp<TextStyle> => {
    return [styles.text, textVariantStyles[variant]];
  };

  return (
    <TouchableOpacity
      style={getContainerStyle()}
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variant === 'primary' ? theme.colors.textOnPrimary : theme.colors.primary}
        />
      ) : (
        <View style={styles.content}>
          {icon &&
            (typeof icon === 'string' ? (
              <Text style={styles.icon}>{icon}</Text>
            ) : (
              <View style={styles.iconWrapper}>{icon}</View>
            ))}
          <Text style={getTextStyle()}>{label}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles: {
  disabled: ViewStyle;
  content: ViewStyle;
  iconWrapper: ViewStyle;
  text: TextStyle;
  icon: TextStyle;
} = {
  disabled: {
    opacity: 0.6,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrapper: {
    marginRight: theme.spacing.sm,
  },
  text: {
    ...(theme.textStyles.button as TextStyle),
  },
  icon: {
    marginRight: theme.spacing.sm,
    fontSize: 18,
  },
};