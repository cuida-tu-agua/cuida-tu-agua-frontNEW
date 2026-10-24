import React, { useState } from 'react';
import { Text, TextStyle, View, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { AppError } from '../../../domain/common/AppError';
import { Permission, SentInvitation } from '../../../domain/sharing/Sharing';
import { isValidInviteEmail, normalizeEmail, withRequired } from '../../../domain/sharing/sharingRules';
import { toAppError } from '../../../infrastructure/http/httpError';
import { theme } from '../../styles/theme';
import { themed } from '../../styles/themeRuntime';
import { Banner } from '../common/Banner';
import { Button } from '../common/Button';
import { Card } from '../common/Card';
import { Input } from '../common/Input';
import { PermissionPicker } from './PermissionPicker';

interface InviteCardProps {
  invite: (email: string, permissions: Permission[]) => Promise<SentInvitation>;
}

/** HU-042: invite a person by e-mail and choose what they may do. The e-mail must belong to an account; the server checks it. */
export const InviteCard: React.FC<InviteCardProps> = ({ invite }) => {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [permissions, setPermissions] = useState<Permission[]>(withRequired([]));
  const [emailError, setEmailError] = useState<string | undefined>();
  const [error, setError] = useState<AppError | null>(null);
  const [notice, setNotice] = useState<{ tone: 'success' | 'warning'; text: string } | null>(null);
  const [sending, setSending] = useState(false);

  const send = async () => {
    setError(null);
    setNotice(null);
    if (!isValidInviteEmail(email)) {
      setEmailError(t('sharing.invite.invalidEmail'));
      return;
    }
    setEmailError(undefined);
    setSending(true);
    try {
      const normalized = normalizeEmail(email);
      const sent = await invite(normalized, withRequired(permissions));
      setNotice(
        sent.emailSent
          ? { tone: 'success', text: t('sharing.invite.sent', { email: normalized }) }
          : { tone: 'warning', text: t('sharing.invite.savedNoMail', { email: normalized }) },
      );
      setEmail('');
      setPermissions(withRequired([]));
    } catch (e) {
      const appError = toAppError(e);
      if (appError.fieldErrors.email) setEmailError(appError.fieldErrors.email);
      else setError(appError);
    } finally {
      setSending(false);
    }
  };

  return (
    <Card variant="outlined" style={cardStyle}>
      <View style={headerStyle}>
        <View style={iconStyle}>
          <Ionicons name="person-add-outline" size={22} color={theme.colors.primary} />
        </View>
        <Text style={titleStyle}>{t('sharing.invite.title')}</Text>
      </View>
      <Text style={textStyle}>{t('sharing.invite.text')}</Text>

      {!!error && <Banner tone="error" message={error.message} onClose={() => setError(null)} />}
      {!!notice && <Banner tone={notice.tone} message={notice.text} onClose={() => setNotice(null)} />}

      <Input
        label={t('sharing.invite.email')}
        placeholder={t('sharing.invite.emailPlaceholder')}
        value={email}
        onChangeText={(text) => {
          setEmail(text);
          setEmailError(undefined);
        }}
        keyboardType="email-address"
        autoCapitalize="none"
        autoComplete="email"
        error={emailError}
        maxLength={254}
      />

      <Text style={labelStyle}>{t('sharing.invite.permissions')}</Text>
      <PermissionPicker value={permissions} onChange={setPermissions} />

      <Button label={t('sharing.invite.send')} loading={sending} onPress={send} style={{ alignSelf: 'flex-start' }} />
    </Card>
  );
};

const cardStyle: ViewStyle = { gap: theme.spacing.md };
const headerStyle: ViewStyle = { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.md };
const iconStyle: ViewStyle = themed(() => ({
  width: 40,
  height: 40,
  borderRadius: 20,
  backgroundColor: theme.colors.infoBg,
  alignItems: 'center',
  justifyContent: 'center',
}));
const titleStyle: TextStyle = themed(() => ({ ...theme.textStyles.h3, color: theme.colors.textPrimary, flex: 1 }));
const textStyle: TextStyle = themed(() => ({ ...theme.textStyles.caption, color: theme.colors.textSecondary }));
const labelStyle: TextStyle = themed(() => ({ ...theme.textStyles.label, color: theme.colors.textMuted, textTransform: 'uppercase' }));
