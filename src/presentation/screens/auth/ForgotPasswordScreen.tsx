import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation();
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
      title={t('auth.forgot.title')}
      subtitle={t('auth.forgot.subtitle')}
      onBack={() => navigation.goBack()}
    >
      {bannerMessage && <Banner tone="error" message={bannerMessage} onClose={() => setBannerMessage(null)} />}

      <Input
        label={t('auth.forgot.identifierLabel')}
        placeholder={t('auth.forgot.identifierPlaceholder')}
        value={identifier}
        onChangeText={(text) => {
          setIdentifier(text);
          if (error) setError(undefined);
        }}
        onBlur={() => identifier && setError(validateIdentifier(identifier))}
        error={error}
        hint={t('auth.forgot.hint')}
        keyboardType="email-address"
        autoComplete="email"
        returnKeyType="send"
        onSubmitEditing={handleSubmit}
      />

      <Button label={t('auth.forgot.submit')} onPress={handleSubmit} loading={submitting} />
    </AuthLayout>
  );
};
