import React from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextStyle,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Logo } from '../common/Logo';
import { theme } from '../../styles/theme';

interface AuthLayoutProps {
  title: string;
  subtitle?: string;
  onBack?: () => void;
  footer?: React.ReactNode;
  children: React.ReactNode;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({ title, subtitle, onBack, footer, children }) => {
  const insets = useSafeAreaInsets();

  return (
    <KeyboardAvoidingView
      style={[containerStyle, { paddingTop: insets.top, paddingBottom: insets.bottom }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={contentStyle}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        showsVerticalScrollIndicator={false}
      >
        {onBack && (
          <TouchableOpacity
            onPress={onBack}
            style={backStyle}
            accessibilityRole="button"
            accessibilityLabel="Volver"
            hitSlop={12}
          >
            <Ionicons name="arrow-back" size={24} color={theme.colors.textPrimary} />
          </TouchableOpacity>
        )}

        <View style={headerStyle}>
          <Logo type="isotipo" theme="light" size={onBack ? 72 : 110} />
          <Text style={titleStyle} accessibilityRole="header">
            {title}
          </Text>
          {!!subtitle && <Text style={subtitleStyle}>{subtitle}</Text>}
        </View>

        <View style={cardStyle}>{children}</View>

        {footer}
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const containerStyle: ViewStyle = { flex: 1, backgroundColor: theme.colors.background };

const contentStyle: ViewStyle = {
  flexGrow: 1,
  paddingHorizontal: theme.spacing.lg,
  paddingTop: theme.spacing.xl,
  paddingBottom: theme.spacing.xxxl,
};

const backStyle: ViewStyle = {
  width: 44,
  height: 44,
  borderRadius: 22,
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: theme.colors.surface,
  borderWidth: 1,
  borderColor: theme.colors.border,
};

const headerStyle: ViewStyle = { alignItems: 'center', marginBottom: theme.spacing.xl };

const titleStyle: TextStyle = {
  ...theme.textStyles.h2,
  color: theme.colors.textPrimary,
  marginTop: theme.spacing.md,
  marginBottom: theme.spacing.sm,
  textAlign: 'center',
};

const subtitleStyle: TextStyle = {
  ...theme.textStyles.caption,
  fontSize: 16,
  lineHeight: 24,
  color: theme.colors.textSecondary,
  textAlign: 'center',
};

const cardStyle: ViewStyle = {
  marginBottom: theme.spacing.xl,
  backgroundColor: theme.colors.surface,
  paddingVertical: theme.spacing.xl,
  paddingHorizontal: theme.spacing.lg,
  borderColor: theme.colors.border,
  borderWidth: 0.3,
  borderRadius: theme.spacing.xl,
  shadowColor: theme.colors.primary,
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.3,
  shadowRadius: 5,
  elevation: 1,
};

export const AuthFooterLink: React.FC<{ text: string; link: string; onPress: () => void }> = ({
  text,
  link,
  onPress,
}) => (
  <View style={footerStyle}>
    <Text style={footerTextStyle}>{text} </Text>
    <Text style={footerLinkStyle} onPress={onPress} accessibilityRole="link" suppressHighlighting>
      {link}
    </Text>
  </View>
);

const footerStyle: ViewStyle = { flexDirection: 'row', justifyContent: 'center', flexWrap: 'wrap' };

const footerTextStyle: TextStyle = { ...theme.textStyles.caption, color: theme.colors.textSecondary };

const footerLinkStyle: TextStyle = {
  ...theme.textStyles.caption,
  color: theme.colors.primary,
  fontWeight: '800',
};
