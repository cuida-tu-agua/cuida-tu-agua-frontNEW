import React, { useState } from 'react';
import { Text, TextStyle, View, ViewStyle } from 'react-native';
import { useTranslation } from 'react-i18next';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { authService } from '../../../core/di/container';
import { toAppError } from '../../../infrastructure/http/httpError';
import { AuthFooterLink, AuthLayout, GoogleSignInButton, PasswordField, PasswordStrengthMeter, UIcon } from '../../components/auth';
import { Banner, BannerTone } from '../../components/common/Banner';
import { Button } from '../../components/common/Button';
import { Checkbox } from '../../components/common/Checkbox';
import { Input } from '../../components/common/Input';
import { useForm } from '../../hooks/useForm';
import { AuthStackParamList } from '../../navigation/types';
import { theme } from '../../styles/theme';
import {
  normalizeEmail,
  normalizePhone,
  validateEmail,
  validateName,
  validatePassword,
  validatePasswordConfirmation,
  validatePhone,
} from '../../utils/validation';
import { themed } from '../../styles/themeRuntime';

type Props = NativeStackScreenProps<AuthStackParamList, 'Register'>;

const INITIAL = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  password: '',
  confirmPassword: '',
  acceptTerms: false,
};

export const RegisterScreen: React.FC<Props> = ({ navigation }) => {
  const { t } = useTranslation();
  const form = useForm(INITIAL, {
    firstName: (v) => validateName(v, 'firstName'),
    lastName: (v) => validateName(v, 'lastName'),
    email: validateEmail,
    phone: validatePhone,
    password: validatePassword,
    confirmPassword: (v, all) => validatePasswordConfirmation(all.password, v),
    acceptTerms: (v) => (v ? undefined : t('auth.register.termsRequired')),
  });
  const { values, errors, setValue, blur } = form;

  const [submitting, setSubmitting] = useState(false);
  const [banner, setBanner] = useState<{
    tone: BannerTone;
    message: string;
    action?: { label: string; onPress: () => void };
  } | null>(null);

  const handleSubmit = async () => {
    if (submitting) return;
    setBanner(null);
    if (!form.validateAll()) {
      setBanner({ tone: 'error', message: t('auth.register.reviewFields') });
      return;
    }

    const email = normalizeEmail(values.email);
    setSubmitting(true);
    try {
      const sent = await authService.register({
        firstName: values.firstName.trim(),
        lastName: values.lastName.trim(),
        email,
        phone: normalizePhone(values.phone) || null,
        password: values.password,
      });
      navigation.replace('VerifyEmail', {
        email,
        maskedEmail: sent.maskedEmail,
        expiresAt: sent.expiresAt,
        justRegistered: true,
        cooldownSeconds: 60,
      });
    } catch (error) {
      const appError = toAppError(error);
      form.setServerErrors(appError.fieldErrors);
      if (appError.code === 'auth.email_already_registered') {
        setBanner({
          tone: 'info',
          message: t('auth.register.emailExists'),
          action: {
            label: t('auth.register.goToLogin'),
            onPress: () => navigation.reset({ index: 0, routes: [{ name: 'Login', params: { email } }] }),
          },
        });
      } else {
        setBanner({ tone: 'error', message: appError.message });
      }
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout
      title={t('auth.register.title')}
      subtitle={t('auth.register.subtitle')}
      onBack={() => navigation.goBack()}
      footer={<AuthFooterLink text={t('auth.register.haveAccount')} link={t('auth.register.signIn')} onPress={() => navigation.popTo('Login')} />}
    >
      {banner && <Banner {...banner} onClose={() => setBanner(null)} />}

      <View style={rowStyle}>
        <Input
          label={t('auth.register.firstNameLabel')}
          placeholder={t('auth.register.firstNamePlaceholder')}
          value={values.firstName}
          onChangeText={(t) => setValue('firstName', t)}
          onBlur={() => blur('firstName')}
          error={errors.firstName}
          autoCapitalize="words"
          autoComplete="given-name"
          textContentType="givenName"
          maxLength={100}
          style={halfStyle}
        />
        <Input
          label={t('auth.register.lastNameLabel')}
          placeholder={t('auth.register.lastNamePlaceholder')}
          value={values.lastName}
          onChangeText={(t) => setValue('lastName', t)}
          onBlur={() => blur('lastName')}
          error={errors.lastName}
          autoCapitalize="words"
          autoComplete="family-name"
          textContentType="familyName"
          maxLength={100}
          style={halfStyle}
        />
      </View>

      <Input
        label={t('auth.emailLabel')}
        placeholder={t('auth.emailPlaceholder')}
        value={values.email}
        onChangeText={(t) => setValue('email', t)}
        onBlur={() => blur('email')}
        error={errors.email}
        hint={t('auth.register.emailHint')}
        keyboardType="email-address"
        autoComplete="email"
        textContentType="emailAddress"
        maxLength={320}
        leftIcon={<UIcon name="envelope" size={20} color={theme.colors.textMuted} />}
      />

      <Input
        label={t('auth.register.phoneLabel')}
        placeholder={t('auth.register.phonePlaceholder')}
        value={values.phone}
        onChangeText={(t) => setValue('phone', t)}
        onBlur={() => blur('phone')}
        error={errors.phone}
        hint={t('auth.register.phoneHint')}
        keyboardType="phone-pad"
        autoComplete="tel"
        textContentType="telephoneNumber"
        maxLength={20}
      />

      <PasswordField
        label={t('auth.passwordLabel')}
        purpose="new"
        placeholder={t('auth.register.passwordPlaceholder')}
        value={values.password}
        onChangeText={(t) => setValue('password', t)}
        onBlur={() => blur('password')}
        error={errors.password}
      />
      <PasswordStrengthMeter password={values.password} />

      <PasswordField
        label={t('auth.register.confirmLabel')}
        purpose="new"
        placeholder={t('auth.register.confirmPlaceholder')}
        value={values.confirmPassword}
        onChangeText={(t) => setValue('confirmPassword', t)}
        onBlur={() => blur('confirmPassword')}
        error={errors.confirmPassword}
      />

      <Checkbox
        checked={values.acceptTerms}
        onChange={(checked) => setValue('acceptTerms', checked)}
        error={errors.acceptTerms}
      >
        <Text style={termsTextStyle}>
          {t('auth.register.termsPrefix')}
          <Text style={termsLinkStyle}>{t('auth.register.termsLink')}</Text>
          {t('auth.register.termsMiddle')}
          <Text style={termsLinkStyle}>{t('auth.register.privacyLink')}</Text>
          {t('auth.register.termsSuffix')}
        </Text>
      </Checkbox>

      <Button label={t('auth.register.submit')} onPress={handleSubmit} loading={submitting} />

      <GoogleSignInButton onError={(message) => setBanner({ tone: 'error', message })} />
    </AuthLayout>
  );
};

const rowStyle: ViewStyle = { flexDirection: 'row', gap: theme.spacing.md };

const halfStyle: ViewStyle = { flex: 1 };

const termsTextStyle: TextStyle = themed(() => ({ ...theme.textStyles.caption, color: theme.colors.textSecondary }));

const termsLinkStyle: TextStyle = themed(() => ({ color: theme.colors.primary, textDecorationLine: 'underline' }));
