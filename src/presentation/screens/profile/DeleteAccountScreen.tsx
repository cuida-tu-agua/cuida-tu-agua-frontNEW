import React, { useEffect, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, Text, TextStyle, View, ViewStyle } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { FontAwesome, Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../../core/auth/AuthContext';
import { openGoogleFlow, takeWebGoogleResult } from '../../../core/auth/googleSignIn';
import { profileService } from '../../../core/di/container';
import { SignInMethods } from '../../../domain/entities/User';
import { messageForCode, toAppError } from '../../../infrastructure/http/httpError';
import { PasswordField } from '../../components/auth';
import { Banner } from '../../components/common/Banner';
import { Button } from '../../components/common/Button';
import { PageContainer } from '../../components/common/PageContainer';
import { PageHeader } from '../../components/common/PageHeader';
import { Checkbox } from '../../components/common/Checkbox';
import { MainStackParamList } from '../../navigation/types';
import { theme } from '../../styles/theme';
import { themed } from '../../styles/themeRuntime';
import { useTranslation } from 'react-i18next';

type Props = NativeStackScreenProps<MainStackParamList, 'DeleteAccount'>;

const CONSEQUENCES = ['data', 'sessions', 'devices', 'access', 'final'] as const;

export const DeleteAccountScreen: React.FC<Props> = ({ navigation }) => {
  const { t } = useTranslation();
  const { endSession } = useAuth();
  const [understood, setUnderstood] = useState(false);
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ understood?: string; password?: string }>({});
  const [bannerMessage, setBannerMessage] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [methods, setMethods] = useState<SignInMethods | null>(null);
  // HU-004: Google re-confirmation of the account (accounts created with Google have no password)
  const [reauthCode, setReauthCode] = useState<string | null>(null);
  // Web: the page comes back from Google with the result in the address (read once, then removed)
  const [returning] = useState(takeWebGoogleResult);

  useEffect(() => {
    let active = true;
    profileService
      .signInMethods()
      .then((value) => active && setMethods(value))
      .catch((error) => active && setBannerMessage(toAppError(error).message));
    if (returning && 'reauth' in returning) setReauthCode(returning.reauth);
    if (returning && 'error' in returning) setBannerMessage(messageForCode(returning.error));
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const confirmWithGoogle = async () => {
    setBannerMessage(null);
    try {
      const result = await openGoogleFlow((redirect) => profileService.startGoogleReauth(redirect));
      if (!result) return; // web: the page is going to Google
      if ('reauth' in result) setReauthCode(result.reauth);
      else if ('error' in result && result.error !== 'auth.google_cancelled') setBannerMessage(messageForCode(result.error));
    } catch (error) {
      setBannerMessage(toAppError(error).message);
    }
  };

  const handleDelete = async () => {
    const needsPassword = methods?.password === true && !reauthCode;
    const next = {
      understood: understood ? undefined : t('deleteAccount.understoodRequired'),
      password: needsPassword && !password ? t('deleteAccount.passwordRequired') : undefined,
    };
    setErrors(next);
    if (next.understood || next.password) return;
    if (!needsPassword && !reauthCode) {
      setBannerMessage(t('deleteAccount.needGoogle'));
      return;
    }

    setBannerMessage(null);
    setDeleting(true);
    try {
      await profileService.deleteAccount(reauthCode ? undefined : password, reauthCode ?? undefined);
      await endSession('deleted'); // the server already revoked every session
    } catch (error) {
      const appError = toAppError(error);
      if (appError.code === 'user.current_password_incorrect' || appError.code === 'auth.wrong_password') {
        setErrors({ password: t('deleteAccount.wrongPassword') });
      } else {
        if (appError.code === 'auth.google_failed') setReauthCode(null); // the Google code was spent or expired
        setBannerMessage(appError.message);
      }
      setDeleting(false);
    }
  };

  return (
    <KeyboardAvoidingView style={screenStyle} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <PageContainer gap={theme.spacing.md}>
        <PageHeader back={{ label: t('common.back'), onPress: () => navigation.goBack() }} title={t('deleteAccount.title')} />
        {/* the title stays on the left; the warning and the form are centered in a 720 px column */}
        <View style={formColumnStyle}>
        <View style={warningCardStyle}>
          <Ionicons name="warning" size={32} color={theme.colors.error} />
          <Text style={warningTitleStyle}>{t('deleteAccount.warningTitle')}</Text>
          {CONSEQUENCES.map((line) => (
            <View key={line} style={bulletRowStyle}>
              <Ionicons name="close-circle" size={18} color={theme.colors.error} />
              <Text style={bulletTextStyle}>{t(`deleteAccount.consequences.${line}`)}</Text>
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
          <Text style={checkboxTextStyle}>{t('deleteAccount.understood')}</Text>
        </Checkbox>

        {methods?.password && !reauthCode && (
          <PasswordField
            label={t('deleteAccount.passwordLabel')}
            value={password}
            onChangeText={(t) => {
              setPassword(t);
              if (errors.password) setErrors((e) => ({ ...e, password: undefined }));
            }}
            error={errors.password}
          />
        )}

        {methods?.google && !reauthCode && (
          <Button
            label={t('deleteAccount.confirmWithGoogle')}
            variant="secondary"
            onPress={confirmWithGoogle}
            disabled={deleting}
            icon={<FontAwesome name="google" size={18} color={theme.colors.primary} />}
          />
        )}
        {reauthCode && <Text style={checkboxTextStyle}>{t('deleteAccount.googleConfirmed')}</Text>}

        <Button label={t('deleteAccount.submit')} variant="danger" onPress={handleDelete} loading={deleting} />
        <Button label={t('deleteAccount.cancel')} variant="ghost" onPress={() => navigation.goBack()} disabled={deleting} />
        </View>
      </PageContainer>
    </KeyboardAvoidingView>
  );
};

const formColumnStyle: ViewStyle = { width: '100%', maxWidth: 720, alignSelf: 'center', gap: theme.spacing.md };
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
