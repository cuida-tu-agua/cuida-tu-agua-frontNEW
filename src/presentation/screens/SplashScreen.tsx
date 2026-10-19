import React from 'react';
import { ActivityIndicator, Text, TextStyle, View, ViewStyle } from 'react-native';
import { theme } from '../styles/theme';
import { Logo } from '../components/common/Logo';
import { themed } from '../styles/themeRuntime';


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


export const SplashScreen: React.FC = () => (
  <View style={containerStyle}>
    <Logo type="isotipo" theme="light" size={120} />
    <Text style={titleStyle}>Cuida Tu Agua</Text>
    <Text style={subtitleStyle}>Monitoreo Inteligente</Text>
    <ActivityIndicator size="large" color={theme.colors.primary} />
  </View>
);
