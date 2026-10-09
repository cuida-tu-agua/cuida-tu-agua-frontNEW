import React from 'react';
import { Modal, Text, TextStyle, View, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../styles/theme';
import { Button } from './Button';

interface ConfirmDialogProps {
  visible: boolean;
  title: string;
  message: string;
  confirmLabel: string;
  cancelLabel?: string;
  tone?: 'default' | 'danger';
  loading?: boolean;
  confirmDisabled?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  children?: React.ReactNode;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  visible,
  title,
  message,
  confirmLabel,
  cancelLabel = 'Cancelar',
  tone = 'default',
  loading = false,
  confirmDisabled = false,
  onConfirm,
  onCancel,
  children,
}) => (
  <Modal transparent visible={visible} animationType="fade" onRequestClose={loading ? undefined : onCancel}>
    <View style={backdropStyle}>
      <View style={cardStyle} accessibilityViewIsModal>
        {tone === 'danger' && (
          <View style={dangerIconStyle}>
            <Ionicons name="warning" size={28} color={theme.colors.error} />
          </View>
        )}
        <Text style={titleStyle} accessibilityRole="header">
          {title}
        </Text>
        <Text style={messageStyle}>{message}</Text>
        {children}
        <View style={buttonsStyle}>
          <Button
            label={confirmLabel}
            variant={tone === 'danger' ? 'danger' : 'primary'}
            size="medium"
            onPress={onConfirm}
            loading={loading}
            disabled={confirmDisabled}
          />
          <Button label={cancelLabel} variant="ghost" size="medium" onPress={onCancel} disabled={loading} />
        </View>
      </View>
    </View>
  </Modal>
);

const backdropStyle: ViewStyle = {
  flex: 1,
  backgroundColor: 'rgba(2, 62, 138, 0.35)',
  justifyContent: 'center',
  alignItems: 'center',
  padding: theme.spacing.lg,
};

const cardStyle: ViewStyle = {
  width: '100%',
  maxWidth: 440, // on a wide screen the dialog stays a dialog instead of a banner across the monitor
  backgroundColor: theme.colors.surface,
  borderRadius: theme.borderRadius.large,
  padding: theme.spacing.xl,
  ...theme.shadows.prominent,
};

const dangerIconStyle: ViewStyle = {
  width: 52,
  height: 52,
  borderRadius: 26,
  backgroundColor: theme.colors.errorBg,
  alignItems: 'center',
  justifyContent: 'center',
  alignSelf: 'center',
  marginBottom: theme.spacing.md,
};

const titleStyle: TextStyle = {
  ...theme.textStyles.h2,
  fontSize: theme.typography.sizes.h3,
  lineHeight: theme.typography.sizes.h3 * 1.3,
  color: theme.colors.textPrimary,
  textAlign: 'center',
  marginBottom: theme.spacing.sm,
};

const messageStyle: TextStyle = {
  ...theme.textStyles.caption,
  color: theme.colors.textSecondary,
  textAlign: 'center',
  marginBottom: theme.spacing.lg,
};

const buttonsStyle: ViewStyle = { gap: theme.spacing.sm };
