import React from 'react';
import { Platform, Pressable, Text, TextStyle, TouchableOpacity, View, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Place } from '../../../domain/places/Place';
import { Button } from '../common/Button';
import { theme } from '../../styles/theme';
import { themed } from '../../styles/themeRuntime';

interface PlaceCardProps {
  place: Place;
  onEdit: () => void;
  /** Opens the panel of the place. Tapping the card does the same. */
  onOpenPanel?: () => void;
  /** 'row' = the phone list (icons on the right); 'card' = the web card with its buttons. Default: by platform. */
  variant?: 'row' | 'card';
}

export const PlaceCard: React.FC<PlaceCardProps> = (props) => {
  const { variant = Platform.OS === 'web' ? 'card' : 'row' } = props;
  return variant === 'card' ? <WebCard {...props} /> : <RowCard {...props} />;
};

const locationOf = (place: Place): string =>
  place.cityName === place.subdivisionName ? place.cityName : `${place.cityName}, ${place.subdivisionName}`;

/** Web (Figma "Mis lugares"): icon, name, place, type and the buttons. Tapping the card opens its panel. */
const WebCard: React.FC<PlaceCardProps> = ({ place, onEdit, onOpenPanel }) => {
  const location = locationOf(place);
  const typeLabel = place.type === 'COMMERCIAL' ? 'Comercial' : 'Residencial';

  return (
    <Pressable
      onPress={onOpenPanel}
      disabled={!onOpenPanel}
      style={({ pressed }) => [webCardStyle, pressed && !!onOpenPanel && { opacity: 0.92 }]}
      accessibilityRole="button"
      accessibilityLabel={`Abrir el panel de ${place.name}`}
    >
      <View style={iconCircleStyle}>
        <Ionicons name={place.type === 'COMMERCIAL' ? 'storefront-outline' : 'home-outline'} size={22} color={theme.colors.primary} />
      </View>

      <View style={{ gap: 2 }}>
        <Text style={webNameStyle} numberOfLines={1}>
          {place.name}
        </Text>
        <Text style={webLocationStyle} numberOfLines={1}>
          {location}
        </Text>
        <Text style={webTypeStyle}>{typeLabel}</Text>
      </View>

      <View style={webButtonsStyle}>
        {!!onOpenPanel && (
          <Button
            label="Ver panel"
            size="small"
            onPress={onOpenPanel}
            style={{ flex: 1 }}
            icon={<Ionicons name="stats-chart" size={16} color={theme.colors.textOnPrimary} />}
          />
        )}
        <Button
          label="Editar"
          size="small"
          variant="secondary"
          onPress={onEdit}
          icon={<Ionicons name="create-outline" size={16} color={theme.colors.primary} />}
        />
      </View>
    </Pressable>
  );
};

/** Phone (Figma mobile list): one row. Tapping it opens the panel; the edit button is on the right. */
const RowCard: React.FC<PlaceCardProps> = ({ place, onEdit, onOpenPanel }) => {
  const location = locationOf(place);

  return (
    <View style={cardStyle}>
      <Pressable
        onPress={onOpenPanel}
        disabled={!onOpenPanel}
        style={({ pressed }) => [selectAreaStyle, pressed && { opacity: 0.7 }]}
        accessibilityRole="button"
        accessibilityLabel={`Abrir el panel de ${place.name}, ${location}`}
      >
        <View style={iconCircleStyle}>
          <Ionicons name={place.type === 'COMMERCIAL' ? 'storefront-outline' : 'home-outline'} size={22} color={theme.colors.primary} />
        </View>

        <View style={bodyStyle}>
          <Text style={nameStyle} numberOfLines={1}>
            {place.name}
          </Text>
          <Text style={metaStyle} numberOfLines={1}>
            {location}
          </Text>
        </View>
      </Pressable>

      <TouchableOpacity
        onPress={onEdit}
        style={editButtonStyle}
        accessibilityRole="button"
        accessibilityLabel={`Editar ${place.name}`}
        hitSlop={8}
      >
        <Ionicons name="create-outline" size={22} color={theme.colors.textSecondary} />
      </TouchableOpacity>
    </View>
  );
};

const cardStyle: ViewStyle = themed(() => ({
  flexDirection: 'row',
  alignItems: 'center',
  gap: theme.spacing.sm,
  paddingRight: theme.spacing.lg,
  marginBottom: theme.spacing.md,
  borderRadius: theme.borderRadius.medium,
  borderWidth: 1,
  borderColor: theme.colors.border,
  backgroundColor: theme.colors.surface,
  ...theme.shadows.subtle,
}));

const selectAreaStyle: ViewStyle = {
  flex: 1,
  flexDirection: 'row',
  alignItems: 'center',
  gap: theme.spacing.md,
  padding: theme.spacing.lg,
};

const iconCircleStyle: ViewStyle = themed(() => ({
  width: 44,
  height: 44,
  borderRadius: 22,
  backgroundColor: theme.colors.infoBg,
  alignItems: 'center',
  justifyContent: 'center',
}));

const bodyStyle: ViewStyle = { flex: 1, gap: 2 };

const nameStyle: TextStyle = themed(() => ({ ...theme.textStyles.button, fontSize: 17, lineHeight: 22, color: theme.colors.textPrimary }));

const metaStyle: TextStyle = themed(() => ({ ...theme.textStyles.caption, color: theme.colors.textMuted }));

const editButtonStyle: ViewStyle = themed(() => ({
  width: 40,
  height: 40,
  borderRadius: 20,
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: theme.colors.grayLight,
}));

const webCardStyle: ViewStyle = themed(() => ({
  gap: theme.spacing.md,
  padding: theme.spacing.lg,
  marginBottom: theme.spacing.lg,
  borderRadius: theme.borderRadius.large,
  borderWidth: 1,
  borderColor: theme.colors.border,
  backgroundColor: theme.colors.surface,
  ...theme.shadows.subtle,
}));
const webNameStyle: TextStyle = themed(() => ({ ...theme.textStyles.h3, fontSize: 19, lineHeight: 24, fontWeight: '800', color: theme.colors.textPrimary }));
const webLocationStyle: TextStyle = themed(() => ({ ...theme.textStyles.caption, fontSize: 15, color: theme.colors.textSecondary }));
const webTypeStyle: TextStyle = themed(() => ({ ...theme.textStyles.caption, fontSize: 14, color: theme.colors.textMuted }));
const webButtonsStyle: ViewStyle = { flexDirection: 'row', gap: theme.spacing.sm, alignItems: 'center' };
