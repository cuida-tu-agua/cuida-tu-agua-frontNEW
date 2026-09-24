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
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { theme } from '../../styles/theme';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { Logo } from '../../components/common/Logo';
import { EyeIcon, PasswordStrengthMeter, UIcon } from '../../components/auth';

interface RegisterScreenProps {
  onRegisterPress: (firstName: string, lastName: string, email: string, password: string) => Promise<void>;
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

const fullName: ViewStyle = {
  flexDirection: 'row',
  justifyContent: 'space-between',
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

export const RegisterScreen: React.FC<RegisterScreenProps> = ({
  onRegisterPress,
  onLoginPress,
  loading = false,
}) => {
  const insets = useSafeAreaInsets();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [errors, setErrors] = useState<{
    firstName?: string;
    lastName?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
  }>({});

  const validateForm = (): boolean => {
    const newErrors: typeof errors = {};

    if (!firstName.trim()) {
      newErrors.firstName = 'Nombre es requerido';
    }

    if (!lastName.trim()) {
      newErrors.lastName = 'Apellido es requerido';
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

    if (!confirmPassword) {
      newErrors.confirmPassword = 'Confirma tu contraseña';
    } else if (confirmPassword !== password) {
      newErrors.confirmPassword = 'Las contraseñas no coinciden';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0 && acceptTerms;
  };

  const handleRegisterPress = () => {
    Keyboard.dismiss();
    if (validateForm()) {
      onRegisterPress(firstName.trim(), lastName.trim(), email, password);
    }
      
 };

  return (
    <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
      <View style={[containerStyle, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
        <ScrollView
          contentContainerStyle={contentStyle}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={headerStyle}>
            <Logo type="isotipo" theme="light" size={120} />
            <Text style={titleStyle}>Crear Cuenta</Text>
            <Text style={subtitleStyle}>Únete a nuestros usuarios</Text>
          </View>

          {/* Form */}
          <View style={formStyle}>
            <View style={fullName}>
                <Input
                  label="Nombres"
                  placeholder="Juan Diego"
                  value={firstName}
                  onChangeText={setFirstName}
                  error={errors.firstName}
                  style={{ flex: 1, marginRight: theme.spacing.sm }}
                />
                <Input
                  label="Apellidos"
                  placeholder="Ome Figueroa"
                  value={lastName}
                  onChangeText={setLastName}
                  error={errors.lastName}
                  style={{ flex: 1, marginLeft: theme.spacing.sm }}
                />
            </View>
            

            <Input
              label="Email"
              placeholder="tu@email.com"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              error={errors.email}
              leftIcon={<UIcon name="envelope" size={20} color={theme.colors.textMuted} />}
            />

            <Input
              label="Contraseña"
              placeholder="Mínimo 8 caracteres"
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

            {/* Password Strength */}
            <PasswordStrengthMeter password={password} />

            <Input
              label="Confirmar contraseña"
              placeholder="Repite tu contraseña"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry={!showPassword}
              error={errors.confirmPassword}
              leftIcon={<UIcon name="lock" size={20} color={theme.colors.textMuted} />}
            />

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