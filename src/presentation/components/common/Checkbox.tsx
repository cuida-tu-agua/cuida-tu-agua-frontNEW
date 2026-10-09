import React from 'react';
import { Pressable, Text, TextStyle, View, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../styles/theme';
import { themed } from '../../styles/themeRuntime';

interface CheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  children: React.ReactNode; // the label (can contain links)
  error?: string;
}

export const Checkbox: React.FC<CheckboxProps> = ({ checked, onChange, children, error }) => (
  <View style={wrapperStyle}>
    <Pressable
      style={rowStyle}
      onPress={() => onChange(!checked)}
      accessibilityRole="checkbox"
      accessibilityState={{ checked }}
      hitSlop={8}
    >
      <View
        style={[
          boxStyle,
          checked && { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary },
          !!error && !checked && { borderColor: theme.colors.error },
        ]}
      >
        {checked && <Ionicons name="checkmark" size={16} color={theme.colors.textOnPrimary} />}
      </View>
      <View style={labelStyle}>{children}</View>
    </Pressable>
    {!!error && <Text style={errorStyle}>{error}</Text>}
  </View>
);

const wrapperStyle: ViewStyle = { marginBottom: theme.spacing.xl };

const rowStyle: ViewStyle = { flexDirection: 'row', alignItems: 'flex-start', gap: theme.spacing.md };

const boxStyle: ViewStyle = themed(() => ({
  width: 24,
  height: 24,
  borderRadius: 6,
  borderWidth: 2,
  borderColor: theme.colors.grayMedium,
  alignItems: 'center',
  justifyContent: 'center',
  marginTop: 2,
}));

const labelStyle: ViewStyle = { flex: 1 };

const errorStyle: TextStyle = themed(() => ({
  ...theme.textStyles.caption,
  color: theme.colors.error,
  marginTop: theme.spacing.sm,
}));
