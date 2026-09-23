import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  ViewStyle,
  TextStyle,
  StyleProp,
  Keyboard,
  TouchableWithoutFeedback,
} from 'react-native';
import { theme } from '../../styles/theme';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { Logo } from '../../components/common/Logo';

interface LoginScreenProps {
  onLoginPress: (email: string, password: string) => void;
  onRegisterPress: () => void;
  onForgotPasswordPress: () => void;
  loading?: boolean;
}

const containerStyle: ViewStyle = {
  flex: 1,
  backgroundColor: theme.colors.background,
};

const contentStyle: ViewStyle = {
  paddingHorizontal: theme.spacing.lg,
  paddingTop: theme.spacing.xxxl,
  paddingBottom: theme.spacing.xxxl,
};

const headerStyle: ViewStyle = {
  alignItems: 'center',
  marginBottom: theme.spacing.xxxl,
};

const logoStyle: TextStyle = {
  fontSize: 80,
  marginBottom: theme.spacing.lg,
};

const titleStyle: TextStyle = {
  ...theme.textStyles.h2,
  color: theme.colors.textPrimary,
  marginBottom: theme.spacing.sm,
  textAlign: 'center',
};

const subtitleStyle: TextStyle = {
  ...theme.textStyles.body,
  color: theme.colors.textSecondary,
  textAlign: 'center',
};

const formStyle: ViewStyle = {
  marginBottom: theme.spacing.xxxl,
};

const forgotPasswordLinkStyle: TextStyle = {
  ...theme.textStyles.caption,
  color: theme.colors.primary,
  textAlign: 'right',
  marginBottom: theme.spacing.xl,
};

const dividerContainerStyle: ViewStyle = {
  flexDirection: 'row',
  alignItems: 'center',
  marginVertical: theme.spacing.xl,
};

const dividerStyle: ViewStyle = {
  flex: 1,
  height: 1,
  backgroundColor: theme.colors.border,
};

const dividerTextStyle: TextStyle = {
  ...theme.textStyles.caption,
  color: theme.colors.textMuted,
  marginHorizontal: theme.spacing.md,
};

const footerStyle: ViewStyle = {
  flexDirection: 'row',
  justifyContent: 'center',
  alignItems: 'center',
  marginTop: theme.spacing.xl,
};

const footerTextStyle: TextStyle = {
  ...theme.textStyles.caption,
  color: theme.colors.textSecondary,
};

const registerLinkStyle: TextStyle = {
  ...theme.textStyles.caption,
  color: theme.colors.primary,
  fontWeight: '600',
};

export const LoginScreen: React.FC<LoginScreenProps> = ({
  onLoginPress,
  onRegisterPress,
  onForgotPasswordPress,
  loading = false,
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const validateForm = (): boolean => {
    const newErrors: typeof errors = {};

    if (!email) {
      newErrors.email = 'Email es requerido';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Email inválido';
    }

    if (!password) {
      newErrors.password = 'Contraseña es requerida';
    } else if (password.length < 6) {
      newErrors.password = 'Contraseña debe tener mínimo 6 caracteres';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLoginPress = () => {
    Keyboard.dismiss();
    if (validateForm()) {
      onLoginPress(email, password);
    }
  };

  return (
    <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
      <View style={containerStyle}>
        <ScrollView
          contentContainerStyle={contentStyle}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={headerStyle}>
            <Logo type="isotipo" theme="light" size={120} />
            <Text style={titleStyle}>Inicia Sesión</Text>
            <Text style={subtitleStyle}>Accede con tus credenciales</Text>
          </View>

          {/* Form */}
          <View style={formStyle}>
            <Input
              label="Email"
              placeholder="tu@email.com"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              error={errors.email}
              icon="✉️"
            />

            <Input
              label="Contraseña"
              placeholder="••••••••"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              error={errors.password}
              icon={showPassword ? '👁️' : '👁️‍🗨️'}
              onIconPress={() => setShowPassword(!showPassword)}
            />

            {/* Forgot Password Link */}
            <Text
              style={forgotPasswordLinkStyle}
              onPress={onForgotPasswordPress}
            >
              ¿Olvidaste tu contraseña?
            </Text>

            {/* Login Button */}
            <Button
              label="Iniciar Sesión"
              onPress={handleLoginPress}
              loading={loading}
              disabled={loading}
            />
          </View>

          {/* Divider */}
          <View style={dividerContainerStyle}>
            <View style={dividerStyle} />
            <Text style={dividerTextStyle}>O</Text>
            <View style={dividerStyle} />
          </View>

          {/* Google Button */}
          <Button
            label="Continuar con Google"
            onPress={() => console.log('Google login')}
            variant="secondary"
            icon="🔵"
          />

          {/* Register Link */}
          <View style={footerStyle}>
            <Text style={footerTextStyle}>¿No tienes cuenta? </Text>
            <Text
              style={registerLinkStyle}
              onPress={onRegisterPress}
            >
              Regístrate
            </Text>
          </View>
        </ScrollView>
      </View>
    </TouchableWithoutFeedback>
  );
};