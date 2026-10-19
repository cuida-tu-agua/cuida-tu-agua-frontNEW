import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { authService } from '../../../core/di/container';
import { toAppError } from '../../../infrastructure/http/httpError';
import { AuthLayout, PasswordField, PasswordStrengthMeter } from '../../components/auth';
import { Banner, BannerTone } from '../../components/common/Banner';
import { Button } from '../../components/common/Button';
import { CodeInput } from '../../components/common/CodeInput';
import { formatCountdown, useCountdown } from '../../hooks/useCountdown';
import { useForm } from '../../hooks/useForm';
import { AuthStackParamList } from '../../navigation/types';
import { validateCode, validatePassword, validatePasswordConfirmation } from '../../utils/validation';

type Props = NativeStackScreenProps<AuthStackParamList, 'ResetPassword'>;

export const ResetPasswordScreen: React.FC<Props> = ({ navigation, route }) => {
  const { t } = useTranslation();
  const { identifier } = route.params;
  const cooldown = useCountdown(route.params.cooldownSeconds ?? 0);

  const form = useForm(
    { code: '', newPassword: '', confirmPassword: '' },
    {
      code: validateCode,
      newPassword: validatePassword,
      confirmPassword: (v, all) => validatePasswordConfirmation(all.newPassword, v),
    },
  );
  const { values, errors, setValue, blur } = form;

  const [submitting, setSubmitting] = useState(false);
  const [resending, setResending] = useState(false);
  const [banner, setBanner] = useState<{ tone: BannerTone; message: string } | null>(
    route.params.maskedEmail
      ? { tone: 'info', message: t('auth.reset.codeSentTo', { email: route.params.maskedEmail }) }
      : { tone: 'info', message: t('auth.reset.codeSentRecently') },
  );

  const handleSubmit = async () => {
    if (submitting || !form.validateAll()) return;
    setSubmitting(true);
    try {
      await authService.resetPassword({ identifier, code: values.code, newPassword: values.newPassword });
      navigation.reset({
        index: 0,
        routes: [{ name: 'Login', params: { email: identifier.includes('@') ? identifier : undefined, notice: 'password_reset' } }],
      });
    } catch (err) {
      const appError = toAppError(err);
      const { password, ...rest } = appError.fieldErrors;
      const fieldErrors = password ? { ...rest, newPassword: password } : rest;
      form.setServerErrors(fieldErrors);
      if (appError.code === 'auth.invalid_code' && appError.details.remainingAttempts === 0) {
        form.setServerErrors({ code: t('auth.attemptsExhausted') });
      }
      if (!Object.keys(fieldErrors).some(form.hasField)) setBanner({ tone: 'error', message: appError.message });
      setSubmitting(false);
    }
  };

  const resend = async () => {
    setResending(true);
    try {
      const sent = await authService.forgotPassword(identifier);
      setValue('code', '');
      setBanner({ tone: 'success', message: t('auth.reset.newCodeSentTo', { email: sent.maskedEmail }) });
      cooldown.start(60);
    } catch (err) {
      const appError = toAppError(err);
      if (appError.details.retryAfterSeconds) cooldown.start(appError.details.retryAfterSeconds);
      setBanner({ tone: appError.kind === 'rate_limited' ? 'info' : 'error', message: appError.message });
    } finally {
      setResending(false);
    }
  };

  return (
    <AuthLayout title={t('auth.reset.title')} onBack={() => navigation.goBack()}>
      {banner && <Banner {...banner} onClose={() => setBanner(null)} />}

      <CodeInput value={values.code} onChange={(v) => setValue('code', v)} error={errors.code} />

      <PasswordField
        label={t('auth.reset.newPasswordLabel')}
        purpose="new"
        value={values.newPassword}
        onChangeText={(t) => setValue('newPassword', t)}
        onBlur={() => blur('newPassword')}
        error={errors.newPassword}
      />
      <PasswordStrengthMeter password={values.newPassword} />

      <PasswordField
        label={t('auth.reset.confirmLabel')}
        purpose="new"
        value={values.confirmPassword}
        onChangeText={(t) => setValue('confirmPassword', t)}
        onBlur={() => blur('confirmPassword')}
        error={errors.confirmPassword}
        returnKeyType="done"
        onSubmitEditing={handleSubmit}
      />

      <Button label={t('auth.reset.submit')} onPress={handleSubmit} loading={submitting} />
      <Button
        label={cooldown.secondsLeft > 0 ? t('auth.resendCodeIn', { time: formatCountdown(cooldown.secondsLeft) }) : t('auth.resendCode')}
        variant="ghost"
        onPress={resend}
        loading={resending}
        disabled={cooldown.secondsLeft > 0}
      />
    </AuthLayout>
  );
};
