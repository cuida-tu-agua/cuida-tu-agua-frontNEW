import React, { useState } from 'react';
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
      ? { tone: 'info', message: `Enviamos un código de 6 dígitos a ${route.params.maskedEmail}. Vence en 15 minutos.` }
      : { tone: 'info', message: 'Te enviamos un código hace un momento. Revisa tu correo (y la carpeta de spam).' },
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
        form.setServerErrors({ code: 'Agotaste los intentos de este código. Pide uno nuevo.' });
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
      setBanner({ tone: 'success', message: `Enviamos un código nuevo a ${sent.maskedEmail}. El anterior ya no sirve.` });
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
    <AuthLayout title="Crea una contraseña nueva" onBack={() => navigation.goBack()}>
      {banner && <Banner {...banner} onClose={() => setBanner(null)} />}

      <CodeInput value={values.code} onChange={(v) => setValue('code', v)} error={errors.code} />

      <PasswordField
        label="Contraseña nueva"
        purpose="new"
        value={values.newPassword}
        onChangeText={(t) => setValue('newPassword', t)}
        onBlur={() => blur('newPassword')}
        error={errors.newPassword}
      />
      <PasswordStrengthMeter password={values.newPassword} />

      <PasswordField
        label="Confirmar contraseña nueva"
        purpose="new"
        value={values.confirmPassword}
        onChangeText={(t) => setValue('confirmPassword', t)}
        onBlur={() => blur('confirmPassword')}
        error={errors.confirmPassword}
        returnKeyType="done"
        onSubmitEditing={handleSubmit}
      />

      <Button label="Guardar contraseña" onPress={handleSubmit} loading={submitting} />
      <Button
        label={cooldown.secondsLeft > 0 ? `Reenviar código en ${formatCountdown(cooldown.secondsLeft)}` : 'Reenviar código'}
        variant="ghost"
        onPress={resend}
        loading={resending}
        disabled={cooldown.secondsLeft > 0}
      />
    </AuthLayout>
  );
};
