import React from 'react';
import { ActivityIndicator, Pressable, Text, TextStyle, TouchableOpacity, View, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Place } from '../../../domain/places/Place';
import { theme } from '../../styles/theme';

interface PlaceCardProps {
  place: Place;
  onSelect: () => void;
  onEdit: () => void;
  selecting?: boolean;
  disabled?: boolean;
}

export const PlaceCard: React.FC<PlaceCardProps> = ({ place, onSelect, onEdit, selecting, disabled }) => {
  const selected = place.isDefault;
  const location =
    place.cityName === place.subdivisionName ? place.cityName : `${place.cityName}, ${place.subdivisionName}`;

  return (
    <View style={[cardStyle, selected && selectedCardStyle]}>
      <Pressable
        onPress={onSelect}
        disabled={disabled || selected}
        style={({ pressed }) => [selectAreaStyle, pressed && { opacity: 0.7 }]}
        accessibilityRole="radio"
        accessibilityState={{ checked: selected, disabled }}
        accessibilityLabel={`${place.name}, ${location}`}
        accessibilityHint={selected ? undefined : 'Toca para seleccionar este lugar'}
      >
        <View style={[iconCircleStyle, selected && { backgroundColor: theme.colors.primary }]}>
          <Ionicons
            name={place.type === 'COMMERCIAL' ? 'storefront-outline' : 'home-outline'}
            size={22}
            color={selected ? theme.colors.textOnPrimary : theme.colors.primary}
          />
        </View>

        <View style={bodyStyle}>
          <Text style={nameStyle} numberOfLines={1}>
            {place.name}
          </Text>
          <Text style={metaStyle} numberOfLines={1}>
            {location}
          </Text>
          {selected && (
            <View style={badgeStyle}>
              <Ionicons name="checkmark-circle" size={14} color={theme.colors.success} />
              <Text style={badgeTextStyle}>Seleccionado</Text>
            </View>
          )}
        </View>
      </Pressable>

      {selecting ? (
        <ActivityIndicator color={theme.colors.primary} style={editButtonStyle} />
      ) : (
        <TouchableOpacity
          onPress={onEdit}
          style={editButtonStyle}
          accessibilityRole="button"
          accessibilityLabel={`Editar ${place.name}`}
          hitSlop={8}
        >
          <Ionicons name="create-outline" size={22} color={theme.colors.textSecondary} />
        </TouchableOpacity>
      )}
    </View>
  );
};

const cardStyle: ViewStyle = {
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
};

const selectedCardStyle: ViewStyle = { borderColor: theme.colors.primary, borderWidth: 2, paddingRight: theme.spacing.lg - 1 };

const selectAreaStyle: ViewStyle = {
  flex: 1,
  flexDirection: 'row',
  alignItems: 'center',
  gap: theme.spacing.md,
  padding: theme.spacing.lg,
};

const iconCircleStyle: ViewStyle = {
  width: 44,
  height: 44,
  borderRadius: 22,
  backgroundColor: theme.colors.infoBg,
  alignItems: 'center',
  justifyContent: 'center',
};

const bodyStyle: ViewStyle = { flex: 1, gap: 2 };

const nameStyle: TextStyle = { ...theme.textStyles.button, fontSize: 17, lineHeight: 22, color: theme.colors.textPrimary };

const metaStyle: TextStyle = { ...theme.textStyles.caption, color: theme.colors.textMuted };

const badgeStyle: ViewStyle = { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 };

const badgeTextStyle: TextStyle = { ...theme.textStyles.label, color: theme.colors.success };

const editButtonStyle: ViewStyle = {
  width: 40,
  height: 40,
  borderRadius: 20,
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: theme.colors.grayLight,
};
