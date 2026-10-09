import React, { useCallback, useRef, useState } from 'react';
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
import { isAdmin } from '../../../domain/admin/Admin';
import { useAuth } from '../../../core/auth/AuthContext';
import { profileService } from '../../../core/di/container';
import { avatarUri } from '../../../config/api';
import { User } from '../../../domain/entities/User';
import { toAppError } from '../../../infrastructure/http/httpError';
import { AppearanceSection } from '../../components/theme/AppearanceSection';
import { Avatar } from '../../components/common/Avatar';
import { Banner, BannerTone } from '../../components/common/Banner';
import { Button } from '../../components/common/Button';
import { PageContainer } from '../../components/common/PageContainer';
import { PageHeader } from '../../components/common/PageHeader';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { Input } from '../../components/common/Input';
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
  const { user, updateUser, logout } = useAuth();
  const form = useForm(toFormValues(user), {
    firstName: (v) => validateName(v, 'nombre'),
    lastName: (v) => validateName(v, 'apellido'),
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
      setBanner({ tone: 'success', message: 'Guardamos tus cambios.' });
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
      setBanner({ tone: 'warning', message: 'Necesitamos permiso para ver tus fotos. Actívalo en los ajustes del teléfono.' });
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
      setBanner({ tone: 'error', message: 'Usa una foto en formato JPG o PNG.' });
      return;
    }
    if (asset.fileSize && asset.fileSize > AVATAR_MAX_BYTES) {
      setBanner({ tone: 'error', message: 'La foto pesa más de 2 MB. Elige otra o recórtala más.' });
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
      setBanner({ tone: 'success', message: 'Actualizamos tu foto.' });
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
      <PageContainer narrow>
        <PageHeader title="Mi perfil" />
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
            <Button label="Cambiar foto" size="small" variant="secondary" onPress={changePhoto} disabled={uploading} />
            {!!user.avatarUrl && (
              <Button label="Quitar" size="small" variant="ghost" onPress={removePhoto} disabled={uploading} />
            )}
          </View>
        </View>

        {banner && <Banner {...banner} onClose={() => setBanner(null)} />}

        <Text style={sectionStyle}>Datos personales</Text>
        <Input
          label="Nombres"
          value={values.firstName}
          onChangeText={(t) => setValue('firstName', t)}
          onBlur={() => blur('firstName')}
          error={errors.firstName}
          autoCapitalize="words"
          maxLength={100}
        />
        <Input
          label="Apellidos"
          value={values.lastName}
          onChangeText={(t) => setValue('lastName', t)}
          onBlur={() => blur('lastName')}
          error={errors.lastName}
          autoCapitalize="words"
          maxLength={100}
        />
        <Input
          label="Teléfono (opcional)"
          value={values.phone}
          onChangeText={(t) => setValue('phone', t)}
          onBlur={() => blur('phone')}
          error={errors.phone}
          keyboardType="phone-pad"
          maxLength={20}
          hint="Déjalo vacío para quitarlo."
        />
        <Input
          label="Correo"
          value={user.email}
          onChangeText={() => undefined}
          editable={false}
          hint="El correo no se puede cambiar: es tu usuario para iniciar sesión."
          leftIcon={<Ionicons name="lock-closed-outline" size={18} color={theme.colors.textMuted} />}
        />
        <Button label={isDirty ? 'Guardar cambios' : 'Sin cambios'} onPress={save} loading={saving} disabled={!isDirty} />

        {isAdmin(user.roles) && (
          <>
            <Text style={[sectionStyle, { marginTop: theme.spacing.xxl }]}>Administración</Text>
            <MenuRow icon="stats-chart-outline" label="Métricas de la plataforma" onPress={() => navigation.navigate('AdminMetrics')} />
            <MenuRow icon="people-outline" label="Usuarios" onPress={() => navigation.navigate('AdminUsers')} />
            <MenuRow icon="create-outline" label="Gestionar consejos" onPress={() => navigation.navigate('AdminTips')} />
          </>
        )}

        <Text style={[sectionStyle, { marginTop: theme.spacing.xxl }]}>Ahorro</Text>
        <MenuRow icon="bulb-outline" label="Consejos para ahorrar agua" onPress={() => navigation.navigate('Tips')} />

        <Text style={[sectionStyle, { marginTop: theme.spacing.xl }]}>Apariencia</Text>
        <AppearanceSection />

        <Text style={[sectionStyle, { marginTop: theme.spacing.xl }]}>Alertas</Text>
        <MenuRow
          icon="notifications-outline"
          label="Preferencias de notificaciones"
          onPress={() => navigation.navigate('NotificationPreferences')}
        />

        <Text style={[sectionStyle, { marginTop: theme.spacing.xl }]}>Seguridad</Text>
        <MenuRow icon="key-outline" label="Cambiar contraseña" onPress={() => navigation.navigate('ChangePassword')} />
        <MenuRow icon="log-out-outline" label="Cerrar sesión" onPress={() => setConfirmingLogout(true)} />
        <MenuRow
          icon="trash-outline"
          label="Eliminar mi cuenta"
          danger
          onPress={() => navigation.navigate('DeleteAccount')}
        />
      </PageContainer>

      <ConfirmDialog
        visible={confirmingLogout}
        title="¿Cerrar sesión?"
        message="Tendrás que escribir tu correo y contraseña para volver a entrar."
        confirmLabel="Cerrar sesión"
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

const rowTextStyle: TextStyle = themed(() => ({ ...theme.textStyles.button, flex: 1, color: theme.colors.textPrimary }));
