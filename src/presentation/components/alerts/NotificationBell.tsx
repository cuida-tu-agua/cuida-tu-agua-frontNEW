import React from 'react';
import { Text, TextStyle, TouchableOpacity, View, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { formatBadgeCount } from '../../../domain/alerts/alertRules';
import { theme } from '../../styles/theme';

interface NotificationBellProps {
  unreadCount: number;
  onPress: () => void;
}

/** HU-025: bell icon with the counter of unread alerts. */
export const NotificationBell: React.FC<NotificationBellProps> = ({ unreadCount, onPress }) => {
  const badge = formatBadgeCount(unreadCount);

  return (
    <TouchableOpacity
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={unreadCount > 0 ? `Notificaciones, ${unreadCount} sin leer` : 'Notificaciones'}
      hitSlop={8}
      style={buttonStyle}
    >
      <Ionicons name="notifications-outline" size={26} color={theme.colors.textPrimary} />
      {!!badge && (
        <View style={badgeStyle}>
          <Text style={badgeTextStyle}>{badge}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const buttonStyle: ViewStyle = { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' };

const badgeStyle: ViewStyle = {
  position: 'absolute',
  top: 2,
  right: 0,
  minWidth: 18,
  height: 18,
  paddingHorizontal: 4,
  borderRadius: 9,
  backgroundColor: theme.colors.error,
  alignItems: 'center',
  justifyContent: 'center',
};

const badgeTextStyle: TextStyle = { ...theme.textStyles.caption, color: theme.colors.textOnPrimary, fontSize: 11, fontWeight: '800' };
