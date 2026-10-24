import React from 'react';
import { Text, TextStyle, View, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { SharedPlace } from '../../../domain/sharing/Sharing';
import { theme } from '../../styles/theme';
import { themed } from '../../styles/themeRuntime';
import { Button } from '../common/Button';
import { Card } from '../common/Card';
import { permissionSummary } from './sharingLabels';

interface SharedPlaceCardProps {
  shared: SharedPlace;
  onOpen: () => void;
  /** Left out where leaving is not offered (the Places list); the invitations screen passes it. */
  onLeave?: () => void;
}

/** HU-045: a place of someone else where the signed-in person collaborates, with what they may do there. */
export const SharedPlaceCard: React.FC<SharedPlaceCardProps> = ({ shared, onOpen, onLeave }) => {
  const { t } = useTranslation();
  const { place } = shared;
  const location = place.cityName === place.subdivisionName ? place.cityName : `${place.cityName}, ${place.subdivisionName}`;

  return (
    <Card variant="outlined" style={cardStyle}>
      <View style={headerStyle}>
        <View style={iconStyle}>
          <Ionicons name={place.type === 'COMMERCIAL' ? 'storefront-outline' : 'home-outline'} size={22} color={theme.colors.primary} />
        </View>
        <View style={{ flex: 1, gap: 2 }}>
          <Text style={nameStyle} numberOfLines={1}>
            {place.name}
          </Text>
          <Text style={mutedStyle} numberOfLines={1}>
            {location}
          </Text>
        </View>
        <View style={badgeStyle}>
          <Text style={badgeTextStyle}>{t('sharing.shared.badge')}</Text>
        </View>
      </View>
      <Text style={mutedStyle}>{permissionSummary(shared.permissions)}</Text>
      <View style={buttonsStyle}>
        <Button
          label={t('sharing.shared.open')}
          size="small"
          onPress={onOpen}
          icon={<Ionicons name="stats-chart" size={16} color={theme.colors.textOnPrimary} />}
        />
        {!!onLeave && <Button label={t('sharing.shared.leave')} size="small" variant="secondary" onPress={onLeave} />}
      </View>
    </Card>
  );
};

const cardStyle: ViewStyle = { gap: theme.spacing.sm };
const headerStyle: ViewStyle = { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.md };
const buttonsStyle: ViewStyle = { flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.sm };
const iconStyle: ViewStyle = themed(() => ({
  width: 40,
  height: 40,
  borderRadius: 20,
  backgroundColor: theme.colors.infoBg,
  alignItems: 'center',
  justifyContent: 'center',
}));
const nameStyle: TextStyle = themed(() => ({ ...theme.textStyles.body, color: theme.colors.textPrimary, fontWeight: '800' }));
const mutedStyle: TextStyle = themed(() => ({ ...theme.textStyles.caption, color: theme.colors.textMuted }));
const badgeStyle: ViewStyle = themed(() => ({
  paddingHorizontal: theme.spacing.sm,
  paddingVertical: 2,
  borderRadius: theme.borderRadius.small,
  backgroundColor: theme.colors.infoBg,
}));
const badgeTextStyle: TextStyle = themed(() => ({ ...theme.textStyles.caption, color: theme.colors.info, fontWeight: '800' }));
