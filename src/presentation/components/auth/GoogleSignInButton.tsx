import React, { useEffect, useState } from 'react';
import { Text, TextStyle, View, ViewStyle } from 'react-native';
import { useTranslation } from 'react-i18next';
import { FontAwesome } from '@expo/vector-icons';
import { useAuth } from '../../../core/auth/AuthContext';
import { GoogleResult, openGoogleSignIn, takeWebGoogleResult } from '../../../core/auth/googleSignIn';
import { authService } from '../../../core/di/container';
import { messageForCode, toAppError } from '../../../infrastructure/http/httpError';
import { Button } from '../common/Button';
import { theme } from '../../styles/theme';
import { themed } from '../../styles/themeRuntime';

interface Props {
  /** Shown by the screen in its banner. */
  onError: (message: string) => void;
}

/**
 * HU-004: "Continuar con Google", on the login and on the register screens (web and mobile).
 * It only appears when the server has Google configured. On web it also finishes the sign-in when the page comes
 * back from Google with ?google_code=... in the address.
 */
export const GoogleSignInButton: React.FC<Props> = ({ onError }) => {
  const { t } = useTranslation();
  const { loginWithGoogleCode } = useAuth();
  // Web: the page may be loading again after Google, with the result in the address (read once, then removed)
  const [returning] = useState(takeWebGoogleResult);
  const [enabled, setEnabled] = useState(false);
  const [busy, setBusy] = useState(returning !== null);

  const finish = async (result: GoogleResult | null) => {
    if (!result) return; // web: the page is going to Google
    if ('cancelled' in result || 'reauth' in result) return setBusy(false); // a re-confirmation is not a sign-in
    if ('error' in result) {
      setBusy(false);
      if (result.error !== 'auth.google_cancelled') onError(messageForCode(result.error));
      return;
    }
    try {
      await loginWithGoogleCode(result.code); // on success RootNavigator switches to the app by itself
    } catch (error) {
      setBusy(false);
      onError(toAppError(error).message);
    }
  };

  useEffect(() => {
    let active = true;
    if (returning) void Promise.resolve(returning).then(finish); // after the first render
    authService.googleEnabled().then((on) => {
      if (active) setEnabled(on);
    });
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!enabled && !busy) return null;

  const handlePress = async () => {
    if (busy) return;
    setBusy(true);
    try {
      await finish(await openGoogleSignIn());
    } catch (error) {
      setBusy(false);
      onError(toAppError(error).message);
    }
  };

  return (
    <View>
      <View style={dividerStyle}>
        <View style={lineStyle} />
        <Text style={dividerTextStyle}>{t('auth.google.or')}</Text>
        <View style={lineStyle} />
      </View>
      <Button
        label={t('auth.google.continue')}
        variant="secondary"
        onPress={handlePress}
        loading={busy}
        icon={<FontAwesome name="google" size={18} color={theme.colors.primary} />}
      />
    </View>
  );
};

const dividerStyle: ViewStyle = themed(() => ({
  flexDirection: 'row',
  alignItems: 'center',
  gap: theme.spacing.md,
  marginVertical: theme.spacing.lg,
}));

const lineStyle: ViewStyle = themed(() => ({ flex: 1, height: 1, backgroundColor: theme.colors.border }));

const dividerTextStyle: TextStyle = themed(() => ({ ...theme.textStyles.caption, color: theme.colors.textMuted }));
