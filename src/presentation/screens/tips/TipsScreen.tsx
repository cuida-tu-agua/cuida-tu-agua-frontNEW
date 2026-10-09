import React from 'react';
import { ActivityIndicator, RefreshControl, ScrollView, Text, TextStyle, View, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { CATEGORY_LABELS } from '../../../domain/tips/Tip';
import { Banner } from '../../components/common/Banner';
import { Button } from '../../components/common/Button';
import { SegmentedControl } from '../../components/common/SegmentedControl';
import { TipCard } from '../../components/tips/TipCard';
import { TipsView, useTips } from '../../hooks/useTips';
import { useLayout } from '../../layout/breakpoints';
import { MainStackParamList } from '../../navigation/types';
import { theme } from '../../styles/theme';
import { themed } from '../../styles/themeRuntime';

type Props = NativeStackScreenProps<MainStackParamList, 'Tips'>;

const VIEW_OPTIONS: { value: TipsView; label: string }[] = [
  { value: 'forYou', label: 'Para ti' },
  { value: 'favorites', label: 'Mis favoritos' },
];

/**
 * HU-065: general water saving tips for a home or a business (not personalised), at least 3 different ones, and the ones the
 * user marked as favorite.
 */
export const TipsScreen: React.FC<Props> = ({ route }) => {
  const tips = useTips(route.params?.placeId);
  const { columns } = useLayout();

  if (tips.loading && !tips.session) {
    return (
      <View style={centerStyle}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={mutedStyle}>Buscando consejos para ti...</Text>
      </View>
    );
  }

  if (!tips.session) {
    return (
      <View style={centerStyle}>
        <Banner tone="error" message={tips.error?.message ?? 'No pudimos cargar los consejos.'} />
        <Button label="Reintentar" onPress={() => void tips.reload()} />
      </View>
    );
  }

  const columnCount = Math.min(columns, 2);

  return (
    <ScrollView
      style={screenStyle}
      contentContainerStyle={contentStyle}
      refreshControl={<RefreshControl refreshing={tips.loading} onRefresh={() => void tips.reload()} tintColor={theme.colors.primary} />}
    >
      <Text style={titleStyle}>Consejos para ahorrar agua</Text>
      <Text style={mutedStyle}>
        Buenas prácticas para {CATEGORY_LABELS[tips.session.category] === 'Comercial' ? 'tu negocio' : 'tu hogar'}. Marca con la estrella los que quieras tener a la mano.
      </Text>

      <SegmentedControl options={VIEW_OPTIONS} value={tips.view} onChange={tips.setView} />

      {!!tips.error && <Banner tone="warning" message={tips.error.message} onClose={tips.dismissError} />}

      {tips.tips.length === 0 ? (
        <View style={emptyStyle}>
          <Ionicons name={tips.view === 'favorites' ? 'star-outline' : 'bulb-outline'} size={44} color={theme.colors.textMuted} />
          <Text style={emptyTitleStyle}>
            {tips.view === 'favorites' ? 'Todavía no tienes favoritos' : 'Por ahora no hay consejos'}
          </Text>
          <Text style={mutedStyle}>
            {tips.view === 'favorites'
              ? 'Toca la estrella de un consejo y lo encontrarás aquí.'
              : 'Vuelve más tarde: estamos preparando nuevos consejos.'}
          </Text>
        </View>
      ) : (
        <View style={gridStyle}>
          {tips.tips.map((tip) => (
            <View key={tip.id} style={{ flexBasis: columnCount > 1 ? '48%' : '100%', flexGrow: 1 }}>
              <TipCard tip={tip} busy={tips.busyId === tip.id} onToggleFavorite={() => void tips.toggleFavorite(tip)} />
            </View>
          ))}
        </View>
      )}

      {tips.view === 'forYou' && tips.session.total > tips.tips.length && (
        <Text style={mutedStyle}>
          Hoy te mostramos {tips.tips.length} de {tips.session.total} consejos. Mañana verás otros.
        </Text>
      )}
    </ScrollView>
  );
};

const screenStyle: ViewStyle = themed(() => ({ flex: 1, backgroundColor: theme.colors.background }));
const contentStyle: ViewStyle = { padding: theme.spacing.lg, paddingBottom: theme.spacing.huge, gap: theme.spacing.md };
const centerStyle: ViewStyle = themed(() => ({ flex: 1, alignItems: 'center', justifyContent: 'center', gap: theme.spacing.md, padding: theme.spacing.xl, backgroundColor: theme.colors.background }));
const titleStyle: TextStyle = themed(() => ({ ...theme.textStyles.h2, color: theme.colors.textPrimary }));
const mutedStyle: TextStyle = themed(() => ({ ...theme.textStyles.caption, color: theme.colors.textMuted }));
const gridStyle: ViewStyle = { flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.lg };
const emptyStyle: ViewStyle = { alignItems: 'center', gap: theme.spacing.md, paddingVertical: theme.spacing.huge };
const emptyTitleStyle: TextStyle = themed(() => ({ ...theme.textStyles.h3, color: theme.colors.textPrimary, textAlign: 'center' }));
