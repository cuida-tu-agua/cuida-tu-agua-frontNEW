import React from 'react';
import { Text, TextStyle, TouchableOpacity, View, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { badgeText } from '../../../domain/notifications/Notification';
import { useUnreadCount } from '../../hooks/useUnreadCount';
import { theme } from '../../styles/theme';

/** Red circle with the number; nothing at zero. Shared by the bell and the side menu. */
export const UnreadBadge: React.FC<{ count: number; style?: ViewStyle }> = ({ count, style }) => {
  const text = badgeText(count);
  if (!text) return null;
  return (
    <View style={[badgeStyle, style]} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      <Text style={badgeTextStyle}>{text}</Text>
    </View>
  );
};

/** HU-025: the bell next to the avatar. It shows how many notifications are unread and opens the inbox. */
export const NotificationBell: React.FC<{ onPress: () => void }> = ({ onPress }) => {
  const { count } = useUnreadCount();

  return (
    <TouchableOpacity
      onPress={onPress}
      style={bellStyle}
      accessibilityRole="button"
      accessibilityLabel={count > 0 ? `Notificaciones, ${count} sin leer` : 'Notificaciones'}
      hitSlop={8}
    >
      <Ionicons name={count > 0 ? 'notifications' : 'notifications-outline'} size={24} color={theme.colors.textPrimary} />
      <UnreadBadge count={count} style={bellBadgeStyle} />
    </TouchableOpacity>
  );
};

const bellStyle: ViewStyle = {
  width: 44,
  height: 44,
  borderRadius: 22,
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: theme.colors.surfaceAlt,
};

const badgeStyle: ViewStyle = {
  minWidth: 20,
  height: 20,
  paddingHorizontal: 5,
  borderRadius: 10,
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: theme.colors.error,
};

const bellBadgeStyle: ViewStyle = { position: 'absolute', top: -2, right: -2, borderWidth: 2, borderColor: theme.colors.surface };

const badgeTextStyle: TextStyle = { color: theme.colors.textOnPrimary, fontSize: 11, fontWeight: '800', lineHeight: 14 };
