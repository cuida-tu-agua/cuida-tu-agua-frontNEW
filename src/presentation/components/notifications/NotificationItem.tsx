import React from 'react';
import { Text, TextStyle, TouchableOpacity, View, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppNotification, NotificationSeverity, NotificationType, timeAgo } from '../../../domain/notifications/Notification';
import { theme } from '../../styles/theme';
import { themed } from '../../styles/themeRuntime';

const TYPE_ICONS: Record<NotificationType, keyof typeof Ionicons.glyphMap> = {
  DEVICE_LINKED: 'link-outline',
  DEVICE_UNLINKED: 'unlink-outline',
  VALVE_CHANGED: 'water-outline',
  DEVICE_OFFLINE: 'cloud-offline-outline',
  SYSTEM_ANNOUNCEMENT: 'megaphone-outline',
};

const SEVERITY_COLORS: Record<NotificationSeverity, { fg: string; bg: string; label: string }> = themed(() => ({
  CRITICAL: { fg: theme.colors.error, bg: theme.colors.errorBg, label: 'Crítica' },
  WARNING: { fg: theme.colors.warning, bg: theme.colors.warningBg, label: 'Importante' },
  INFO: { fg: theme.colors.info, bg: theme.colors.infoBg, label: 'Informativa' },
}));

interface NotificationItemProps {
  item: AppNotification;
  onPress: () => void;
  now?: Date;
}

/** One line of the inbox. Unread ones are bold with a dot; the colour tells how urgent it is. */
export const NotificationItem: React.FC<NotificationItemProps> = ({ item, onPress, now }) => {
  const tone = SEVERITY_COLORS[item.severity];
  const when = timeAgo(item.createdAt, now);

  return (
    <TouchableOpacity
      onPress={onPress}
      style={[rowStyle, !item.isRead && unreadRowStyle]}
      accessibilityRole="button"
      accessibilityLabel={`${item.isRead ? '' : 'Sin leer. '}${tone.label}. ${item.title}. ${when}`}
    >
      <View style={[iconStyle, { backgroundColor: tone.bg }]}>
        <Ionicons name={TYPE_ICONS[item.type] ?? 'notifications-outline'} size={22} color={tone.fg} />
      </View>
      <View style={bodyStyle}>
        <View style={titleRowStyle}>
          <Text style={[titleStyle, !item.isRead && titleUnreadStyle]} numberOfLines={2}>
            {item.title}
          </Text>
          {!item.isRead && <View style={dotStyle} />}
        </View>
        {!!item.body && (
          <Text style={textStyle} numberOfLines={3}>
            {item.body}
          </Text>
        )}
        <View style={metaStyle}>
          <Text style={[severityStyle, { color: tone.fg }]}>{tone.label}</Text>
          <Text style={whenStyle}>{when}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const rowStyle: ViewStyle = themed(() => ({
  flexDirection: 'row',
  gap: theme.spacing.md,
  padding: theme.spacing.lg,
  marginBottom: theme.spacing.sm,
  borderRadius: theme.borderRadius.medium,
  backgroundColor: theme.colors.surface,
  borderWidth: 1,
  borderColor: theme.colors.border,
}));
const unreadRowStyle: ViewStyle = themed(() => ({ borderColor: theme.colors.secondary, backgroundColor: theme.colors.surfaceAlt }));
const iconStyle: ViewStyle = { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' };
const bodyStyle: ViewStyle = { flex: 1, gap: 2 };
const titleRowStyle: ViewStyle = { flexDirection: 'row', alignItems: 'flex-start', gap: theme.spacing.sm };
const titleStyle: TextStyle = themed(() => ({ ...theme.textStyles.caption, flex: 1, fontSize: 15, fontWeight: '600', color: theme.colors.textPrimary }));
const titleUnreadStyle: TextStyle = { fontWeight: '800' };
const dotStyle: ViewStyle = themed(() => ({ width: 10, height: 10, borderRadius: 5, marginTop: 5, backgroundColor: theme.colors.primary }));
const textStyle: TextStyle = themed(() => ({ ...theme.textStyles.caption, color: theme.colors.textSecondary }));
const metaStyle: ViewStyle = { flexDirection: 'row', justifyContent: 'space-between', marginTop: theme.spacing.xs };
const severityStyle: TextStyle = { ...theme.textStyles.label, fontWeight: '800', textTransform: 'uppercase' };
const whenStyle: TextStyle = themed(() => ({ ...theme.textStyles.label, color: theme.colors.textMuted }));
