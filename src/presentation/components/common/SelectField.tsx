import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Modal,
  Text,
  TextInput,
  TextStyle,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { theme } from '../../styles/theme';
import { themed } from '../../styles/themeRuntime';

export interface SelectOption {
  value: string;
  label: string;
}

interface SelectFieldProps {
  label: string;
  placeholder: string;
  value: string | null;
  options: SelectOption[];
  onSelect: (value: string) => void;
  error?: string;
  disabled?: boolean;
  loading?: boolean;
  searchable?: boolean;
}

const normalize = (text: string) =>
  text.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

const containerStyle: ViewStyle = { marginBottom: theme.spacing.lg };

const labelStyle: TextStyle = themed(() => ({
  ...theme.textStyles.label,
  color: theme.colors.textPrimary,
  marginBottom: theme.spacing.sm,
}));

const fieldStyle: ViewStyle = themed(() => ({
  flexDirection: 'row',
  alignItems: 'center',
  height: 54, // same height as Input
  paddingHorizontal: theme.spacing.lg,
  borderRadius: theme.borderRadius.small,
  borderWidth: 1,
  borderColor: theme.colors.border,
  backgroundColor: theme.colors.surface,
}));

const valueTextStyle: TextStyle = themed(() => ({
  ...theme.textStyles.body,
  flex: 1,
  color: theme.colors.textPrimary,
}));

const chevronStyle: TextStyle = themed(() => ({
  fontSize: 16,
  color: theme.colors.textMuted,
  marginLeft: theme.spacing.sm,
}));

const errorTextStyle: TextStyle = themed(() => ({
  ...theme.textStyles.caption,
  color: theme.colors.error,
  marginTop: theme.spacing.sm,
}));

const sheetStyle: ViewStyle = themed(() => ({
  flex: 1,
  backgroundColor: theme.colors.background,
}));

const sheetHeaderStyle: ViewStyle = themed(() => ({
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
  paddingHorizontal: theme.spacing.lg,
  paddingVertical: theme.spacing.md,
  borderBottomWidth: 1,
  borderBottomColor: theme.colors.border,
  backgroundColor: theme.colors.surface,
}));

const sheetTitleStyle: TextStyle = themed(() => ({
  ...theme.textStyles.h2,
  fontSize: theme.typography.sizes.h3,
  color: theme.colors.textPrimary,
  flex: 1,
}));

const closeTextStyle: TextStyle = themed(() => ({
  ...theme.textStyles.button,
  color: theme.colors.primary,
}));

const searchStyle: TextStyle = themed(() => ({
  ...theme.textStyles.body,
  height: 48,
  margin: theme.spacing.lg,
  paddingHorizontal: theme.spacing.lg,
  borderRadius: theme.borderRadius.small,
  borderWidth: 1,
  borderColor: theme.colors.border,
  backgroundColor: theme.colors.surface,
  color: theme.colors.textPrimary,
}));

const optionStyle: ViewStyle = themed(() => ({
  minHeight: 52,
  justifyContent: 'center',
  paddingHorizontal: theme.spacing.lg,
  borderBottomWidth: 1,
  borderBottomColor: theme.colors.border,
  backgroundColor: theme.colors.surface,
}));

const optionTextStyle: TextStyle = themed(() => ({
  ...theme.textStyles.body,
  color: theme.colors.textPrimary,
}));

const emptyTextStyle: TextStyle = themed(() => ({
  ...theme.textStyles.caption,
  color: theme.colors.textMuted,
  textAlign: 'center',
  padding: theme.spacing.xl,
}));

export const SelectField: React.FC<SelectFieldProps> = ({
  label,
  placeholder,
  value,
  options,
  onSelect,
  error,
  disabled = false,
  loading = false,
  searchable = false,
}) => {
  const insets = useSafeAreaInsets();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');

  const selected = options.find((option) => option.value === value);

  const filtered = useMemo(() => {
    if (!query.trim()) return options;
    const q = normalize(query.trim());
    return options.filter((option) => normalize(option.label).includes(q));
  }, [options, query]);

  const close = () => {
    setOpen(false);
    setQuery('');
  };

  const pick = (optionValue: string) => {
    onSelect(optionValue);
    close();
  };

  const isDisabled = disabled || loading;

  return (
    <View style={containerStyle}>
      <Text style={labelStyle}>{label}</Text>

      <TouchableOpacity
        style={[
          fieldStyle,
          !!error && { borderColor: theme.colors.error },
          isDisabled && { backgroundColor: theme.colors.grayLight },
        ]}
        onPress={() => setOpen(true)}
        disabled={isDisabled}
        activeOpacity={0.7}
        accessibilityRole="button"
        accessibilityLabel={`${label}: ${selected?.label ?? placeholder}`}
        accessibilityState={{ disabled: isDisabled }}
      >
        <Text
          style={[valueTextStyle, !selected && { color: theme.colors.textMuted }]}
          numberOfLines={1}
        >
          {selected?.label ?? placeholder}
        </Text>
        {loading ? (
          <ActivityIndicator size="small" color={theme.colors.primary} />
        ) : (
          <Text style={chevronStyle}>▾</Text>
        )}
      </TouchableOpacity>

      {error && <Text style={errorTextStyle}>{error}</Text>}

      <Modal visible={open} animationType="slide" onRequestClose={close}>
        <View style={[sheetStyle, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
          <View style={sheetHeaderStyle}>
            <Text style={sheetTitleStyle} numberOfLines={1}>
              {label}
            </Text>
            <TouchableOpacity onPress={close} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
              <Text style={closeTextStyle}>Cerrar</Text>
            </TouchableOpacity>
          </View>

          {searchable && (
            <TextInput
              style={searchStyle}
              value={query}
              onChangeText={setQuery}
              placeholder="Buscar..."
              placeholderTextColor={theme.colors.textMuted}
              autoCorrect={false}
              autoFocus
            />
          )}

          <FlatList
            data={filtered}
            keyExtractor={(item) => item.value}
            keyboardShouldPersistTaps="handled"
            initialNumToRender={20}
            renderItem={({ item }) => {
              const isSelected = item.value === value;
              return (
                <TouchableOpacity
                  style={[optionStyle, isSelected && { backgroundColor: theme.colors.infoBg }]}
                  onPress={() => pick(item.value)}
                  accessibilityRole="button"
                  accessibilityState={{ selected: isSelected }}
                >
                  <Text style={[optionTextStyle, isSelected && { fontWeight: '600' }]}>
                    {isSelected ? `✓ ${item.label}` : item.label}
                  </Text>
                </TouchableOpacity>
              );
            }}
            ListEmptyComponent={<Text style={emptyTextStyle}>No hay resultados.</Text>}
          />
        </View>
      </Modal>
    </View>
  );
};