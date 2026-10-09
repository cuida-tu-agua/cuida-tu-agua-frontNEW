import React from 'react';
import { Text, TextStyle, TouchableOpacity, View, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemeName, ThemeStyle, paletteFor } from '../../styles/palettes';
import { theme } from '../../styles/theme';
import { themed } from '../../styles/themeRuntime';
import { ModePreference, useAppTheme } from '../../theme/ThemeProvider';
import { SegmentedControl } from '../common/SegmentedControl';

const STYLE_OPTIONS: { value: ThemeStyle; label: string }[] = [
  { value: 'classic', label: 'Clásico' },
  { value: 'eco', label: 'Eco' },
];

const MODE_OPTIONS: { value: ModePreference; label: string }[] = [
  { value: 'light', label: 'Claro' },
  { value: 'dark', label: 'Oscuro' },
  { value: 'system', label: 'Automático' },
];

const TILES: { name: ThemeName; style: ThemeStyle; mode: 'light' | 'dark'; label: string }[] = [
  { name: 'classic-light', style: 'classic', mode: 'light', label: 'Clásico claro' },
  { name: 'classic-dark', style: 'classic', mode: 'dark', label: 'Clásico oscuro' },
  { name: 'eco-light', style: 'eco', mode: 'light', label: 'Eco claro' },
  { name: 'eco-dark', style: 'eco', mode: 'dark', label: 'Eco oscuro' },
];

/**
 * The four themes of the brand (classic and eco, each in light and dark). The choice is saved on the device and, in
 * "Automático", the mode follows the setting of the phone or the browser.
 */
export const AppearanceSection: React.FC = () => {
  const { preference, name, setStyle, setMode } = useAppTheme();

  const pick = (tile: (typeof TILES)[number]) => {
    setStyle(tile.style);
    setMode(tile.mode);
  };

  return (
    <View>
      <SegmentedControl label="Estilo" options={STYLE_OPTIONS} value={preference.style} onChange={setStyle} />
      <SegmentedControl label="Modo" options={MODE_OPTIONS} value={preference.mode} onChange={setMode} />
      {preference.mode === 'system' && (
        <Text style={hintStyle}>Automático usa el modo claro u oscuro de tu dispositivo.</Text>
      )}

      <View style={tilesStyle} accessibilityRole="radiogroup" accessibilityLabel="Los cuatro temas">
        {TILES.map((tile) => {
          const colors = paletteFor(tile.name);
          const selected = tile.name === name;
          return (
            <TouchableOpacity
              key={tile.name}
              onPress={() => pick(tile)}
              style={[tileStyle, { backgroundColor: colors.background, borderColor: selected ? colors.primary : colors.border }, selected && selectedTileStyle]}
              accessibilityRole="radio"
              accessibilityState={{ selected }}
              accessibilityLabel={tile.label}
            >
              <View style={swatchRowStyle}>
                {[colors.primary, colors.secondary, colors.accent].map((color) => (
                  <View key={color} style={[swatchStyle, { backgroundColor: color }]} />
                ))}
                {selected && <Ionicons name="checkmark-circle" size={20} color={colors.primary} style={{ marginLeft: 'auto' }} />}
              </View>
              <View style={[sampleStyle, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <Text style={[sampleTitleStyle, { color: colors.textPrimary }]}>Aa</Text>
                <Text style={[sampleTextStyle, { color: colors.textSecondary }]} numberOfLines={1}>
                  Consumo de hoy
                </Text>
              </View>
              <Text style={[tileLabelStyle, { color: colors.textPrimary }]}>{tile.label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const hintStyle: TextStyle = themed(() => ({ ...theme.textStyles.caption, color: theme.colors.textMuted, marginTop: -theme.spacing.sm, marginBottom: theme.spacing.md }));

const tilesStyle: ViewStyle = { flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.md };

const tileStyle: ViewStyle = {
  flexGrow: 1,
  flexBasis: 150,
  borderWidth: 2,
  borderRadius: theme.borderRadius.medium,
  padding: theme.spacing.md,
  gap: theme.spacing.sm,
};

const selectedTileStyle: ViewStyle = { borderWidth: 3 };

const swatchRowStyle: ViewStyle = { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.xs };

const swatchStyle: ViewStyle = { width: 18, height: 18, borderRadius: 9 };

const sampleStyle: ViewStyle = { borderWidth: 1, borderRadius: theme.borderRadius.small, padding: theme.spacing.sm };

const sampleTitleStyle: TextStyle = { fontSize: 22, fontWeight: '800' };

const sampleTextStyle: TextStyle = { fontSize: 13 };

const tileLabelStyle: TextStyle = { fontSize: 14, fontWeight: '800' };
