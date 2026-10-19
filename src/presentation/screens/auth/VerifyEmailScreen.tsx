import React, { useState } from 'react';
import { Text, TextStyle } from 'react-native';
import { useTranslation } from 'react-i18next';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import i18n from '../../../i18n';
import { authService } from '../../../core/di/container';
import { toAppError } from '../../../infrastructure/http/httpError';
import { AuthLayout } from '../../components/auth';
import { Banner, BannerTone } from '../../components/common/Banner';
import { Button } from '../../components/common/Button';
import { CodeInput } from '../../components/common/CodeInput';
import { formatCountdown, useCountdown } from '../../hooks/useCountdown';
import { AuthStackParamList } from '../../navigation/types';
import { theme } from '../../styles/theme';
import { validateCode } from '../../utils/validation';
import { themed } from '../../styles/themeRuntime';

type Props = NativeStackScreenProps<AuthStackParamList, 'VerifyEmail'>;

// HU-077 will replace this with the shared locale-aware formatters
const formatExpiry = (iso?: string) =>
  iso ? new Date(iso).toLocaleString(i18n.language === 'en' ? 'en-US' : 'es-CO', { dateStyle: 'medium', timeStyle: 'short' }) : null;

export const VerifyEmailScreen: React.FC<Props> = ({ navigation, route }) => {
  const { t } = useTranslation();
  const { email, justRegistered } = route.params;
  const cooldown = useCountdown(route.params.cooldownSeconds ?? 0);

  const [maskedEmail, setMaskedEmail] = useState(route.params.maskedEmail ?? email);
  const [expiresAt, setExpiresAt] = useState(route.params.expiresAt);
  const [code, setCode] = useState('');
  const [codeError, setCodeError] = useState<string>();
  const [verifying, setVerifying] = useState(false);
  const [resending, setResending] = useState(false);
  const [banner, setBanner] = useState<{ tone: BannerTone; message: string; title?: string } | null>(
    justRegistered ? { tone: 'success', title: t('auth.verify.createdTitle'), message: t('auth.verify.createdMessage') } : null,
  );

  const goToLogin = () =>
    navigation.reset({ index: 0, routes: [{ name: 'Login', params: { email, notice: 'verified' } }] });

  const verify = async (value: string) => {
    if (verifying) return; // auto-submit on the 6th digit + a tap on "Verificar"
    const error = validateCode(value);
    if (error) {
      setCodeError(error);
      return;
    }
    setCodeError(undefined);
    setVerifying(true);
    try {
      await authService.verifyEmail(email, value);
      goToLogin();
    } catch (err) {
      const appError = toAppError(err);
      setVerifying(false);
      if (appError.code === 'auth.already_verified') {
        goToLogin();
        return;
      }
      setCode('');
      if (appError.code === 'auth.invalid_code' && appError.details.remainingAttempts === 0) {
        setCodeError(t('auth.attemptsExhausted'));
      } else if (appError.fieldErrors.code) {
        setCodeError(appError.fieldErrors.code);
      } else {
        setBanner({ tone: 'error', message: appError.message });
      }
    }
  };

  const resend = async () => {
    setResending(true);
    setBanner(null);
    try {
      const sent = await authService.resendVerificationCode(email);
      setMaskedEmail(sent.maskedEmail);
      setExpiresAt(sent.expiresAt);
      setCode('');
      setCodeError(undefined);
      setBanner({ tone: 'success', message: t('auth.verify.newCodeSent') });
      cooldown.start(60);
    } catch (err) {
      const appError = toAppError(err);
      if (appError.code === 'auth.already_verified') {
        goToLogin();
        return;
      }
      if (appError.details.retryAfterSeconds) cooldown.start(appError.details.retryAfterSeconds);
      setBanner({ tone: appError.kind === 'rate_limited' ? 'info' : 'error', message: appError.message });
    } finally {
      setResending(false);
    }
  };

  const expiry = formatExpiry(expiresAt);

  return (
    <AuthLayout
      title={t('auth.verify.title')}
      subtitle={t('auth.verify.subtitle', { email: maskedEmail })}
      onBack={() => navigation.goBack()}
    >
      {banner && <Banner {...banner} onClose={() => setBanner(null)} />}

      <CodeInput
        value={code}
        onChange={(value) => {
          setCode(value);
          if (codeError) setCodeError(undefined);
        }}
        onComplete={verify}
        error={codeError}
        editable={!verifying}
      />

      {expiry && <Text style={hintStyle}>{t('auth.verify.expiry', { date: expiry })}</Text>}

      <Button label={t('auth.verify.submit')} onPress={() => verify(code)} loading={verifying} />

      <Button
        label={cooldown.secondsLeft > 0 ? t('auth.resendCodeIn', { time: formatCountdown(cooldown.secondsLeft) }) : t('auth.resendCode')}
        variant="ghost"
        onPress={resend}
        loading={resending}
        disabled={cooldown.secondsLeft > 0}
        style={secondaryButtonStyle}
      />
    </AuthLayout>
  );
};

const hintStyle: TextStyle = themed(() => ({
  ...theme.textStyles.caption,
  color: theme.colors.textMuted,
  textAlign: 'center',
  marginBottom: theme.spacing.xl,
}));

const secondaryButtonStyle = { marginTop: theme.spacing.sm };
