import React from 'react';
import { ActivityIndicator, Text, TextStyle, TouchableOpacity, View, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTips } from '../../hooks/useTips';
import { theme } from '../../styles/theme';
import { themed } from '../../styles/themeRuntime';
import { Card } from '../common/Card';

const MAX_TIPS = 3;

interface TipsPanelProps {
  placeId?: string;
  onOpenFavorites: () => void;
}

/** Figma "Consejos para ahorrar": three tips of the session next to the valve, with the heart to keep them (HU-065). */
export const TipsPanel: React.FC<TipsPanelProps> = ({ placeId, onOpenFavorites }) => {
  const tips = useTips(placeId);
  const shown = (tips.session?.tips ?? []).slice(0, MAX_TIPS);

  return (
    <Card variant="outlined" style={cardStyle}>
      <View style={headerStyle}>
        <Text style={titleStyle} accessibilityRole="header">
          Consejos para ahorrar
        </Text>
        <TouchableOpacity onPress={onOpenFavorites} accessibilityRole="link" hitSlop={8}>
          <Text style={linkStyle}>Mis favoritos</Text>
        </TouchableOpacity>
      </View>

      {tips.loading && !tips.session ? (
        <ActivityIndicator color={theme.colors.primary} />
      ) : !tips.session ? (
        <Text style={mutedStyle}>No pudimos cargar los consejos.</Text>
      ) : shown.length === 0 ? (
        <Text style={mutedStyle}>Por ahora no hay consejos. Vuelve más tarde.</Text>
      ) : (
        shown.map((tip) => (
          <View key={tip.id} style={rowStyle}>
            <Ionicons name="bulb-outline" size={22} color={theme.colors.primary} style={{ marginTop: 2 }} />
            <View style={{ flex: 1, gap: 2 }}>
              <Text style={tipTitleStyle}>{tip.title}</Text>
              <Text style={tipBodyStyle}>{tip.body}</Text>
            </View>
            <TouchableOpacity
              onPress={() => void tips.toggleFavorite(tip)}
              disabled={tips.busyId === tip.id}
              hitSlop={8}
              style={heartStyle}
              accessibilityRole="button"
              accessibilityLabel={tip.isFavorite ? 'Quitar de favoritos' : 'Marcar como favorito'}
              accessibilityState={{ selected: tip.isFavorite }}
            >
              <Ionicons
                name={tip.isFavorite ? 'heart' : 'heart-outline'}
                size={24}
                color={tip.isFavorite ? theme.colors.error : theme.colors.textMuted}
              />
            </TouchableOpacity>
          </View>
        ))
      )}
    </Card>
  );
};

const cardStyle: ViewStyle = { gap: theme.spacing.md };
const headerStyle: ViewStyle = { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: theme.spacing.md };
const titleStyle: TextStyle = themed(() => ({ ...theme.textStyles.h3, fontSize: 19, fontWeight: '800', color: theme.colors.textPrimary }));
const linkStyle: TextStyle = themed(() => ({ ...theme.textStyles.caption, fontWeight: '800', color: theme.colors.primary }));
const rowStyle: ViewStyle = { flexDirection: 'row', alignItems: 'flex-start', gap: theme.spacing.md };
const tipTitleStyle: TextStyle = themed(() => ({ ...theme.textStyles.caption, fontSize: 15, fontWeight: '800', color: theme.colors.textPrimary }));
const tipBodyStyle: TextStyle = themed(() => ({ ...theme.textStyles.caption, color: theme.colors.textSecondary }));
const heartStyle: ViewStyle = { width: 32, height: 32, alignItems: 'center', justifyContent: 'center' };
const mutedStyle: TextStyle = themed(() => ({ ...theme.textStyles.caption, color: theme.colors.textMuted }));
