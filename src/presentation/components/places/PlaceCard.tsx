import React from 'react';
import { ActivityIndicator, Platform, Pressable, Text, TextStyle, TouchableOpacity, View, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Place } from '../../../domain/places/Place';
import { Button } from '../common/Button';
import { theme } from '../../styles/theme';
import { themed } from '../../styles/themeRuntime';

interface PlaceCardProps {
  place: Place;
  onSelect: () => void;
  onEdit: () => void;
  onOpenPanel?: () => void;
  selecting?: boolean;
  disabled?: boolean;
  /** 'row' = the phone list (icons on the right); 'card' = the web card with its buttons. Default: by platform. */
  variant?: 'row' | 'card';
}

export const PlaceCard: React.FC<PlaceCardProps> = (props) => {
  const { variant = Platform.OS === 'web' ? 'card' : 'row' } = props;
  return variant === 'card' ? <WebCard {...props} /> : <RowCard {...props} />;
};

const locationOf = (place: Place): string =>
  place.cityName === place.subdivisionName ? place.cityName : `${place.cityName}, ${place.subdivisionName}`;

/** Web (Figma "Mis lugares"): icon + selected mark on top, name, place, type and the two buttons under them. */
const WebCard: React.FC<PlaceCardProps> = ({ place, onSelect, onEdit, onOpenPanel, selecting, disabled }) => {
  const selected = place.isDefault;
  const location = locationOf(place);
  const typeLabel = place.type === 'COMMERCIAL' ? 'Comercial' : 'Residencial';

  return (
    <View style={[webCardStyle, selected && webCardSelectedStyle]}>
      <View style={webTopStyle}>
        <View style={[iconCircleStyle, selected && { backgroundColor: theme.colors.primary }]}>
          <Ionicons
            name={place.type === 'COMMERCIAL' ? 'storefront-outline' : 'home-outline'}
            size={22}
            color={selected ? theme.colors.textOnPrimary : theme.colors.primary}
          />
        </View>
        {selected ? (
          <View style={selectedPillStyle} accessibilityRole="text">
            <Ionicons name="checkmark-circle" size={16} color={theme.colors.success} />
            <Text style={selectedPillTextStyle}>Seleccionado</Text>
          </View>
        ) : selecting ? (
          <ActivityIndicator color={theme.colors.primary} />
        ) : (
          <Pressable
            onPress={onSelect}
            disabled={disabled}
            style={({ pressed }) => [selectLinkStyle, pressed && { opacity: 0.6 }]}
            accessibilityRole="radio"
            accessibilityState={{ checked: false, disabled }}
            accessibilityLabel={`Seleccionar ${place.name}`}
          >
            <Ionicons name="ellipse-outline" size={16} color={theme.colors.textSecondary} />
            <Text style={selectLinkTextStyle}>Seleccionar</Text>
          </Pressable>
        )}
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
    </View>
  );
};

/** Phone (Figma mobile list): one row, the panel and edit buttons as round icons on the right. */
const RowCard: React.FC<PlaceCardProps> = ({ place, onSelect, onEdit, onOpenPanel, selecting, disabled }) => {
  const selected = place.isDefault;
  const location = locationOf(place);

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

      {!!onOpenPanel && !selecting && (
        <TouchableOpacity
          onPress={onOpenPanel}
          style={[editButtonStyle, { backgroundColor: theme.colors.infoBg }]}
          accessibilityRole="button"
          accessibilityLabel={`Ver consumo y válvula de ${place.name}`}
          hitSlop={8}
        >
          <Ionicons name="stats-chart" size={20} color={theme.colors.primary} />
        </TouchableOpacity>
      )}

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

const selectedCardStyle: ViewStyle = themed(() => ({ borderColor: theme.colors.primary, borderWidth: 2, paddingRight: theme.spacing.lg - 1 }));

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

const badgeStyle: ViewStyle = { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 };

const badgeTextStyle: TextStyle = themed(() => ({ ...theme.textStyles.label, color: theme.colors.success }));

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
const webCardSelectedStyle: ViewStyle = themed(() => ({ borderColor: theme.colors.primary, borderWidth: 2, padding: theme.spacing.lg - 1 }));
const webTopStyle: ViewStyle = { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' };
const selectedPillStyle: ViewStyle = themed(() => ({
  flexDirection: 'row',
  alignItems: 'center',
  gap: 6,
  paddingHorizontal: theme.spacing.md,
  paddingVertical: 6,
  borderRadius: theme.borderRadius.full,
  backgroundColor: theme.colors.successBg,
}));
const selectedPillTextStyle: TextStyle = themed(() => ({ ...theme.textStyles.caption, fontWeight: '800', color: theme.colors.success }));
const selectLinkStyle: ViewStyle = { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: theme.spacing.md, minHeight: 32 };
const selectLinkTextStyle: TextStyle = themed(() => ({ ...theme.textStyles.caption, fontWeight: '800', color: theme.colors.textSecondary }));
const webNameStyle: TextStyle = themed(() => ({ ...theme.textStyles.h3, fontSize: 19, lineHeight: 24, fontWeight: '800', color: theme.colors.textPrimary }));
const webLocationStyle: TextStyle = themed(() => ({ ...theme.textStyles.caption, fontSize: 15, color: theme.colors.textSecondary }));
const webTypeStyle: TextStyle = themed(() => ({ ...theme.textStyles.caption, fontSize: 14, color: theme.colors.textMuted }));
const webButtonsStyle: ViewStyle = { flexDirection: 'row', gap: theme.spacing.sm, alignItems: 'center' };
