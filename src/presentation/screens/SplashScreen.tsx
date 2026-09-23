import React, { useEffect } from 'react';
import {
  View,
  Text,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { theme } from '../styles/theme';
import { Logo } from '../components/common/Logo';

interface SplashScreenProps {
  onFinish: () => void;
}

const containerStyle: ViewStyle = {
  flex: 1,
  backgroundColor: theme.colors.background,
  justifyContent: 'center',
  alignItems: 'center',
  paddingHorizontal: theme.spacing.lg,
};

const titleStyle: TextStyle = {
  ...theme.textStyles.h1,
  color: theme.colors.textPrimary,
  marginBottom: theme.spacing.sm,
};

const subtitleStyle: TextStyle = {
  ...theme.textStyles.body,
  color: theme.colors.textSecondary,
  marginBottom: theme.spacing.xxxl,
};

const spinnerContainerStyle: ViewStyle = {
  marginTop: theme.spacing.xl,
};

const loadingTextStyle: TextStyle = {
  ...theme.textStyles.caption,
  color: theme.colors.textMuted,
  marginTop: theme.spacing.md,
};

export const SplashScreen: React.FC<SplashScreenProps> = ({ onFinish }) => {
  useEffect(() => {
    // Simular verificación de token (2-3 segundos)
    const timer = setTimeout(() => {
      onFinish();
    }, 2500);

    return () => clearTimeout(timer);
  }, [onFinish]);

  return (
    <View style={containerStyle}>
      <Logo type="isotipo" theme="light" size={120} />

      {/* App name */}
      <Text style={titleStyle}>Cuida Tu Agua</Text>
      <Text style={subtitleStyle}>Monitoreo Inteligente</Text>

      {/* Loading spinner */}
      <View style={spinnerContainerStyle}>
        <ActivityIndicator
          size="large"
          color={theme.colors.primary}
        />
        <Text style={loadingTextStyle}>Sincronizando...</Text>
      </View>
    </View>
  );
};