import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Modal,
  Platform,
  Pressable,
  Text,
  TextInput,
  TextStyle,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import i18n from '../../../i18n';
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

// Web: a dropdown under the field (not a full-screen sheet). The field is a text box: typing filters the list.
const webAnchorStyle: ViewStyle = { position: 'relative' };
const webInputStyle: TextStyle = themed(() => ({
  ...theme.textStyles.body,
  flex: 1,
  height: '100%',
  paddingVertical: 0,
  color: theme.colors.textPrimary,
  ...({ outlineStyle: 'none' } as unknown as TextStyle),
}));
const webListStyle: ViewStyle = themed(() => ({
  ...({ position: 'fixed' } as unknown as ViewStyle),
  zIndex: 9999,
  maxHeight: 280,
  borderRadius: theme.borderRadius.small,
  borderWidth: 1,
  borderColor: theme.colors.border,
  backgroundColor: theme.colors.surface,
  overflow: 'hidden',
  ...({ boxShadow: '0 8px 24px rgba(0,0,0,0.12)' } as unknown as ViewStyle),
}));

// Phone apps: the dropdown floats over the page; the rest of the screen is a clear backdrop that closes it.
const DROPDOWN_MAX = 280;
interface NativeAnchor {
  left: number;
  width: number;
  top?: number;
  bottom?: number;
  maxHeight: number;
}
const backdropStyle: ViewStyle = { position: 'absolute', top: 0, right: 0, bottom: 0, left: 0 };
const nativeListStyle: ViewStyle = themed(() => ({
  position: 'absolute',
  borderRadius: theme.borderRadius.small,
  borderWidth: 1,
  borderColor: theme.colors.border,
  backgroundColor: theme.colors.surface,
  overflow: 'hidden',
  elevation: 8,
  shadowColor: '#000',
  shadowOpacity: 0.12,
  shadowRadius: 12,
  shadowOffset: { width: 0, height: 8 },
}));
const nativeSearchStyle: TextStyle = themed(() => ({
  ...theme.textStyles.body,
  height: 48,
  paddingHorizontal: theme.spacing.lg,
  borderBottomWidth: 1,
  borderBottomColor: theme.colors.border,
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
  const { t } = useTranslation();
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

  // Web: the list is drawn in the body of the page, at the place of the field, so no field of the form can cover it
  const anchorRef = useRef<View>(null);
  const listRef = useRef<View>(null);
  const [anchor, setAnchor] = useState<{ top: number; left: number; width: number } | null>(null);
  // Phone apps: where the field is on the screen, and the height of the overlay the dropdown is drawn in
  const [nativeField, setNativeField] = useState<{ x: number; y: number; width: number; height: number } | null>(null);
  const [overlayHeight, setOverlayHeight] = useState<number | null>(null);
  // Where the field is on the screen now (the list follows it when the page scrolls)
  const measureAnchor = () =>
    anchorRef.current?.measureInWindow((x, y, width, height) => setAnchor({ top: y + height + 4, left: x, width }));
  const openList = () => {
    measureAnchor();
    setQuery('');
    setOpen(true);
  };

  // Web: a click outside the field and its list closes the list. The rest of the page stays usable (no backdrop).
  useEffect(() => {
    if (Platform.OS !== 'web' || !open || typeof document === 'undefined') return;
    const onPointerDown = (event: MouseEvent) => {
      const target = event.target as Node;
      const inside = [anchorRef.current, listRef.current].some((view) => {
        const node = view as unknown as Node | null;
        return !!node && node.contains(target);
      });
      if (!inside) close();
    };
    document.addEventListener('mousedown', onPointerDown);
    // The list is drawn at a fixed place: when the page moves or the window changes size, it moves with the field
    window.addEventListener('scroll', measureAnchor, true);
    window.addEventListener('resize', measureAnchor);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      window.removeEventListener('scroll', measureAnchor, true);
      window.removeEventListener('resize', measureAnchor);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  if (Platform.OS === 'web') {
    return (
      <View style={containerStyle}>
        <Text style={labelStyle}>{label}</Text>

        <View ref={anchorRef} style={webAnchorStyle}>
          <View
            style={[
              fieldStyle,
              !!error && { borderColor: theme.colors.error },
              isDisabled && { backgroundColor: theme.colors.grayLight },
            ]}
          >
            <TextInput
              style={[webInputStyle, isDisabled && { color: theme.colors.textMuted }]}
              value={open ? query : selected?.label ?? ''}
              placeholder={placeholder}
              placeholderTextColor={theme.colors.textMuted}
              editable={!isDisabled}
              autoCorrect={false}
              accessibilityLabel={`${label}: ${selected?.label ?? placeholder}`}
              onFocus={openList}
              onChangeText={(text) => {
                setQuery(text);
                setOpen(true);
              }}
              onSubmitEditing={() => {
                if (filtered[0]) pick(filtered[0].value);
              }}
            />
            {loading ? (
              <ActivityIndicator size="small" color={theme.colors.primary} />
            ) : (
              <Text style={chevronStyle}>▾</Text>
            )}
          </View>

          {open && !isDisabled && anchor && typeof document !== 'undefined' &&
            createPortal(
              <>
                <View ref={listRef} style={[webListStyle, { top: anchor.top, left: anchor.left, width: anchor.width }]}>
                  <FlatList
                    data={filtered}
                    keyExtractor={(item) => item.value}
                    keyboardShouldPersistTaps="handled"
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
                    ListEmptyComponent={<Text style={emptyTextStyle}>{t('commonUi.noResults')}</Text>}
                  />
                </View>
              </>,
              document.body,
            )}
        </View>

        {error && <Text style={errorTextStyle}>{error}</Text>}
      </View>
    );
  }

  // Phone apps: the same dropdown as the web, drawn under the field (or above it when the field is low on the screen).
  // The field is measured on the screen and the list is placed once the overlay knows its own height.
  const openNative = () => {
    setQuery('');
    anchorRef.current?.measureInWindow((x, y, width, height) => {
      setNativeField({ x, y, width, height });
      setOpen(true);
    });
  };
  const nativeAnchor = ((): NativeAnchor | null => {
    if (!nativeField) return null;
    const screenHeight = overlayHeight ?? Dimensions.get('window').height;
    const { x, y, width, height } = nativeField;
    const up = y + height / 2 > screenHeight / 2;
    return up
      ? { left: x, width, bottom: screenHeight - y + 4, maxHeight: Math.min(DROPDOWN_MAX, y - insets.top - 8) }
      : { left: x, width, top: y + height + 4, maxHeight: Math.min(DROPDOWN_MAX, screenHeight - (y + height) - insets.bottom - 8) };
  })();

  return (
    <View style={containerStyle}>
      <Text style={labelStyle}>{label}</Text>

      <View ref={anchorRef} collapsable={false}>
        <TouchableOpacity
          style={[
            fieldStyle,
            !!error && { borderColor: theme.colors.error },
            isDisabled && { backgroundColor: theme.colors.grayLight },
            open && { borderColor: theme.colors.primary },
          ]}
          onPress={openNative}
          disabled={isDisabled}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel={`${label}: ${selected?.label ?? placeholder}`}
          accessibilityState={{ disabled: isDisabled, expanded: open }}
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
            <Text style={chevronStyle}>{open ? '▴' : '▾'}</Text>
          )}
        </TouchableOpacity>
      </View>

      {error && <Text style={errorTextStyle}>{error}</Text>}

      <Modal visible={open && !!nativeAnchor} transparent statusBarTranslucent animationType="fade" onRequestClose={close}>
        {/* A tap outside the list closes it, like a click outside on the web */}
        <Pressable
          style={backdropStyle}
          onPress={close}
          onLayout={(event) => setOverlayHeight(event.nativeEvent.layout.height)}
          accessibilityLabel={i18n.t('commonUi.close')}
        />
        {nativeAnchor && (
          <View
            style={[
              nativeListStyle,
              {
                left: nativeAnchor.left,
                width: nativeAnchor.width,
                top: nativeAnchor.top,
                bottom: nativeAnchor.bottom,
                maxHeight: nativeAnchor.maxHeight,
              },
            ]}
          >
            {searchable && (
              <TextInput
                style={nativeSearchStyle}
                value={query}
                onChangeText={setQuery}
                placeholder={i18n.t('commonUi.search')}
                placeholderTextColor={theme.colors.textMuted}
                autoCorrect={false}
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
              ListEmptyComponent={<Text style={emptyTextStyle}>{i18n.t('commonUi.noResults')}</Text>}
            />
          </View>
        )}
      </Modal>
    </View>
  );
};