import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextStyle,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { canUseAdmin } from '../../utils/adminAccess';
import { useAuth } from '../../../core/auth/AuthContext';
import { notificationRepository, profileService } from '../../../core/di/container';
import { avatarUri } from '../../../config/api';
import { User } from '../../../domain/entities/User';
import { toAppError } from '../../../infrastructure/http/httpError';
import { useTranslation } from 'react-i18next';
import { AppearanceSection } from '../../components/theme/AppearanceSection';
import { LanguageSection } from '../../components/language/LanguageSection';
import { Avatar } from '../../components/common/Avatar';
import { Banner, BannerTone } from '../../components/common/Banner';
import { Button } from '../../components/common/Button';
import { PageContainer } from '../../components/common/PageContainer';
import { PageHeader } from '../../components/common/PageHeader';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { Input } from '../../components/common/Input';
import { PhoneVerificationDialog } from '../../components/profile/PhoneVerificationDialog';
import { PHONE_CHANNEL_LABELS, PhoneChannel, maskPhone } from '../../../domain/phone/PhoneVerification';
import { useForm } from '../../hooks/useForm';
import { MainStackParamList } from '../../navigation/types';
import { theme } from '../../styles/theme';
import { normalizePhone, validateName, validatePhone } from '../../utils/validation';
import { themed } from '../../styles/themeRuntime';

type Props = NativeStackScreenProps<MainStackParamList, 'Profile'>;

const AVATAR_MAX_BYTES = 2 * 1024 * 1024; // same limit as ms-iam (iam.avatars.max-bytes)

const toFormValues = (user: User | null) => ({
  firstName: user?.firstName ?? '',
  lastName: user?.lastName ?? '',
  phone: user?.phone ?? '',
});

export const ProfileScreen: React.FC<Props> = ({ navigation }) => {
  const { t } = useTranslation();
  const { user, updateUser, logout } = useAuth();
  const form = useForm(toFormValues(user), {
    firstName: (v) => validateName(v, 'firstName'),
    lastName: (v) => validateName(v, 'lastName'),
    phone: validatePhone,
  });
  const { values, errors, blur, setValues } = form;
  const edited = useRef(false); // true once the user types: fresh server data must not overwrite it
  const setValue: typeof form.setValue = (field, value) => {
    edited.current = true;
    form.setValue(field, value);
  };

  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [confirmingLogout, setConfirmingLogout] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [verifyingPhone, setVerifyingPhone] = useState(false);
  // HU-028: only the modes that can arrive here (without SMS configured, WhatsApp only). A failure offers both.
  const [phoneChannels, setPhoneChannels] = useState<PhoneChannel[] | undefined>(undefined);
  useEffect(() => {
    if (!verifyingPhone) return;
    notificationRepository.shortMessageChannels().then(setPhoneChannels).catch(() => setPhoneChannels(undefined));
  }, [verifyingPhone]);
  const [banner, setBanner] = useState<{ tone: BannerTone; message: string } | null>(null);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      profileService
        .getMe()
        .then((fresh) => {
          if (!active) return;
          updateUser(fresh);
          if (!edited.current) setValues(toFormValues(fresh));
        })
        .catch(() => undefined); // the saved user is shown; saving will report real errors
      return () => {
        active = false;
      };
    }, [updateUser, setValues]),
  );

  if (!user) return null;

  const isDirty =
    values.firstName.trim() !== user.firstName ||
    values.lastName.trim() !== user.lastName ||
    normalizePhone(values.phone) !== (user.phone ?? '');

  const save = async () => {
    setBanner(null);
    if (!form.validateAll()) return;
    setSaving(true);
    try {
      const updated = await profileService.update({
        firstName: values.firstName.trim(),
        lastName: values.lastName.trim(),
        phone: normalizePhone(values.phone) || null,
      });
      await updateUser(updated);
      setValues(toFormValues(updated));
      edited.current = false;
      setBanner({ tone: 'success', message: t('profile.saved') });
    } catch (error) {
      const appError = toAppError(error);
      form.setServerErrors(appError.fieldErrors);
      setBanner({ tone: 'error', message: appError.message });
    } finally {
      setSaving(false);
    }
  };

  const changePhoto = async () => {
    setBanner(null);
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      setBanner({ tone: 'warning', message: t('profile.photoPermission') });
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true, // square crop
      aspect: [1, 1],
      quality: 0.7, // smaller upload, still sharp for a 120 px circle
    });
    if (result.canceled) return;

    const asset = result.assets[0];
    const mimeType = asset.mimeType === 'image/png' ? 'image/png' : asset.mimeType?.startsWith('image/jp') ? 'image/jpeg' : null;
    if (!mimeType) {
      setBanner({ tone: 'error', message: t('profile.photoFormat') });
      return;
    }
    if (asset.fileSize && asset.fileSize > AVATAR_MAX_BYTES) {
      setBanner({ tone: 'error', message: t('profile.photoTooBig') });
      return;
    }

    setUploading(true);
    try {
      const updated = await profileService.changeAvatar({
        uri: asset.uri,
        mimeType,
        fileName: asset.fileName ?? `avatar.${mimeType === 'image/png' ? 'png' : 'jpg'}`,
      });
      await updateUser(updated);
      setBanner({ tone: 'success', message: t('profile.photoUpdated') });
    } catch (error) {
      setBanner({ tone: 'error', message: toAppError(error).message });
    } finally {
      setUploading(false);
    }
  };

  const removePhoto = async () => {
    setUploading(true);
    try {
      await updateUser(await profileService.removeAvatar());
    } catch (error) {
      setBanner({ tone: 'error', message: toAppError(error).message });
    } finally {
      setUploading(false);
    }
  };

  const confirmLogout = async () => {
    setLoggingOut(true);
    await logout(); // RootNavigator goes back to login by itself
  };

  return (
    <KeyboardAvoidingView style={screenStyle} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <PageContainer>
        <PageHeader title={t('profile.title')} />
        <View style={formColumnStyle}>
        <View style={avatarBlockStyle}>
          <View>
            <Avatar uri={avatarUri(user.avatarUrl)} firstName={user.firstName} lastName={user.lastName} size={112} />
            {uploading && (
              <View style={avatarOverlayStyle}>
                <ActivityIndicator color={theme.colors.textOnPrimary} />
              </View>
            )}
          </View>
          <View style={avatarActionsStyle}>
            <Button label={t('profile.changePhoto')} size="small" variant="secondary" onPress={changePhoto} disabled={uploading} />
            {!!user.avatarUrl && (
              <Button label={t('profile.removePhoto')} size="small" variant="ghost" onPress={removePhoto} disabled={uploading} />
            )}
          </View>
        </View>

        {banner && <Banner {...banner} onClose={() => setBanner(null)} />}

        <Text style={sectionStyle}>{t('profile.personalData')}</Text>
        <Input
          label={t('auth.register.firstNameLabel')}
          value={values.firstName}
          onChangeText={(t) => setValue('firstName', t)}
          onBlur={() => blur('firstName')}
          error={errors.firstName}
          autoCapitalize="words"
          maxLength={100}
        />
        <Input
          label={t('auth.register.lastNameLabel')}
          value={values.lastName}
          onChangeText={(t) => setValue('lastName', t)}
          onBlur={() => blur('lastName')}
          error={errors.lastName}
          autoCapitalize="words"
          maxLength={100}
        />
        <Input
          label={t('auth.register.phoneLabel')}
          value={values.phone}
          onChangeText={(t) => setValue('phone', t)}
          onBlur={() => blur('phone')}
          error={errors.phone}
          keyboardType="phone-pad"
          maxLength={20}
          hint={user.phoneVerified ? t('phone.changeResetsHint') : t('profile.phoneHint')}
        />
        <View style={phoneStatusStyle}>
          <Ionicons
            name={user.phoneVerified ? 'shield-checkmark-outline' : 'alert-circle-outline'}
            size={22}
            color={user.phoneVerified ? theme.colors.success : theme.colors.warning}
          />
          <View style={{ flex: 1 }}>
            <Text style={phoneStatusTitleStyle}>
              {user.phoneVerified && user.phoneChannel
                ? t('phone.verifiedTitle', { channel: PHONE_CHANNEL_LABELS[user.phoneChannel] })
                : t('phone.notVerifiedTitle')}
            </Text>
            <Text style={phoneStatusTextStyle}>
              {user.phoneVerified && user.phoneChannel
                ? t('phone.verifiedText', { channel: PHONE_CHANNEL_LABELS[user.phoneChannel], phone: maskPhone(user.phone) })
                : t('phone.notVerifiedText')}
            </Text>
          </View>
          <Button
            label={user.phoneVerified ? t('phone.change') : t('phone.verifyButton')}
            size="small"
            variant={user.phoneVerified ? 'ghost' : 'secondary'}
            onPress={() => setVerifyingPhone(true)}
          />
        </View>
        <Input
          label={t('auth.emailLabel')}
          value={user.email}
          onChangeText={() => undefined}
          editable={false}
          hint={t('profile.emailHint')}
          leftIcon={<Ionicons name="lock-closed-outline" size={18} color={theme.colors.textMuted} />}
        />
        <Button label={isDirty ? t('profile.saveChanges') : t('profile.noChanges')} onPress={save} loading={saving} disabled={!isDirty} />

        {canUseAdmin(user.roles) && (
          <>
            <Text style={[sectionStyle, { marginTop: theme.spacing.xxl }]}>{t('profile.adminSection')}</Text>
            <MenuRow icon="stats-chart-outline" label={t('profile.metrics')} onPress={() => navigation.navigate('AdminMetrics')} />
            <MenuRow icon="people-outline" label={t('profile.users')} onPress={() => navigation.navigate('AdminUsers')} />
            <MenuRow icon="create-outline" label={t('profile.manageTips')} onPress={() => navigation.navigate('AdminTips')} />
          </>
        )}

        <Text style={[sectionStyle, { marginTop: theme.spacing.xxl }]}>{t('profile.savingSection')}</Text>
        <MenuRow icon="bulb-outline" label={t('profile.savingTips')} onPress={() => navigation.navigate('Tips')} />

        <Text style={[sectionStyle, { marginTop: theme.spacing.xl }]}>{t('profile.appearanceSection')}</Text>
        <AppearanceSection />

        <Text style={[sectionStyle, { marginTop: theme.spacing.xl }]}>{t('language.title')}</Text>
        <LanguageSection />

        <Text style={[sectionStyle, { marginTop: theme.spacing.xl }]}>{t('profile.alertsSection')}</Text>
        <MenuRow
          icon="notifications-outline"
          label={t('profile.notificationPrefs')}
          onPress={() => navigation.navigate('NotificationPreferences')}
        />

        <Text style={[sectionStyle, { marginTop: theme.spacing.xl }]}>{t('profile.legalSection')}</Text>
        <MenuRow icon="shield-checkmark-outline" label={t('profile.legal')} onPress={() => navigation.navigate('Legal')} />

        <Text style={[sectionStyle, { marginTop: theme.spacing.xl }]}>{t('profile.securitySection')}</Text>
        <MenuRow icon="key-outline" label={t('profile.changePassword')} onPress={() => navigation.navigate('ChangePassword')} />
        <MenuRow icon="log-out-outline" label={t('profile.logout')} onPress={() => setConfirmingLogout(true)} />
        <MenuRow
          icon="trash-outline"
          label={t('profile.deleteAccount')}
          danger
          onPress={() => navigation.navigate('DeleteAccount')}
        />
        </View>
      </PageContainer>

      <PhoneVerificationDialog
        visible={verifyingPhone}
        channels={phoneChannels}
        user={user}
        requestCode={(country, phone, channel) => profileService.requestPhoneCode(country, phone, channel)}
        confirm={(code) => profileService.confirmPhone(code)}
        onDone={(updated) => {
          setVerifyingPhone(false);
          edited.current = false;
          setValues(toFormValues(updated));
          void updateUser(updated);
          if (updated.phoneChannel) {
            setBanner({ tone: 'success', message: t('phone.verifiedBanner', { channel: PHONE_CHANNEL_LABELS[updated.phoneChannel] }) });
          }
        }}
        onCancel={() => setVerifyingPhone(false)}
      />

      <ConfirmDialog
        visible={confirmingLogout}
        title={t('profile.logoutTitle')}
        message={t('profile.logoutBody')}
        confirmLabel={t('profile.logout')}
        loading={loggingOut}
        onConfirm={confirmLogout}
        onCancel={() => setConfirmingLogout(false)}
      />
    </KeyboardAvoidingView>
  );
};

const MenuRow: React.FC<{
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
  danger?: boolean;
}> = ({ icon, label, onPress, danger }) => (
  <TouchableOpacity style={rowStyle} onPress={onPress} accessibilityRole="button">
    <Ionicons name={icon} size={22} color={danger ? theme.colors.error : theme.colors.textSecondary} />
    <Text style={[rowTextStyle, danger && { color: theme.colors.error }]}>{label}</Text>
    <Ionicons name="chevron-forward" size={20} color={theme.colors.textMuted} />
  </TouchableOpacity>
);

const screenStyle: ViewStyle = themed(() => ({ flex: 1, backgroundColor: theme.colors.background }));

const contentStyle: ViewStyle = { padding: theme.spacing.lg, paddingBottom: theme.spacing.huge };

const avatarBlockStyle: ViewStyle = { alignItems: 'center', gap: theme.spacing.md, marginBottom: theme.spacing.xl };
// Web: the form is a centered column of 720 px under the page title (which stays on the left)
const formColumnStyle: ViewStyle = { width: '100%', maxWidth: 720, alignSelf: 'center' };

const avatarOverlayStyle: ViewStyle = themed(() => ({
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  borderRadius: 56,
  backgroundColor: theme.colors.overlay,
  alignItems: 'center',
  justifyContent: 'center',
}));

const avatarActionsStyle: ViewStyle = { flexDirection: 'row', gap: theme.spacing.sm };

const sectionStyle: TextStyle = themed(() => ({
  ...theme.textStyles.label,
  color: theme.colors.textMuted,
  textTransform: 'uppercase',
  marginBottom: theme.spacing.md,
}));

const rowStyle: ViewStyle = themed(() => ({
  flexDirection: 'row',
  alignItems: 'center',
  gap: theme.spacing.md,
  paddingVertical: theme.spacing.lg,
  paddingHorizontal: theme.spacing.lg,
  marginBottom: theme.spacing.sm,
  borderRadius: theme.borderRadius.medium,
  backgroundColor: theme.colors.surface,
  borderWidth: 1,
  borderColor: theme.colors.border,
}));

const phoneStatusStyle: ViewStyle = themed(() => ({
  flexDirection: 'row',
  alignItems: 'center',
  flexWrap: 'wrap',
  gap: theme.spacing.md,
  padding: theme.spacing.md,
  marginBottom: theme.spacing.lg,
  borderRadius: theme.borderRadius.medium,
  borderWidth: 1,
  borderColor: theme.colors.border,
  backgroundColor: theme.colors.surface,
}));
const phoneStatusTitleStyle: TextStyle = themed(() => ({ ...theme.textStyles.caption, fontWeight: '800', color: theme.colors.textPrimary }));
const phoneStatusTextStyle: TextStyle = themed(() => ({ ...theme.textStyles.caption, color: theme.colors.textSecondary }));
const rowTextStyle: TextStyle = themed(() => ({ ...theme.textStyles.button, flex: 1, color: theme.colors.textPrimary }));
