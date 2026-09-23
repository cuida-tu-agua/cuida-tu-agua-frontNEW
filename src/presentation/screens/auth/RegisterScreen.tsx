import React, { useState } from 'react';
import {
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

interface RegisterScreenProps {
  onRegisterPress: (name: string, email: string, password: string) => void;
  onLoginPress: () => void;
  loading?: boolean;
}

const containerStyle: ViewStyle = {
  flex: 1,
  backgroundColor: theme.colors.background,
};

const contentStyle: ViewStyle = {
  paddingHorizontal: theme.spacing.lg,
  paddingTop: theme.spacing.xxl,
  paddingBottom: theme.spacing.xxxl,
};

const headerStyle: ViewStyle = {
  alignItems: 'center',
  marginBottom: theme.spacing.xxl,
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
  marginBottom: theme.spacing.xxl,
};

const passwordStrengthContainerStyle: ViewStyle = {
  marginTop: theme.spacing.md,
  marginBottom: theme.spacing.lg,
};

const strengthBarStyle: ViewStyle = {
  height: 4,
  backgroundColor: theme.colors.grayLight,
  borderRadius: theme.borderRadius.small,
  marginBottom: theme.spacing.sm,
  overflow: 'hidden',
};

const strengthBarFillStyle = (strength: PasswordStrength): ViewStyle => {
  const baseStyle: ViewStyle = {
    height: '100%',
    borderRadius: theme.borderRadius.small,
  };

  const strengthMap: Record<PasswordStrength, ViewStyle> = {
    weak: { width: '33%', backgroundColor: theme.colors.error },
    medium: { width: '66%', backgroundColor: theme.colors.warning },
    strong: { width: '100%', backgroundColor: theme.colors.success },
  };

  return { ...baseStyle, ...strengthMap[strength] };
};

const strengthTextStyle: TextStyle = {
  ...theme.textStyles.caption,
  color: theme.colors.textMuted,
};

const checklistStyle: ViewStyle = {
  marginBottom: theme.spacing.lg,
};

const checklistItemStyle: ViewStyle = {
  flexDirection: 'row',
  alignItems: 'center',
  marginBottom: theme.spacing.sm,
};

const checklistTextStyle: TextStyle = {
  ...theme.textStyles.caption,
  color: theme.colors.textMuted,
  marginLeft: theme.spacing.sm,
};

const acceptTermsStyle: ViewStyle = {
  flexDirection: 'row',
  alignItems: 'flex-start',
  marginBottom: theme.spacing.xl,
};

const checkboxStyle: ViewStyle = {
  width: 20,
  height: 20,
  borderRadius: 4,
  borderWidth: 1,
  borderColor: theme.colors.border,
  justifyContent: 'center',
  alignItems: 'center',
  marginRight: theme.spacing.md,
  marginTop: theme.spacing.sm,
};

const termsTextStyle: TextStyle = {
  ...theme.textStyles.caption,
  color: theme.colors.textSecondary,
  flex: 1,
};

const termsLinkStyle: TextStyle = {
  ...theme.textStyles.caption,
  color: theme.colors.primary,
  textDecorationLine: 'underline',
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

const loginLinkStyle: TextStyle = {
  ...theme.textStyles.caption,
  color: theme.colors.primary,
  fontWeight: '600',
};

type PasswordStrength = 'weak' | 'medium' | 'strong';

const getPasswordStrength = (password: string): PasswordStrength => {
  if (!password) return 'weak';
  
  const hasUpperCase = /[A-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[!@#$%^&*]/.test(password);
  const isLong = password.length >= 8;

  const strength = [hasUpperCase, hasNumber, hasSpecial, isLong].filter(Boolean).length;

  if (strength >= 3) return 'strong';
  if (strength >= 2) return 'medium';
  return 'weak';
};

export const RegisterScreen: React.FC<RegisterScreenProps> = ({
  onRegisterPress,
  onLoginPress,
  loading = false,
}) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [errors, setErrors] = useState<{ name?: string; email?: string; password?: string }>({});

  const passwordStrength = getPasswordStrength(password);

  const validateForm = (): boolean => {
    const newErrors: typeof errors = {};

    if (!name.trim()) {
      newErrors.name = 'Nombre es requerido';
    }

    if (!email) {
      newErrors.email = 'Email es requerido';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Email inválido';
    }

    if (!password) {
      newErrors.password = 'Contraseña es requerida';
    } else if (password.length < 8) {
      newErrors.password = 'Contraseña debe tener mínimo 8 caracteres';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0 && acceptTerms;
  };

  const handleRegisterPress = () => {
    Keyboard.dismiss();
    if (validateForm()) {
      onRegisterPress(name, email, password);
    }
  };

  const checklistItems = [
    { label: '8 caracteres mínimo', met: password.length >= 8 },
    { label: 'Una mayúscula', met: /[A-Z]/.test(password) },
    { label: 'Un número', met: /[0-9]/.test(password) },
    { label: 'Un carácter especial', met: /[!@#$%^&*]/.test(password) },
  ];

  return (
    <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
      <View style={containerStyle}>
        <ScrollView
          contentContainerStyle={contentStyle}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={headerStyle}>
            <Text style={logoStyle}>💧</Text>
            <Text style={titleStyle}>Crear Cuenta</Text>
            <Text style={subtitleStyle}>Únete a nuestros usuarios</Text>
          </View>

          {/* Form */}
          <View style={formStyle}>
            <Input
              label="Nombre Completo"
              placeholder="Juan Esteban Ome"
              value={name}
              onChangeText={setName}
              error={errors.name}
            />

            <Input
              label="Email"
              placeholder="tu@email.com"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              error={errors.email}
            />

            <Input
              label="Contraseña"
              placeholder="Mínimo 8 caracteres"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              error={errors.password}
              icon={showPassword ? '👁️' : '👁️‍🗨️'}
              onIconPress={() => setShowPassword(!showPassword)}
            />

            {/* Password Strength Indicator */}
            {password && (
              <View style={passwordStrengthContainerStyle}>
                <View style={strengthBarStyle}>
                  <View style={strengthBarFillStyle(passwordStrength)} />
                </View>
                <Text style={strengthTextStyle}>
                  Fuerza: {passwordStrength === 'weak' ? 'Débil' : passwordStrength === 'medium' ? 'Regular' : 'Fuerte'}
                </Text>
              </View>
            )}

            {/* Checklist */}
            <View style={checklistStyle}>
              {checklistItems.map((item, index) => (
                <View key={index} style={checklistItemStyle}>
                  <View
                    style={{
                      ...checkboxStyle,
                      backgroundColor: item.met ? theme.colors.success : 'transparent',
                      borderColor: item.met ? theme.colors.success : theme.colors.border,
                    }}
                  >
                    {item.met && <Text style={{ color: theme.colors.textOnPrimary }}>✓</Text>}
                  </View>
                  <Text style={checklistTextStyle}>{item.label}</Text>
                </View>
              ))}
            </View>

            {/* Accept Terms */}
            <View style={acceptTermsStyle}>
              <View
                style={{
                  ...checkboxStyle,
                  backgroundColor: acceptTerms ? theme.colors.primary : 'transparent',
                  borderColor: acceptTerms ? theme.colors.primary : theme.colors.border,
                }}
                onTouchEnd={() => setAcceptTerms(!acceptTerms)}
              >
                {acceptTerms && <Text style={{ color: theme.colors.textOnPrimary }}>✓</Text>}
              </View>
              <Text style={termsTextStyle}>
                Acepto los{' '}
                <Text style={termsLinkStyle} onPress={() => console.log('Terms')}>
                  términos y condiciones
                </Text>
              </Text>
            </View>

            {/* Register Button */}
            <Button
              label="Crear Cuenta"
              onPress={handleRegisterPress}
              loading={loading}
              disabled={loading || !acceptTerms}
            />
          </View>

          {/* Login Link */}
          <View style={footerStyle}>
            <Text style={footerTextStyle}>¿Ya tienes cuenta? </Text>
            <Text style={loginLinkStyle} onPress={onLoginPress}>
              Inicia Sesión
            </Text>
          </View>
        </ScrollView>
      </View>
    </TouchableWithoutFeedback>
  );
};