import React from 'react';
import { ActivityIndicator, Text, TextStyle, View, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { formatLastReport } from '../../../domain/devices/deviceStatus';
import { Valve, ValveCommand, ValveState } from '../../../domain/valve/Valve';
import { availability, outcomeMessage, VALVE_STATE_LABELS } from '../../../domain/valve/valveRules';
import { theme } from '../../styles/theme';
import { Banner } from '../common/Banner';
import { Button } from '../common/Button';
import { Card } from '../common/Card';
import { themed } from '../../styles/themeRuntime';

interface ValveCardProps {
  valve: Valve;
  command: ValveCommand | null;
  onClose: () => void;
  onOpen: () => void;
  onDismissCommand: () => void;
  onHistory: () => void;
  opening?: boolean;
}

const LOOK: Record<ValveState, { fg: string; bg: string; icon: keyof typeof Ionicons.glyphMap; text: string }> = themed(() => ({
  OPEN: { fg: theme.colors.success, bg: theme.colors.successBg, icon: 'water', text: 'El agua está pasando.' },
  CLOSED: { fg: theme.colors.error, bg: theme.colors.errorBg, icon: 'close-circle', text: 'El paso de agua está cerrado.' },
  UNKNOWN: {
    fg: theme.colors.textMuted,
    bg: theme.colors.grayLight,
    icon: 'help-circle-outline',
    text: 'El medidor aún no ha reportado su válvula.',
  },
}));

export const ValveCard: React.FC<ValveCardProps> = ({
  valve,
  command,
  onClose,
  onOpen,
  onDismissCommand,
  onHistory,
  opening,
}) => {
  const look = LOOK[valve.state];
  const rules = availability(valve);
  const noComm = valve.communication === 'NO_COMMUNICATION';
  const waiting = command?.status === 'SENT';
  const outcome = command && !waiting ? outcomeMessage(command) : null;

  return (
    <Card variant="outlined">
      <View style={headerStyle}>
        <View style={[iconStyle, { backgroundColor: look.bg }]}>
          <Ionicons name={look.icon} size={26} color={look.fg} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={captionStyle}>Válvula</Text>
          <Text style={[stateStyle, { color: look.fg }]} accessibilityLabel={`Válvula ${VALVE_STATE_LABELS[valve.state]}`}>
            {VALVE_STATE_LABELS[valve.state]}
          </Text>
          <Text style={captionStyle}>{look.text}</Text>
        </View>
      </View>

      <View style={metaRowStyle}>
        <Ionicons
          name={noComm ? 'cloud-offline-outline' : 'checkmark-done'}
          size={14}
          color={noComm ? theme.colors.warning : theme.colors.textMuted}
        />
        <Text style={[captionStyle, noComm && { color: theme.colors.warning, fontWeight: '700' }]}>
          {noComm ? 'Sin comunicación · ' : 'Confirmado por el medidor '}
          {valve.lastConfirmedAt ? formatLastReport(valve.lastConfirmedAt) : 'nunca'}
        </Text>
      </View>

      {waiting && (
        <View style={waitingStyle} accessibilityLiveRegion="polite">
          <ActivityIndicator color={theme.colors.primary} />
          <Text style={waitingTextStyle}>
            {command.action === 'CLOSE' ? 'Cerrando' : 'Abriendo'}… esperando que el medidor confirme (máx. 30 s)
          </Text>
        </View>
      )}

      {!!outcome && <Banner tone={outcome.tone} message={outcome.text} onClose={onDismissCommand} />}
      {!waiting && !!rules.reason && <Banner tone="warning" message={rules.reason} />}

      <View style={buttonsStyle}>
        <Button
          label="Cerrar agua"
          variant="danger"
          size="medium"
          onPress={onClose}
          disabled={!rules.canClose || waiting}
          style={{ flex: 1 }}
          icon={<Ionicons name="lock-closed" size={18} color={theme.colors.error} />}
        />
        <Button
          label="Abrir agua"
          size="medium"
          onPress={onOpen}
          loading={opening}
          disabled={!rules.canOpen || waiting}
          style={{ flex: 1 }}
          icon={<Ionicons name="lock-open" size={18} color={theme.colors.textOnPrimary} />}
        />
      </View>
      <Button label="Ver historial de la válvula" variant="ghost" size="small" onPress={onHistory} />
    </Card>
  );
};

const headerStyle: ViewStyle = { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.md, marginBottom: theme.spacing.md };
const iconStyle: ViewStyle = { width: 52, height: 52, borderRadius: 26, alignItems: 'center', justifyContent: 'center' };
const captionStyle: TextStyle = themed(() => ({ ...theme.textStyles.caption, color: theme.colors.textMuted }));
const stateStyle: TextStyle = { ...theme.textStyles.h2 };
const metaRowStyle: ViewStyle = { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.xs, marginBottom: theme.spacing.lg };
const waitingStyle: ViewStyle = themed(() => ({
  flexDirection: 'row',
  alignItems: 'center',
  gap: theme.spacing.md,
  padding: theme.spacing.md,
  borderRadius: theme.borderRadius.small,
  backgroundColor: theme.colors.infoBg,
  marginBottom: theme.spacing.lg,
}));
const waitingTextStyle: TextStyle = themed(() => ({ ...theme.textStyles.caption, color: theme.colors.textPrimary, flex: 1 }));
const buttonsStyle: ViewStyle = { flexDirection: 'row', gap: theme.spacing.sm, marginBottom: theme.spacing.sm };
