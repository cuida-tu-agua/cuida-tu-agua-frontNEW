import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, ViewStyle } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { profileService } from '../../../core/di/container';
import { toAppError } from '../../../infrastructure/http/httpError';
import { PasswordField, PasswordStrengthMeter } from '../../components/auth';
import { Banner } from '../../components/common/Banner';
import { Button } from '../../components/common/Button';
import { PageContainer } from '../../components/common/PageContainer';
import { PageHeader } from '../../components/common/PageHeader';
import { SuccessModal } from '../../components/common/SuccessModal';
import { useForm } from '../../hooks/useForm';
import { MainStackParamList } from '../../navigation/types';
import { theme } from '../../styles/theme';
import { validatePassword, validatePasswordConfirmation, validateRequired } from '../../utils/validation';
import { themed } from '../../styles/themeRuntime';

type Props = NativeStackScreenProps<MainStackParamList, 'ChangePassword'>;

export const ChangePasswordScreen: React.FC<Props> = ({ navigation }) => {
  const form = useForm(
    { currentPassword: '', newPassword: '', confirmPassword: '' },
    {
      currentPassword: (v) => validateRequired(v, 'Escribe tu contraseña actual.'),
      newPassword: (v, all) =>
        validatePassword(v) ?? (v === all.currentPassword ? 'La nueva contraseña debe ser diferente a la actual.' : undefined),
      confirmPassword: (v, all) => validatePasswordConfirmation(all.newPassword, v),
    },
  );
  const { values, errors, setValue, blur } = form;
  const [saving, setSaving] = useState(false);
  const [bannerMessage, setBannerMessage] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const save = async () => {
    if (saving) return;
    setBannerMessage(null);
    if (!form.validateAll()) return;
    setSaving(true);
    try {
      await profileService.changePassword(values.currentPassword, values.newPassword);
      setDone(true);
    } catch (error) {
      const appError = toAppError(error);
      const { password, ...rest } = appError.fieldErrors; // weak_password → the "new" field
      const fieldErrors = password ? { ...rest, newPassword: password } : rest;
      form.setServerErrors(fieldErrors);
      if (!Object.keys(fieldErrors).some(form.hasField)) setBannerMessage(appError.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <KeyboardAvoidingView style={screenStyle} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <PageContainer narrow>
        <PageHeader back={{ label: 'Volver', onPress: () => navigation.goBack() }} title="Cambiar contraseña" />
        {bannerMessage && <Banner tone="error" message={bannerMessage} onClose={() => setBannerMessage(null)} />}

        <PasswordField
          label="Contraseña actual"
          value={values.currentPassword}
          onChangeText={(t) => setValue('currentPassword', t)}
          error={errors.currentPassword}
        />
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
        />

        <Button label="Cambiar contraseña" onPress={save} loading={saving} />
      </PageContainer>

      <SuccessModal
        visible={done}
        message="Tu contraseña cambió. Te enviamos un correo de aviso."
        onDismiss={() => navigation.goBack()}
        autoCloseDuration={1800}
      />
    </KeyboardAvoidingView>
  );
};

const screenStyle: ViewStyle = themed(() => ({ flex: 1, backgroundColor: theme.colors.background }));
const contentStyle: ViewStyle = { padding: theme.spacing.lg, paddingBottom: theme.spacing.huge };
