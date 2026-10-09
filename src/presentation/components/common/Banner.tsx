import React from 'react';
import { Text, TextStyle, TouchableOpacity, View, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../styles/theme';
import { themed } from '../../styles/themeRuntime';

export type BannerTone = 'info' | 'success' | 'warning' | 'error';

interface BannerProps {
  tone: BannerTone;
  message: string;
  title?: string;
  action?: { label: string; onPress: () => void };
  onClose?: () => void;
}

const TONES: Record<BannerTone, { bg: string; fg: string; icon: keyof typeof Ionicons.glyphMap }> = themed(() => ({
  info: { bg: theme.colors.infoBg, fg: theme.colors.info, icon: 'information-circle' },
  success: { bg: theme.colors.successBg, fg: theme.colors.success, icon: 'checkmark-circle' },
  warning: { bg: theme.colors.warningBg, fg: theme.colors.warning, icon: 'warning' },
  error: { bg: theme.colors.errorBg, fg: theme.colors.error, icon: 'alert-circle' },
}));

export const Banner: React.FC<BannerProps> = ({ tone, message, title, action, onClose }) => {
  const colors = TONES[tone];
  const urgent = tone === 'error' || tone === 'warning';

  return (
    <View
      style={[containerStyle, { backgroundColor: colors.bg, borderColor: colors.fg }]}
      accessibilityRole={urgent ? 'alert' : undefined}
      accessibilityLiveRegion={urgent ? 'assertive' : 'polite'}
    >
      <Ionicons name={colors.icon} size={22} color={colors.fg} style={iconStyle} />
      <View style={bodyStyle}>
        {!!title && <Text style={[titleStyle, { color: colors.fg }]}>{title}</Text>}
        <Text style={messageStyle}>{message}</Text>
        {action && (
          <TouchableOpacity onPress={action.onPress} accessibilityRole="button" hitSlop={8}>
            <Text style={[actionStyle, { color: colors.fg }]}>{action.label}</Text>
          </TouchableOpacity>
        )}
      </View>
      {onClose && (
        <TouchableOpacity onPress={onClose} accessibilityLabel="Cerrar mensaje" hitSlop={12}>
          <Ionicons name="close" size={20} color={theme.colors.textMuted} />
        </TouchableOpacity>
      )}
    </View>
  );
};

const containerStyle: ViewStyle = {
  flexDirection: 'row',
  alignItems: 'flex-start',
  gap: theme.spacing.md,
  padding: theme.spacing.md,
  borderRadius: theme.borderRadius.small,
  borderLeftWidth: 4,
  marginBottom: theme.spacing.lg,
};

const iconStyle = { marginTop: 1 };

const bodyStyle: ViewStyle = { flex: 1, gap: theme.spacing.xs };

const titleStyle: TextStyle = { ...theme.textStyles.button };

const messageStyle: TextStyle = themed(() => ({
  ...theme.textStyles.caption,
  color: theme.colors.textPrimary,
}));

const actionStyle: TextStyle = {
  ...theme.textStyles.caption,
  fontWeight: '800',
  textDecorationLine: 'underline',
  marginTop: theme.spacing.xs,
};
