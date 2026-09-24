import React, { useState } from 'react';
import {
  Image,
  View,
  Text,
  ScrollView,
  ViewStyle,
  TextStyle,
  Keyboard,
  TouchableWithoutFeedback,
} from 'react-native';
import { theme } from '../../styles/theme';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { Logo } from '../../components/common/Logo';
import { EyeIcon } from '../../components/auth/EyeIcon';
import { UIcon } from '../../components/auth';

interface LoginScreenProps {
  onLoginPress: (email: string, password: string) => Promise<void>;
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
    <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()} >
      <View style={containerStyle}>
        <ScrollView
          contentContainerStyle={contentStyle}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={headerStyle}>
            <Logo type="isotipo" theme="light" size={120} />
            <Text style={titleStyle}>Bienvenido de vuelta</Text>
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
              leftIcon={<UIcon name="envelope" size={20} color={theme.colors.textMuted} />}
              error={errors.email}
            />

            <Input
              label="Contraseña"
              placeholder="••••••••"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              error={errors.password}
              leftIcon={<UIcon name="lock" size={20} color={theme.colors.textMuted} />}
              
              icon={
                <EyeIcon
                  crossed={showPassword}
                  size={22}
                  color={theme.colors.textPrimary}
                  accessibilityLabel={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                />
              }
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
              icon={
                <Image
                  source={require('../../../../assets/images/g-logo.png')}
                  style={{ width: 20, height: 20 }}
                  resizeMode="contain"
                  accessibilityIgnoresInvertColors
                />
              }
            />
          </View>

         

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