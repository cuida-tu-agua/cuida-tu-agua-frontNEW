import React from 'react';
import { Text, TextStyle, TouchableOpacity, View, ViewStyle } from 'react-native';
import { theme } from '../../styles/theme';

export interface SegmentOption<T extends string> {
  value: T;
  label: string;
}

interface SegmentedControlProps<T extends string> {
  label?: string;
  options: SegmentOption<T>[];
  value: T | null;
  onChange: (value: T) => void;
  error?: string;
  disabled?: boolean;
}

const containerStyle: ViewStyle = {
  marginBottom: theme.spacing.lg,
};

const labelStyle: TextStyle = {
  ...theme.textStyles.label,
  color: theme.colors.textPrimary,
  marginBottom: theme.spacing.sm,
};

const rowStyle: ViewStyle = {
  flexDirection: 'row',
  gap: theme.spacing.sm,
};

const segmentBase: ViewStyle = {
  flex: 1,
  minHeight: 48, // accessibility: touch target >= 48px
  paddingHorizontal: theme.spacing.sm,
  borderRadius: theme.borderRadius.small,
  borderWidth: 1,
  borderColor: theme.colors.border,
  backgroundColor: theme.colors.surface,
  alignItems: 'center',
  justifyContent: 'center',
};

const segmentSelected: ViewStyle = {
  borderColor: theme.colors.primary,
  borderWidth: 2,
  backgroundColor: theme.colors.infoBg,
};

const segmentTextBase: TextStyle = {
  ...theme.textStyles.caption,
  color: theme.colors.textSecondary,
  textAlign: 'center',
};

const segmentTextSelected: TextStyle = {
  color: theme.colors.textPrimary,
  fontWeight: '600',
};

const errorTextStyle: TextStyle = {
  ...theme.textStyles.caption,
  color: theme.colors.error,
  marginTop: theme.spacing.sm,
};

/** Horizontal group of mutually exclusive options (e.g. Residencial / Comercial). */
export function SegmentedControl<T extends string>({
  label,
  options,
  value,
  onChange,
  error,
  disabled = false,
}: SegmentedControlProps<T>) {
  return (
    <View style={containerStyle}>
      {label && <Text style={labelStyle}>{label}</Text>}

      <View style={rowStyle} accessibilityRole="radiogroup" accessibilityLabel={label}>
        {options.map((option) => {
          const selected = option.value === value;
          return (
            <TouchableOpacity
              key={option.value}
              style={[
                segmentBase,
                selected && segmentSelected,
                !!error && !selected && { borderColor: theme.colors.error },
                disabled && { opacity: 0.6 },
              ]}
              onPress={() => onChange(option.value)}
              disabled={disabled}
              activeOpacity={0.7}
              accessibilityRole="radio"
              accessibilityState={{ selected, disabled }}
            >
              <Text style={[segmentTextBase, selected && segmentTextSelected]}>
                {selected ? `✓ ${option.label}` : option.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {error && <Text style={errorTextStyle}>{error}</Text>}
    </View>
  );
}