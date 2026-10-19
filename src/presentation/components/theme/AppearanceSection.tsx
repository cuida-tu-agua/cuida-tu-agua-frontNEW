import React from 'react';
import { Text, TextStyle, TouchableOpacity, View, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemeName, ThemeStyle, paletteFor } from '../../styles/palettes';
import { theme } from '../../styles/theme';
import { themed } from '../../styles/themeRuntime';
import { ModePreference, useAppTheme } from '../../theme/ThemeProvider';
import { SegmentedControl } from '../common/SegmentedControl';
import { useTranslation } from 'react-i18next';

const STYLES: ThemeStyle[] = ['classic', 'eco'];
const MODES: ModePreference[] = ['light', 'dark', 'system'];

const TILES: { name: ThemeName; style: ThemeStyle; mode: 'light' | 'dark' }[] = [
  { name: 'classic-light', style: 'classic', mode: 'light' },
  { name: 'classic-dark', style: 'classic', mode: 'dark' },
  { name: 'eco-light', style: 'eco', mode: 'light' },
  { name: 'eco-dark', style: 'eco', mode: 'dark' },
];

/**
 * The four themes of the brand (classic and eco, each in light and dark). The choice is saved on the device and, in
 * "Automático", the mode follows the setting of the phone or the browser.
 */
export const AppearanceSection: React.FC = () => {
  const { t } = useTranslation();
  const { preference, name, setStyle, setMode } = useAppTheme();
  const styleOptions = STYLES.map((value) => ({ value, label: t(`appearance.styles.${value}`) }));
  const modeOptions = MODES.map((value) => ({ value, label: t(`appearance.modes.${value}`) }));

  const pick = (tile: (typeof TILES)[number]) => {
    setStyle(tile.style);
    setMode(tile.mode);
  };

  return (
    <View>
      <SegmentedControl label={t('appearance.style')} options={styleOptions} value={preference.style} onChange={setStyle} />
      <SegmentedControl label={t('appearance.mode')} options={modeOptions} value={preference.mode} onChange={setMode} />
      {preference.mode === 'system' && (
        <Text style={hintStyle}>{t('appearance.systemHint')}</Text>
      )}

      <View style={tilesStyle} accessibilityRole="radiogroup" accessibilityLabel={t('appearance.themesGroup')}>
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
              accessibilityLabel={t(`appearance.themes.${tile.name}`)}
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
                  {t('appearance.sample')}
                </Text>
              </View>
              <Text style={[tileLabelStyle, { color: colors.textPrimary }]}>{t(`appearance.themes.${tile.name}`)}</Text>
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
