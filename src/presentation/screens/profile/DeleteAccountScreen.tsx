import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, Text, TextStyle, View, ViewStyle } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../../core/auth/AuthContext';
import { profileService } from '../../../core/di/container';
import { toAppError } from '../../../infrastructure/http/httpError';
import { PasswordField } from '../../components/auth';
import { Banner } from '../../components/common/Banner';
import { Button } from '../../components/common/Button';
import { Checkbox } from '../../components/common/Checkbox';
import { MainStackParamList } from '../../navigation/types';
import { theme } from '../../styles/theme';
import { themed } from '../../styles/themeRuntime';

type Props = NativeStackScreenProps<MainStackParamList, 'DeleteAccount'>;

const CONSEQUENCES = [
  'Borraremos tu nombre, teléfono y foto.',
  'Se cerrará tu sesión en todos tus dispositivos.',
  'Tus medidores quedarán desvinculados.',
  'Las personas con acceso a tus lugares lo perderán.',
  'No se puede deshacer: tendrías que crear una cuenta nueva.',
];

export const DeleteAccountScreen: React.FC<Props> = ({ navigation }) => {
  const { endSession } = useAuth();
  const [understood, setUnderstood] = useState(false);
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ understood?: string; password?: string }>({});
  const [bannerMessage, setBannerMessage] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    const next = {
      understood: understood ? undefined : 'Marca la casilla para confirmar.',
      password: password ? undefined : 'Escribe tu contraseña para confirmar.',
    };
    setErrors(next);
    if (next.understood || next.password) return;

    setBannerMessage(null);
    setDeleting(true);
    try {
      await profileService.deleteAccount(password);
      await endSession('deleted'); // the server already revoked every session
    } catch (error) {
      const appError = toAppError(error);
      if (appError.code === 'user.current_password_incorrect' || appError.code === 'auth.wrong_password') {
        setErrors({ password: 'La contraseña no es correcta.' });
      } else {
        setBannerMessage(appError.message);
      }
      setDeleting(false);
    }
  };

  return (
    <KeyboardAvoidingView style={screenStyle} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={contentStyle} keyboardShouldPersistTaps="handled">
        <View style={warningCardStyle}>
          <Ionicons name="warning" size={32} color={theme.colors.error} />
          <Text style={warningTitleStyle}>Vas a eliminar tu cuenta</Text>
          {CONSEQUENCES.map((line) => (
            <View key={line} style={bulletRowStyle}>
              <Ionicons name="close-circle" size={18} color={theme.colors.error} />
              <Text style={bulletTextStyle}>{line}</Text>
            </View>
          ))}
        </View>

        {bannerMessage && <Banner tone="error" message={bannerMessage} onClose={() => setBannerMessage(null)} />}

        <Checkbox
          checked={understood}
          onChange={(checked) => {
            setUnderstood(checked);
            if (checked) setErrors((e) => ({ ...e, understood: undefined }));
          }}
          error={errors.understood}
        >
          <Text style={checkboxTextStyle}>Entiendo que esta acción no se puede deshacer.</Text>
        </Checkbox>

        <PasswordField
          label="Tu contraseña"
          value={password}
          onChangeText={(t) => {
            setPassword(t);
            if (errors.password) setErrors((e) => ({ ...e, password: undefined }));
          }}
          error={errors.password}
        />

        <Button label="Eliminar mi cuenta" variant="danger" onPress={handleDelete} loading={deleting} />
        <Button label="No, volver" variant="ghost" onPress={() => navigation.goBack()} disabled={deleting} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const screenStyle: ViewStyle = themed(() => ({ flex: 1, backgroundColor: theme.colors.background }));
const contentStyle: ViewStyle = { padding: theme.spacing.lg, paddingBottom: theme.spacing.huge, gap: theme.spacing.xs };

const warningCardStyle: ViewStyle = themed(() => ({
  backgroundColor: theme.colors.errorBg,
  borderRadius: theme.borderRadius.medium,
  padding: theme.spacing.lg,
  gap: theme.spacing.sm,
  marginBottom: theme.spacing.xl,
}));

const warningTitleStyle: TextStyle = themed(() => ({ ...theme.textStyles.h2, fontSize: 22, color: theme.colors.error }));

const bulletRowStyle: ViewStyle = { flexDirection: 'row', alignItems: 'flex-start', gap: theme.spacing.sm };

const bulletTextStyle: TextStyle = themed(() => ({ ...theme.textStyles.caption, flex: 1, color: theme.colors.textPrimary }));

const checkboxTextStyle: TextStyle = themed(() => ({ ...theme.textStyles.caption, color: theme.colors.textPrimary }));
