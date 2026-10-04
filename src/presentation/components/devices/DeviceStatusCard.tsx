import React from 'react';
import { Text, TextStyle, View, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Device, DeviceStatus } from '../../../domain/devices/Device';
import { DEVICE_STATUS_LABELS, formatLastReport } from '../../../domain/devices/deviceStatus';
import { theme } from '../../styles/theme';
import { Card } from '../common/Card';

interface DeviceStatusCardProps {
  device: Device;
  /** When the status was checked: "hace X min" is calculated against it. */
  now?: Date;
}

/** Colors of each status: green = OK, amber = check it, gray = still waiting. */
const STATUS_STYLE: Record<DeviceStatus, { fg: string; bg: string; icon: keyof typeof Ionicons.glyphMap }> = {
  CONNECTED: { fg: theme.colors.success, bg: theme.colors.successBg, icon: 'wifi' },
  DISCONNECTED: { fg: theme.colors.warning, bg: theme.colors.warningBg, icon: 'cloud-offline-outline' },
  NEVER_REPORTED: { fg: theme.colors.textMuted, bg: theme.colors.grayLight, icon: 'hourglass-outline' },
};

const formatDate = (iso: string) =>
  new Date(iso).toLocaleString('es-CO', { dateStyle: 'medium', timeStyle: 'short' });

/** HU-013: status of the meter linked to a place. */
export const DeviceStatusCard: React.FC<DeviceStatusCardProps> = ({ device, now }) => {
  const look = STATUS_STYLE[device.status];
  const label = DEVICE_STATUS_LABELS[device.status];

  return (
    <Card variant="outlined">
      <View style={headerStyle}>
        <View style={[iconCircleStyle, { backgroundColor: look.bg }]}>
          <Ionicons name="speedometer-outline" size={22} color={look.fg} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={captionStyle}>Medidor</Text>
          <Text style={serialStyle} numberOfLines={1}>
            {device.serialNumber}
          </Text>
        </View>
        <View
          style={[badgeStyle, { backgroundColor: look.bg }]}
          accessible
          accessibilityLabel={`Estado: ${label}`}
        >
          <Ionicons name={look.icon} size={14} color={look.fg} />
          <Text style={[badgeTextStyle, { color: look.fg }]}>{label}</Text>
        </View>
      </View>

      <Row label="Último reporte" value={formatLastReport(device.lastReportAt, now)} />
      <Row label="Vinculado desde" value={formatDate(device.linkedAt)} />
      <Row label="Se marca desconectado tras" value={`${device.inactivityThresholdMinutes} min sin reportar`} />
      {!!device.firmwareVersion && <Row label="Firmware" value={device.firmwareVersion} mono />}
    </Card>
  );
};

const Row: React.FC<{ label: string; value: string; mono?: boolean }> = ({ label, value, mono }) => (
  <View style={rowStyle}>
    <Text style={captionStyle}>{label}</Text>
    <Text style={mono ? monoValueStyle : valueStyle}>{value}</Text>
  </View>
);

const headerStyle: ViewStyle = {
  flexDirection: 'row',
  alignItems: 'center',
  gap: theme.spacing.md,
  marginBottom: theme.spacing.md,
};

const iconCircleStyle: ViewStyle = {
  width: 44,
  height: 44,
  borderRadius: 22,
  alignItems: 'center',
  justifyContent: 'center',
};

const serialStyle: TextStyle = {
  ...theme.textStyles.label, // serials are data: IBM Plex Mono
  fontSize: 14,
  color: theme.colors.textPrimary,
};

const badgeStyle: ViewStyle = {
  flexDirection: 'row',
  alignItems: 'center',
  gap: theme.spacing.xs,
  paddingHorizontal: theme.spacing.md,
  paddingVertical: theme.spacing.xs,
  borderRadius: theme.borderRadius.full,
};

const badgeTextStyle: TextStyle = { ...theme.textStyles.caption, fontWeight: '800' };

const rowStyle: ViewStyle = {
  flexDirection: 'row',
  justifyContent: 'space-between',
  gap: theme.spacing.md,
  paddingVertical: theme.spacing.sm,
  borderTopWidth: 1,
  borderTopColor: theme.colors.border,
};

const captionStyle: TextStyle = { ...theme.textStyles.caption, color: theme.colors.textMuted };

const valueStyle: TextStyle = { ...theme.textStyles.caption, color: theme.colors.textPrimary, flexShrink: 1, textAlign: 'right' };

const monoValueStyle: TextStyle = { ...theme.textStyles.label, color: theme.colors.textPrimary };
