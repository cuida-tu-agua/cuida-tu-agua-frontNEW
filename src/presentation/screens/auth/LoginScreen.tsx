import React, { useState } from 'react';
import { Text, TextStyle } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useAuth } from '../../../core/auth/AuthContext';
import { authService } from '../../../core/di/container';
import { AppError } from '../../../domain/common/AppError';
import { toAppError } from '../../../infrastructure/http/httpError';
import { AuthFooterLink, AuthLayout, PasswordField, UIcon } from '../../components/auth';
import { Banner, BannerTone } from '../../components/common/Banner';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { formatCountdown, useCountdown } from '../../hooks/useCountdown';
import { AuthStackParamList, LoginNotice } from '../../navigation/types';
import { theme } from '../../styles/theme';
import { normalizeEmail, validateEmail, validateRequired } from '../../utils/validation';

type Props = NativeStackScreenProps<AuthStackParamList, 'Login'>;

interface BannerState {
  tone: BannerTone;
  message: string;
  title?: string;
  action?: { label: string; onPress: () => void };
}

const NOTICES: Record<LoginNotice, BannerState> = {
  verified: { tone: 'success', title: '¡Correo verificado!', message: 'Tu cuenta está lista. Inicia sesión para continuar.' },
  password_reset: {
    tone: 'success',
    title: 'Contraseña actualizada',
    message: 'Por seguridad cerramos tus otras sesiones. Inicia sesión con tu nueva contraseña.',
  },
};

export const LoginScreen: React.FC<Props> = ({ navigation, route }) => {
  const { login, signedOutReason, clearSignedOutReason } = useAuth();
  const lock = useCountdown();

  const [email, setEmail] = useState(route.params?.email ?? '');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [submitting, setSubmitting] = useState(false);
  const [banner, setBanner] = useState<BannerState | null>(() => {
    if (route.params?.notice) return NOTICES[route.params.notice];
    if (signedOutReason === 'expired') return { tone: 'info', message: 'Tu sesión expiró. Inicia sesión de nuevo.' };
    if (signedOutReason === 'deleted') {
      return { tone: 'info', title: 'Cuenta eliminada', message: 'Eliminamos tu cuenta y cerramos todas tus sesiones.' };
    }
    return null;
  });

  const goToVerification = async () => {
    const cleanEmail = normalizeEmail(email);
    try {
      const sent = await authService.resendVerificationCode(cleanEmail);
      navigation.navigate('VerifyEmail', { email: cleanEmail, maskedEmail: sent.maskedEmail, expiresAt: sent.expiresAt, cooldownSeconds: 60 });
    } catch (error) {
      const appError = toAppError(error);
      if (appError.code === 'auth.code_recently_sent') {
        // A code is already on its way: go and type it
        navigation.navigate('VerifyEmail', { email: cleanEmail, cooldownSeconds: appError.details.retryAfterSeconds });
      } else {
        setBanner({ tone: 'error', message: appError.message });
      }
    }
  };

  const showLoginError = (error: AppError) => {
    switch (error.code) {
      case 'auth.email_not_found':
        setErrors({ email: error.message });
        return;
      case 'auth.wrong_password': {
        setErrors({ password: error.message });
        const left = error.details.remainingAttempts;
        if (left !== undefined && left <= 2) {
          setBanner({
            tone: 'warning',
            message: `Si fallas ${left === 1 ? 'una vez más' : `${left} veces más`}, bloquearemos tu cuenta 15 minutos por seguridad.`,
            action: { label: '¿Olvidaste tu contraseña?', onPress: () => navigation.navigate('ForgotPassword', { identifier: email }) },
          });
        }
        return;
      }
      case 'auth.account_locked':
        if (error.details.lockedUntil) lock.startUntil(error.details.lockedUntil);
        setBanner({
          tone: 'error',
          title: 'Cuenta bloqueada temporalmente',
          message: 'Hubo 5 intentos fallidos seguidos. Espera a que termine el contador o restablece tu contraseña.',
          action: { label: 'Restablecer contraseña', onPress: () => navigation.navigate('ForgotPassword', { identifier: email }) },
        });
        return;
      case 'auth.account_not_verified':
        setBanner({
          tone: 'warning',
          title: 'Falta verificar tu correo',
          message: 'Te enviaremos un código de 6 dígitos para confirmar que el correo es tuyo.',
          action: { label: 'Enviarme el código', onPress: goToVerification },
        });
        return;
      default:
        if (Object.keys(error.fieldErrors).length > 0) setErrors(error.fieldErrors);
        setBanner({ tone: 'error', message: error.message });
    }
  };

  const locked = lock.secondsLeft > 0;

  const handleSubmit = async () => {
    if (submitting || locked) return; // the keyboard "go" key skips the button's disabled state
    const nextErrors = {
      email: validateEmail(email),
      password: validateRequired(password, 'Escribe tu contraseña.'),
    };
    setErrors(nextErrors);
    if (nextErrors.email || nextErrors.password) return;

    setBanner(null);
    clearSignedOutReason();
    setSubmitting(true);
    try {
      await login(email, password); // on success RootNavigator switches to the app by itself
    } catch (error) {
      showLoginError(toAppError(error));
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout
      title="Bienvenido de vuelta"
      subtitle="Inicia sesión para ver el consumo de tus lugares"
      footer={<AuthFooterLink text="¿No tienes cuenta?" link="Regístrate" onPress={() => navigation.navigate('Register')} />}
    >
      {banner && <Banner {...banner} onClose={() => setBanner(null)} />}

      <Input
        label="Correo"
        placeholder="tu@correo.com"
        value={email}
        onChangeText={(text) => {
          setEmail(text);
          if (errors.email) setErrors((e) => ({ ...e, email: undefined }));
        }}
        onBlur={() => email && setErrors((e) => ({ ...e, email: validateEmail(email) }))}
        keyboardType="email-address"
        autoComplete="email"
        textContentType="username"
        returnKeyType="next"
        leftIcon={<UIcon name="envelope" size={20} color={theme.colors.textMuted} />}
        error={errors.email}
      />

      <PasswordField
        label="Contraseña"
        value={password}
        onChangeText={(text) => {
          setPassword(text);
          if (errors.password) setErrors((e) => ({ ...e, password: undefined }));
        }}
        error={errors.password}
        returnKeyType="go"
        onSubmitEditing={handleSubmit}
      />

      <Text
        style={forgotStyle}
        onPress={() => navigation.navigate('ForgotPassword', { identifier: email })}
        accessibilityRole="link"
        suppressHighlighting
      >
        ¿Olvidaste tu contraseña?
      </Text>

      <Button
        label={locked ? `Intenta de nuevo en ${formatCountdown(lock.secondsLeft)}` : 'Iniciar sesión'}
        onPress={handleSubmit}
        loading={submitting}
        disabled={locked}
      />
    </AuthLayout>
  );
};

const forgotStyle: TextStyle = {
  ...theme.textStyles.caption,
  color: theme.colors.primary,
  fontWeight: '600',
  textAlign: 'right',
  marginTop: -theme.spacing.sm,
  marginBottom: theme.spacing.xl,
};
