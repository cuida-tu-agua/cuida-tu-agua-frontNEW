import React, { useState } from 'react';
import { Text, TextStyle } from 'react-native';
import { useTranslation } from 'react-i18next';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useAuth } from '../../../core/auth/AuthContext';
import { authService } from '../../../core/di/container';
import { AppError } from '../../../domain/common/AppError';
import { toAppError } from '../../../infrastructure/http/httpError';
import { AuthFooterLink, AuthLayout, GoogleSignInButton, PasswordField, UIcon } from '../../components/auth';
import { Banner, BannerTone } from '../../components/common/Banner';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { GoogleConsentNote } from '../../components/legal';
import { formatCountdown, useCountdown } from '../../hooks/useCountdown';
import { AuthStackParamList } from '../../navigation/types';
import { theme } from '../../styles/theme';
import { normalizeEmail, validateEmail, validateRequired } from '../../utils/validation';
import { themed } from '../../styles/themeRuntime';

type Props = NativeStackScreenProps<AuthStackParamList, 'Login'>;

interface BannerState {
  tone: BannerTone;
  message: string;
  title?: string;
  action?: { label: string; onPress: () => void };
}

export const LoginScreen: React.FC<Props> = ({ navigation, route }) => {
  const { t } = useTranslation();
  const { login, signedOutReason, clearSignedOutReason } = useAuth();
  const lock = useCountdown();

  const [email, setEmail] = useState(route.params?.email ?? '');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [submitting, setSubmitting] = useState(false);
  const [banner, setBanner] = useState<BannerState | null>(() => {
    const notice = route.params?.notice;
    if (notice === 'verified') return { tone: 'success', title: t('auth.login.verified.title'), message: t('auth.login.verified.message') };
    if (notice === 'password_reset') {
      return { tone: 'success', title: t('auth.login.passwordReset.title'), message: t('auth.login.passwordReset.message') };
    }
    if (signedOutReason === 'expired') return { tone: 'info', message: t('auth.login.sessionExpired') };
    if (signedOutReason === 'deleted') {
      return { tone: 'info', title: t('auth.login.accountDeleted.title'), message: t('auth.login.accountDeleted.message') };
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
            message: left === 1 ? t('auth.login.lastAttemptOne') : t('auth.login.lastAttemptMany', { count: left }),
            action: { label: t('auth.login.forgot'), onPress: () => navigation.navigate('ForgotPassword', { identifier: email }) },
          });
        }
        return;
      }
      case 'auth.account_locked':
        if (error.details.lockedUntil) lock.startUntil(error.details.lockedUntil);
        setBanner({
          tone: 'error',
          title: t('auth.login.locked.title'),
          message: t('auth.login.locked.message'),
          action: { label: t('auth.login.locked.action'), onPress: () => navigation.navigate('ForgotPassword', { identifier: email }) },
        });
        return;
      case 'auth.account_not_verified':
        setBanner({
          tone: 'warning',
          title: t('auth.login.notVerified.title'),
          message: t('auth.login.notVerified.message'),
          action: { label: t('auth.login.notVerified.action'), onPress: goToVerification },
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
      password: validateRequired(password, t('auth.login.passwordRequired')),
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
      title={t('auth.login.title')}
      subtitle={t('auth.login.subtitle')}
      footer={<AuthFooterLink text={t('auth.login.noAccount')} link={t('auth.login.signUp')} onPress={() => navigation.navigate('Register')} />}
    >
      {banner && <Banner {...banner} onClose={() => setBanner(null)} />}

      <Input
        label={t('auth.emailLabel')}
        placeholder={t('auth.emailPlaceholder')}
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
        label={t('auth.passwordLabel')}
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
        {t('auth.login.forgot')}
      </Text>

      <Button
        label={locked ? t('auth.login.retryIn', { time: formatCountdown(lock.secondsLeft) }) : t('auth.login.submit')}
        onPress={handleSubmit}
        loading={submitting}
        disabled={locked}
      />

      <GoogleSignInButton onError={(message) => setBanner({ tone: 'error', message })} />
      <GoogleConsentNote />
    </AuthLayout>
  );
};

const forgotStyle: TextStyle = themed(() => ({
  ...theme.textStyles.caption,
  color: theme.colors.primary,
  fontWeight: '600',
  textAlign: 'right',
  marginTop: -theme.spacing.sm,
  marginBottom: theme.spacing.xl,
}));
