import React, { useState } from 'react';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { authService } from '../../../core/di/container';
import { toAppError } from '../../../infrastructure/http/httpError';
import { AuthLayout } from '../../components/auth';
import { Banner } from '../../components/common/Banner';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { AuthStackParamList } from '../../navigation/types';
import { normalizeIdentifier, validateIdentifier } from '../../utils/validation';

type Props = NativeStackScreenProps<AuthStackParamList, 'ForgotPassword'>;

export const ForgotPasswordScreen: React.FC<Props> = ({ navigation, route }) => {
  const [identifier, setIdentifier] = useState(route.params?.identifier ?? '');
  const [error, setError] = useState<string>();
  const [bannerMessage, setBannerMessage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (submitting) return;
    const validation = validateIdentifier(identifier);
    setError(validation);
    if (validation) return;

    const clean = normalizeIdentifier(identifier.trim());
    setBannerMessage(null);
    setSubmitting(true);
    try {
      const sent = await authService.forgotPassword(clean);
      navigation.navigate('ResetPassword', {
        identifier: clean,
        maskedEmail: sent.maskedEmail,
        expiresAt: sent.expiresAt,
        cooldownSeconds: 60,
      });
    } catch (err) {
      const appError = toAppError(err);
      if (appError.code === 'auth.code_recently_sent') {
        navigation.navigate('ResetPassword', { identifier: clean, cooldownSeconds: appError.details.retryAfterSeconds });
      } else if (appError.fieldErrors.identifier) {
        setError(appError.fieldErrors.identifier);
      } else {
        setBannerMessage(appError.message);
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout
      title="Recupera tu contraseña"
      subtitle="Escribe el correo o el teléfono de tu cuenta. Te enviaremos un código al correo."
      onBack={() => navigation.goBack()}
    >
      {bannerMessage && <Banner tone="error" message={bannerMessage} onClose={() => setBannerMessage(null)} />}

      <Input
        label="Correo o teléfono"
        placeholder="tu@correo.com o 3001234567"
        value={identifier}
        onChangeText={(text) => {
          setIdentifier(text);
          if (error) setError(undefined);
        }}
        onBlur={() => identifier && setError(validateIdentifier(identifier))}
        error={error}
        hint="El código vence en 15 minutos y solo sirve una vez."
        keyboardType="email-address"
        autoComplete="email"
        returnKeyType="send"
        onSubmitEditing={handleSubmit}
      />

      <Button label="Enviar código" onPress={handleSubmit} loading={submitting} />
    </AuthLayout>
  );
};
