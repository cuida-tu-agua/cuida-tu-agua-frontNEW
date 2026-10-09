import React from 'react';
import { ActivityIndicator, Text, TextStyle, TouchableOpacity, View, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CATEGORY_LABELS, Tip } from '../../../domain/tips/Tip';
import { theme } from '../../styles/theme';
import { themed } from '../../styles/themeRuntime';
import { Card } from '../common/Card';

interface TipCardProps {
  tip: Tip;
  busy?: boolean;
  onToggleFavorite: () => void;
}

/** HU-065: one tip. The star marks it as favorite; the state is also said in words for screen readers (never only color). */
export const TipCard: React.FC<TipCardProps> = ({ tip, busy = false, onToggleFavorite }) => (
  <Card variant="outlined" style={cardStyle}>
    <View style={topRowStyle}>
      <View style={iconStyle}>
        <Ionicons name="bulb-outline" size={22} color={theme.colors.primary} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={categoryStyle}>{CATEGORY_LABELS[tip.category]}</Text>
        <Text style={titleStyle}>{tip.title}</Text>
      </View>
      <TouchableOpacity
        onPress={onToggleFavorite}
        disabled={busy}
        style={starStyle}
        hitSlop={8}
        accessibilityRole="button"
        accessibilityLabel={tip.isFavorite ? 'Quitar de favoritos' : 'Marcar como favorito'}
        accessibilityState={{ selected: tip.isFavorite, busy }}
      >
        {busy ? (
          <ActivityIndicator size="small" color={theme.colors.primary} />
        ) : (
          <Ionicons name={tip.isFavorite ? 'star' : 'star-outline'} size={24} color={tip.isFavorite ? theme.colors.warning : theme.colors.textMuted} />
        )}
      </TouchableOpacity>
    </View>
    <Text style={bodyStyle}>{tip.body}</Text>
  </Card>
);

const cardStyle: ViewStyle = { gap: theme.spacing.md };
const topRowStyle: ViewStyle = { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.md };
const iconStyle: ViewStyle = themed(() => ({
  width: 44,
  height: 44,
  borderRadius: 22,
  backgroundColor: theme.colors.infoBg,
  alignItems: 'center',
  justifyContent: 'center',
}));
const categoryStyle: TextStyle = themed(() => ({ ...theme.textStyles.label, color: theme.colors.textMuted, textTransform: 'uppercase' }));
const titleStyle: TextStyle = themed(() => ({ ...theme.textStyles.h3, color: theme.colors.textPrimary }));
const starStyle: ViewStyle = { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' };
const bodyStyle: TextStyle = themed(() => ({ ...theme.textStyles.body, color: theme.colors.textSecondary }));
