import React, { useState } from 'react';
import { Text, TextStyle, View, ViewStyle } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { authService } from '../../../core/di/container';
import { toAppError } from '../../../infrastructure/http/httpError';
import { AuthFooterLink, AuthLayout, PasswordField, PasswordStrengthMeter, UIcon } from '../../components/auth';
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
  const form = useForm(INITIAL, {
    firstName: (v) => validateName(v, 'nombre'),
    lastName: (v) => validateName(v, 'apellido'),
    email: validateEmail,
    phone: validatePhone,
    password: validatePassword,
    confirmPassword: (v, all) => validatePasswordConfirmation(all.password, v),
    acceptTerms: (v) => (v ? undefined : 'Debes aceptar los términos para crear la cuenta.'),
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
      setBanner({ tone: 'error', message: 'Revisa los campos marcados en rojo.' });
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
          message: 'Ya existe una cuenta con este correo. Inicia sesión o recupera tu contraseña.',
          action: {
            label: 'Ir a iniciar sesión',
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
      title="Crea tu cuenta"
      subtitle="Mide y cuida el agua de tu casa o negocio"
      onBack={() => navigation.goBack()}
      footer={<AuthFooterLink text="¿Ya tienes cuenta?" link="Inicia sesión" onPress={() => navigation.popTo('Login')} />}
    >
      {banner && <Banner {...banner} onClose={() => setBanner(null)} />}

      <View style={rowStyle}>
        <Input
          label="Nombres"
          placeholder="Juan Diego"
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
          label="Apellidos"
          placeholder="Ome Figueroa"
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
        label="Correo"
        placeholder="tu@correo.com"
        value={values.email}
        onChangeText={(t) => setValue('email', t)}
        onBlur={() => blur('email')}
        error={errors.email}
        hint="Te enviaremos un código para verificarlo."
        keyboardType="email-address"
        autoComplete="email"
        textContentType="emailAddress"
        maxLength={320}
        leftIcon={<UIcon name="envelope" size={20} color={theme.colors.textMuted} />}
      />

      <Input
        label="Teléfono (opcional)"
        placeholder="300 123 4567"
        value={values.phone}
        onChangeText={(t) => setValue('phone', t)}
        onBlur={() => blur('phone')}
        error={errors.phone}
        hint="Sirve para recuperar tu cuenta si olvidas la contraseña."
        keyboardType="phone-pad"
        autoComplete="tel"
        textContentType="telephoneNumber"
        maxLength={20}
      />

      <PasswordField
        label="Contraseña"
        purpose="new"
        placeholder="Crea una contraseña segura"
        value={values.password}
        onChangeText={(t) => setValue('password', t)}
        onBlur={() => blur('password')}
        error={errors.password}
      />
      <PasswordStrengthMeter password={values.password} />

      <PasswordField
        label="Confirmar contraseña"
        purpose="new"
        placeholder="Repite la contraseña"
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
          Acepto los <Text style={termsLinkStyle}>términos y condiciones</Text> y la{' '}
          <Text style={termsLinkStyle}>política de tratamiento de datos</Text>.
        </Text>
      </Checkbox>

      <Button label="Crear cuenta" onPress={handleSubmit} loading={submitting} />
    </AuthLayout>
  );
};

const rowStyle: ViewStyle = { flexDirection: 'row', gap: theme.spacing.md };

const halfStyle: ViewStyle = { flex: 1 };

const termsTextStyle: TextStyle = themed(() => ({ ...theme.textStyles.caption, color: theme.colors.textSecondary }));

const termsLinkStyle: TextStyle = themed(() => ({ color: theme.colors.primary, textDecorationLine: 'underline' }));
