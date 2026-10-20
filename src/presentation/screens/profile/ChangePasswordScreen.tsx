import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, View, ViewStyle } from 'react-native';
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
import { useTranslation } from 'react-i18next';

type Props = NativeStackScreenProps<MainStackParamList, 'ChangePassword'>;

export const ChangePasswordScreen: React.FC<Props> = ({ navigation }) => {
  const { t } = useTranslation();
  const form = useForm(
    { currentPassword: '', newPassword: '', confirmPassword: '' },
    {
      currentPassword: (v) => validateRequired(v, t('changePassword.currentRequired')),
      newPassword: (v, all) =>
        validatePassword(v) ?? (v === all.currentPassword ? t('changePassword.mustDiffer') : undefined),
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
      <PageContainer>
        <PageHeader back={{ label: t('common.back'), onPress: () => navigation.goBack() }} title={t('changePassword.title')} />
        {/* the title stays on the left; the form is centered in a 720 px column */}
        <View style={formColumnStyle}>
        {bannerMessage && <Banner tone="error" message={bannerMessage} onClose={() => setBannerMessage(null)} />}

        <PasswordField
          label={t('changePassword.currentLabel')}
          value={values.currentPassword}
          onChangeText={(t) => setValue('currentPassword', t)}
          error={errors.currentPassword}
        />
        <PasswordField
          label={t('changePassword.newLabel')}
          purpose="new"
          value={values.newPassword}
          onChangeText={(t) => setValue('newPassword', t)}
          onBlur={() => blur('newPassword')}
          error={errors.newPassword}
        />
        <PasswordStrengthMeter password={values.newPassword} />
        <PasswordField
          label={t('changePassword.confirmLabel')}
          purpose="new"
          value={values.confirmPassword}
          onChangeText={(t) => setValue('confirmPassword', t)}
          onBlur={() => blur('confirmPassword')}
          error={errors.confirmPassword}
        />

        <Button label={t('changePassword.title')} onPress={save} loading={saving} />
        </View>
      </PageContainer>

      <SuccessModal
        visible={done}
        message={t('changePassword.done')}
        onDismiss={() => navigation.goBack()}
        autoCloseDuration={1800}
      />
    </KeyboardAvoidingView>
  );
};

const formColumnStyle: ViewStyle = { width: '100%', maxWidth: 720, alignSelf: 'center' };
const screenStyle: ViewStyle = themed(() => ({ flex: 1, backgroundColor: theme.colors.background }));
const contentStyle: ViewStyle = { padding: theme.spacing.lg, paddingBottom: theme.spacing.huge };
