import React from 'react';
import { Pressable, Text, TextStyle, View, ViewStyle } from 'react-native';
import { theme } from '../../styles/theme';
import { themed } from '../../styles/themeRuntime';

interface FilterChipsProps<T extends string> {
  options: { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
  accessibilityLabel: string;
}

/** A row of rounded options where exactly one is selected (the filters of the admin lists). Wraps on a narrow screen. */
export function FilterChips<T extends string>({ options, value, onChange, accessibilityLabel }: FilterChipsProps<T>) {
  return (
    <View style={rowStyle} accessibilityRole="radiogroup" accessibilityLabel={accessibilityLabel}>
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <Pressable
            key={option.value}
            onPress={() => onChange(option.value)}
            style={[chipStyle, selected && chipSelectedStyle]}
            accessibilityRole="radio"
            accessibilityState={{ checked: selected }}
            accessibilityLabel={option.label}
          >
            <Text style={[chipTextStyle, selected && chipTextSelectedStyle]}>{option.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const rowStyle: ViewStyle = { flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.sm };
const chipStyle: ViewStyle = themed(() => ({
  minHeight: 36,
  paddingHorizontal: theme.spacing.md,
  justifyContent: 'center',
  borderRadius: theme.borderRadius.full,
  borderWidth: 1,
  borderColor: theme.colors.border,
  backgroundColor: theme.colors.surface,
}));
const chipSelectedStyle: ViewStyle = themed(() => ({ backgroundColor: theme.colors.primary, borderColor: theme.colors.primary }));
const chipTextStyle: TextStyle = themed(() => ({ ...theme.textStyles.caption, fontWeight: '600', color: theme.colors.textSecondary }));
const chipTextSelectedStyle: TextStyle = themed(() => ({ color: theme.colors.textOnPrimary, fontWeight: '800' }));
