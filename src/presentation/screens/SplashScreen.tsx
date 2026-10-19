import React from 'react';
import { ActivityIndicator, Text, TextStyle, View, ViewStyle } from 'react-native';
import { theme } from '../styles/theme';
import { Logo } from '../components/common/Logo';
import { themed } from '../styles/themeRuntime';
import { useTranslation } from 'react-i18next';

const containerStyle: ViewStyle = themed(() => ({
  flex: 1,
  backgroundColor: theme.colors.background,
  justifyContent: 'center',
  alignItems: 'center',
  paddingHorizontal: theme.spacing.lg,
}));

const titleStyle: TextStyle = themed(() => ({
  ...theme.textStyles.h1,
  color: theme.colors.textPrimary,
  marginBottom: theme.spacing.sm,
}));

const subtitleStyle: TextStyle = themed(() => ({
  ...theme.textStyles.body,
  color: theme.colors.textSecondary,
  marginBottom: theme.spacing.xxxl,
}));


// Shown while the saved language is being read, so it uses the language of the device until then
export const SplashScreen: React.FC = () => {
  const { t } = useTranslation();
  return (
    <View style={containerStyle}>
      <Logo type="isotipo" theme="light" size={120} />
      <Text style={titleStyle}>{t('common.appName')}</Text>
      <Text style={subtitleStyle}>{t('splash.tagline')}</Text>
      <ActivityIndicator size="large" color={theme.colors.primary} />
    </View>
  );
};
