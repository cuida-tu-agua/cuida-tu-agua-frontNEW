import React from 'react';
import {
  View,
  Pressable,
  Text,
  ViewStyle,
  TextStyle,
  ActivityIndicator,
  StyleProp,
  Platform,
} from 'react-native';
import { theme } from '../../styles/theme';
import { themed } from '../../styles/themeRuntime';

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

/**
 * Manual visual, section 4.1: a touch target of at least 44 px, radius 8, a 140 ms transition and one clear look for each
 * state (normal, hover, pressed, disabled) plus a visible ring while it has the keyboard focus. The label is bold, in
 * capitals with a little tracking. Every color comes from the theme, so it works in the four of them.
 */
const containerStyles: Record<ButtonSize, ViewStyle> = {
  small: { paddingHorizontal: theme.spacing.md, minHeight: 44, borderRadius: theme.borderRadius.small },
  medium: { paddingHorizontal: theme.spacing.lg, minHeight: 48, borderRadius: theme.borderRadius.small },
  large: { paddingHorizontal: theme.spacing.xl, minHeight: 56, borderRadius: theme.borderRadius.small },
};

/** Web only: the change of color takes 140 ms instead of jumping. Native ignores it. */
const transition: ViewStyle =
  Platform.OS === 'web' ? ({ transitionDuration: '140ms', transitionProperty: 'background-color, border-color, box-shadow' } as unknown as ViewStyle) : {};

const ring = (color: string): ViewStyle => ({ boxShadow: `0 0 0 3px ${color}` }) as unknown as ViewStyle;

type Look = { container: ViewStyle; text: TextStyle };

/** One look per state of each variant. */
const looks: Record<ButtonVariant, Record<'normal' | 'hover' | 'pressed' | 'disabled', Look>> = themed(() => ({
  primary: {
    normal: { container: { backgroundColor: theme.colors.primary, borderWidth: 0 }, text: { color: theme.colors.textOnPrimary } },
    hover: { container: { backgroundColor: theme.colors.primaryHover, borderWidth: 0, ...ring(theme.colors.accent) }, text: { color: theme.colors.textOnPrimary } },
    pressed: { container: { backgroundColor: theme.colors.primaryActive, borderWidth: 0 }, text: { color: theme.colors.textOnPrimary } },
    disabled: { container: { backgroundColor: theme.colors.primaryDisabled, borderWidth: 0 }, text: { color: theme.colors.textOnPrimary } },
  },
  secondary: {
    normal: { container: { backgroundColor: theme.colors.surface, borderWidth: 1.5, borderColor: theme.colors.primary }, text: { color: theme.colors.primary } },
    hover: { container: { backgroundColor: theme.colors.surfaceAlt, borderWidth: 1.5, borderColor: theme.colors.textPrimary }, text: { color: theme.colors.textPrimary } },
    pressed: { container: { backgroundColor: theme.colors.accent, borderWidth: 1.5, borderColor: theme.colors.textPrimary }, text: { color: theme.colors.textOnPrimary === '#FFFFFF' ? theme.colors.textPrimary : theme.colors.background } },
    disabled: { container: { backgroundColor: theme.colors.grayLight, borderWidth: 1.5, borderColor: theme.colors.border }, text: { color: theme.colors.textMuted } },
  },
  ghost: {
    normal: { container: { backgroundColor: 'transparent', borderWidth: 0 }, text: { color: theme.colors.primary } },
    hover: { container: { backgroundColor: theme.colors.surfaceAlt, borderWidth: 0 }, text: { color: theme.colors.primaryHover } },
    pressed: { container: { backgroundColor: theme.colors.accent, borderWidth: 0 }, text: { color: theme.colors.primaryActive } },
    disabled: { container: { backgroundColor: 'transparent', borderWidth: 0 }, text: { color: theme.colors.textMuted } },
  },
  danger: {
    normal: { container: { backgroundColor: theme.colors.errorBg, borderWidth: 1.5, borderColor: theme.colors.error }, text: { color: theme.colors.textPrimary } },
    hover: { container: { backgroundColor: theme.colors.errorBg, borderWidth: 1.5, borderColor: theme.colors.error, ...ring(theme.colors.error) }, text: { color: theme.colors.textPrimary } },
    pressed: { container: { backgroundColor: theme.colors.error, borderWidth: 1.5, borderColor: theme.colors.error }, text: { color: '#FFFFFF' } },
    disabled: { container: { backgroundColor: theme.colors.grayLight, borderWidth: 1.5, borderColor: theme.colors.border }, text: { color: theme.colors.textMuted } },
  },
}));

const labelStyle: TextStyle = themed(() => ({
  ...(theme.textStyles.button as TextStyle),
  textTransform: 'uppercase',
  textAlign: 'center',
}));

const smallLabelStyle: TextStyle = { fontSize: 14, letterSpacing: 0.7 };

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

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      style={(state) => {
        const { pressed } = state;
        const { hovered, focused } = state as typeof state & { hovered?: boolean; focused?: boolean };
        const stateName = isDisabled && !loading ? 'disabled' : pressed ? 'pressed' : hovered ? 'hover' : 'normal';
        const look = looks[variant][stateName];
        return [
          containerStyles[size],
          styles.base,
          transition,
          look.container,
          focused && !isDisabled ? ring(theme.colors.primary) : null,
          style,
        ];
      }}
    >
      {({ pressed, ...state }) => {
        const hovered = (state as { hovered?: boolean }).hovered;
        const stateName = isDisabled && !loading ? 'disabled' : pressed ? 'pressed' : hovered ? 'hover' : 'normal';
        const color = looks[variant][stateName].text.color;
        return loading ? (
          <ActivityIndicator size="small" color={color} />
        ) : (
          <View style={styles.content}>
            {icon &&
              (typeof icon === 'string' ? (
                <Text style={styles.icon}>{icon}</Text>
              ) : (
                <View style={styles.iconWrapper}>{icon}</View>
              ))}
            <Text style={[labelStyle, size === 'small' && smallLabelStyle, { color }]}>{label}</Text>
          </View>
        );
      }}
    </Pressable>
  );
};

const styles: {
  base: ViewStyle;
  content: ViewStyle;
  iconWrapper: ViewStyle;
  icon: TextStyle;
} = {
  base: { alignItems: 'center', justifyContent: 'center', paddingVertical: theme.spacing.sm },
  content: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', flexShrink: 1 },
  iconWrapper: { marginRight: theme.spacing.sm },
  icon: { marginRight: theme.spacing.sm, fontSize: 18 },
};
