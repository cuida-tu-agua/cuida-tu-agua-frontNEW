import React from 'react';
import { Text, TextStyle, View, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ValveCommand, ValveCommandStatus } from '../../../domain/valve/Valve';
import { describeOrigin, describeRequester, STATUS_LABELS } from '../../../domain/valve/valveRules';
import { theme } from '../../styles/theme';

const STATUS_COLOR: Record<ValveCommandStatus, string> = {
  SENT: theme.colors.info,
  ACK_SUCCESS: theme.colors.success,
  ACK_TIMEOUT: theme.colors.warning,
  FAILED: theme.colors.error,
};

const formatDate = (iso: string) => new Date(iso).toLocaleString('es-CO', { dateStyle: 'medium', timeStyle: 'short' });

/** One row of the valve history: action, date and time, who, and whether it was manual or automatic. */
export const ValveHistoryItem: React.FC<{ command: ValveCommand }> = ({ command }) => {
  const closing = command.action === 'CLOSE';
  return (
    <View style={rowStyle}>
      <View style={[iconStyle, { backgroundColor: closing ? theme.colors.errorBg : theme.colors.successBg }]}>
        <Ionicons name={closing ? 'lock-closed' : 'lock-open'} size={18} color={closing ? theme.colors.error : theme.colors.success} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={titleStyle}>{closing ? 'Cerrar agua' : 'Abrir agua'}</Text>
        <Text style={mutedLeftStyle}>{formatDate(command.createdAt)}</Text>
        <Text style={mutedLeftStyle}>
          {describeRequester(command)} · {describeOrigin(command)}
        </Text>
        {!!command.failureReason && command.status !== 'ACK_SUCCESS' && (
          <Text style={mutedLeftStyle} numberOfLines={2}>
            {command.status === 'ACK_TIMEOUT' ? 'El medidor no respondió a tiempo.' : 'No se pudo completar.'}
          </Text>
        )}
      </View>
      <Text style={[statusStyle, { color: STATUS_COLOR[command.status] }]}>{STATUS_LABELS[command.status]}</Text>
    </View>
  );
};

const rowStyle: ViewStyle = {
  flexDirection: 'row',
  alignItems: 'center',
  gap: theme.spacing.md,
  padding: theme.spacing.md,
  borderRadius: theme.borderRadius.medium,
  borderWidth: 1,
  borderColor: theme.colors.border,
  backgroundColor: theme.colors.surface,
};
const iconStyle: ViewStyle = { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' };
const titleStyle: TextStyle = { ...theme.textStyles.button, color: theme.colors.textPrimary };
const mutedLeftStyle: TextStyle = { ...theme.textStyles.caption, color: theme.colors.textMuted };
const statusStyle: TextStyle = { ...theme.textStyles.caption, fontWeight: '800', maxWidth: 96, textAlign: 'right' };
