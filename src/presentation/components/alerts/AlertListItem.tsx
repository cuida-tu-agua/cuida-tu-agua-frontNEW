import React from 'react';
import { Text, TextStyle, TouchableOpacity, View, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Alert, AlertSeverity } from '../../../domain/alerts/Alert';
import { ALERT_TYPE_LABELS, isRead, SEVERITY_LABELS } from '../../../domain/alerts/alertRules';
import { leakDetails, leakSummaryText } from '../../../domain/alerts/leakDetails';
import { valveClosedOriginText } from '../../../domain/alerts/valveClosedOrigin';
import { theme } from '../../styles/theme';

interface AlertListItemProps {
  alert: Alert;
  /** Name of the place of the alert (the alert itself only has the placeId). */
  placeName: string;
  onMarkAsRead: () => void;
  onDelete: () => void;
  /** HU-029: direct access to the close-valve action. Only used by suspected-leak alerts. */
  onCloseValve?: () => void;
}

/** Colors and icon of each level: red = critical, amber = important, blue = information. */
const SEVERITY_LOOK: Record<AlertSeverity, { fg: string; bg: string; icon: keyof typeof Ionicons.glyphMap }> = {
  CRITICAL: { fg: theme.colors.error, bg: theme.colors.errorBg, icon: 'warning' },
  IMPORTANT: { fg: theme.colors.warning, bg: theme.colors.warningBg, icon: 'alert-circle' },
  INFORMATIVE: { fg: theme.colors.info, bg: theme.colors.infoBg, icon: 'information-circle' },
};

const formatDate = (iso: string) => new Date(iso).toLocaleString('es-CO', { dateStyle: 'medium', timeStyle: 'short' });

/** HU-025: one alert of the list, with its date, place and kind, and the actions to mark it as read or delete it. */
export const AlertListItem: React.FC<AlertListItemProps> = ({ alert, placeName, onMarkAsRead, onDelete, onCloseValve }) => {
  const look = SEVERITY_LOOK[alert.severity];
  const read = isRead(alert);
  const origin = valveClosedOriginText(alert);
  const leak = leakDetails(alert);
  const leakSummary = leak ? leakSummaryText(leak) : null;

  return (
    <View
      style={[rowStyle, !read && { borderColor: look.fg }]}
      accessible
      accessibilityLabel={`${read ? '' : 'Sin leer. '}${SEVERITY_LABELS[alert.severity]}. ${ALERT_TYPE_LABELS[alert.alertType]}`}
    >
      <View style={[iconStyle, { backgroundColor: look.bg }]}>
        <Ionicons name={look.icon} size={20} color={look.fg} />
      </View>

      <View style={{ flex: 1 }}>
        <View style={titleRowStyle}>
          <Text style={[titleStyle, !read && { fontWeight: '800' }]} numberOfLines={2}>
            {alert.title}
          </Text>
          {!read && <View style={[dotStyle, { backgroundColor: look.fg }]} />}
        </View>
        <Text style={messageStyle} numberOfLines={3}>
          {alert.message}
        </Text>
        {origin && <Text style={originStyle}>{origin}</Text>}
        {leakSummary && <Text style={originStyle}>{leakSummary}</Text>}
        {leak?.isNighttime && <Text style={nightStyle}>Consumo nocturno: más probable que sea una fuga</Text>}
        <Text style={metaStyle}>
          {ALERT_TYPE_LABELS[alert.alertType]} · {placeName} · {formatDate(alert.triggeredAt)}
        </Text>

        {leak && onCloseValve && (
          <TouchableOpacity
            onPress={onCloseValve}
            accessibilityRole="button"
            accessibilityLabel="Cerrar válvula"
            hitSlop={8}
            style={closeValveStyle}
          >
            <Ionicons name="lock-closed" size={16} color={theme.colors.textOnPrimary} />
            <Text style={closeValveTextStyle}>Cerrar válvula</Text>
          </TouchableOpacity>
        )}

        {!read && (
          <TouchableOpacity
            onPress={onMarkAsRead}
            accessibilityRole="button"
            accessibilityLabel="Marcar como leída"
            hitSlop={8}
            style={markReadStyle}
          >
            <Text style={markReadTextStyle}>Marcar como leída</Text>
          </TouchableOpacity>
        )}
      </View>

      <TouchableOpacity onPress={onDelete} accessibilityRole="button" accessibilityLabel="Eliminar alerta" hitSlop={8}>
        <Ionicons name="trash-outline" size={20} color={theme.colors.textMuted} />
      </TouchableOpacity>
    </View>
  );
};

const rowStyle: ViewStyle = {
  flexDirection: 'row',
  alignItems: 'flex-start',
  gap: theme.spacing.md,
  padding: theme.spacing.md,
  borderRadius: theme.borderRadius.medium,
  borderWidth: 1,
  borderColor: theme.colors.border,
  backgroundColor: theme.colors.surface,
};

const iconStyle: ViewStyle = { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' };
const titleRowStyle: ViewStyle = { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm };
const dotStyle: ViewStyle = { width: 8, height: 8, borderRadius: 4 };
const titleStyle: TextStyle = { ...theme.textStyles.button, color: theme.colors.textPrimary, flexShrink: 1 };
const messageStyle: TextStyle = { ...theme.textStyles.caption, color: theme.colors.textSecondary, marginTop: theme.spacing.xs };
const originStyle: TextStyle = { ...theme.textStyles.caption, color: theme.colors.error, fontWeight: '800', marginTop: theme.spacing.xs };
const nightStyle: TextStyle = { ...theme.textStyles.caption, color: theme.colors.warning, fontWeight: '800', marginTop: theme.spacing.xs };
const closeValveStyle: ViewStyle = {
  marginTop: theme.spacing.sm,
  alignSelf: 'flex-start',
  flexDirection: 'row',
  alignItems: 'center',
  gap: theme.spacing.xs,
  paddingVertical: theme.spacing.sm,
  paddingHorizontal: theme.spacing.md,
  borderRadius: theme.borderRadius.medium,
  backgroundColor: theme.colors.error,
};
const closeValveTextStyle: TextStyle = { ...theme.textStyles.caption, color: theme.colors.textOnPrimary, fontWeight: '800' };
const metaStyle: TextStyle = { ...theme.textStyles.caption, color: theme.colors.textMuted, marginTop: theme.spacing.xs };
const markReadStyle: ViewStyle = { marginTop: theme.spacing.sm, alignSelf: 'flex-start' };
const markReadTextStyle: TextStyle = { ...theme.textStyles.caption, color: theme.colors.primary, fontWeight: '800' };
