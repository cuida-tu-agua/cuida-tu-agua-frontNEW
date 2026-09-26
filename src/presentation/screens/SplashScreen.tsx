import React, { useEffect } from 'react';
import {
  View,
  Text,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { theme } from '../styles/theme';
import { LoadingProgress, Logo } from '../components/common';

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
      <LoadingProgress onComplete={onFinish} style={{ marginTop: theme.spacing.xl }} />
    </View>
  );
};