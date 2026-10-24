import React, { useState } from 'react';
import { Platform, Share, Text, TextStyle, View, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { AppError } from '../../../domain/common/AppError';
import { GuestLink } from '../../../domain/sharing/Sharing';
import { toAppError } from '../../../infrastructure/http/httpError';
import { theme } from '../../styles/theme';
import { themed } from '../../styles/themeRuntime';
import { copyText } from '../../utils/browserActions';
import { Banner } from '../common/Banner';
import { Button } from '../common/Button';
import { Card } from '../common/Card';
import { ConfirmDialog } from '../common/ConfirmDialog';

interface GuestLinkCardProps {
  link: GuestLink | null;
  loading: boolean;
  create: (regenerate?: boolean) => Promise<unknown>;
  deactivate: () => Promise<void>;
}

type Pending = 'regenerate' | 'deactivate' | null;

/**
 * HU-039: the owner creates the link that shows the water of the place without any login, copies or shares it, replaces
 * it (the old one stops working) or turns it off. Replacing and turning off ask first: they cut the access of whoever
 * has the link.
 */
export const GuestLinkCard: React.FC<GuestLinkCardProps> = ({ link, loading, create, deactivate }) => {
  const { t } = useTranslation();
  const [busy, setBusy] = useState(false);
  const [confirm, setConfirm] = useState<Pending>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<AppError | null>(null);

  const run = async (action: () => Promise<unknown>) => {
    setBusy(true);
    setError(null);
    setNotice(null);
    try {
      await action();
    } catch (e) {
      setError(toAppError(e));
    } finally {
      setBusy(false);
      setConfirm(null);
    }
  };

  const copy = async () => {
    if (!link) return;
    if (await copyText(link.url)) setNotice(t('sharing.guest.copied'));
    else setNotice(t('sharing.guest.copyFailed'));
  };

  const share = async () => {
    if (!link) return;
    try {
      await Share.share({ message: t('sharing.guest.shareMessage', { url: link.url }), url: Platform.OS === 'ios' ? link.url : undefined });
    } catch {
      setNotice(t('sharing.guest.copyFailed'));
    }
  };

  return (
    <Card variant="outlined" style={cardStyle}>
      <View style={headerStyle}>
        <View style={iconStyle}>
          <Ionicons name="link-outline" size={22} color={theme.colors.primary} />
        </View>
        <Text style={titleStyle}>{t('sharing.guest.title')}</Text>
      </View>
      <Text style={textStyle}>{t('sharing.guest.text')}</Text>

      {!!error && <Banner tone="error" message={error.message} onClose={() => setError(null)} />}
      {!!notice && <Banner tone="success" message={notice} onClose={() => setNotice(null)} />}

      {loading ? null : link ? (
        <>
          <View style={urlBoxStyle}>
            <Text style={urlStyle} selectable accessibilityLabel={t('sharing.guest.urlA11y')}>
              {link.url}
            </Text>
          </View>
          <View style={buttonsStyle}>
            {Platform.OS === 'web' ? (
              <Button label={t('sharing.guest.copy')} size="small" onPress={copy} icon={<Ionicons name="copy-outline" size={16} color={theme.colors.textOnPrimary} />} />
            ) : (
              <Button label={t('sharing.guest.share')} size="small" onPress={share} icon={<Ionicons name="share-outline" size={16} color={theme.colors.textOnPrimary} />} />
            )}
            <Button label={t('sharing.guest.regenerate')} size="small" variant="secondary" disabled={busy} onPress={() => setConfirm('regenerate')} />
            <Button label={t('sharing.guest.deactivate')} size="small" variant="danger" disabled={busy} onPress={() => setConfirm('deactivate')} />
          </View>
        </>
      ) : (
        <>
          <Text style={mutedStyle}>{t('sharing.guest.none')}</Text>
          <Button label={t('sharing.guest.create')} loading={busy} onPress={() => run(() => create(false))} style={{ alignSelf: 'flex-start' }} />
        </>
      )}

      <ConfirmDialog
        visible={confirm === 'regenerate'}
        title={t('sharing.guest.regenerateTitle')}
        message={t('sharing.guest.regenerateText')}
        confirmLabel={t('sharing.guest.regenerateConfirm')}
        loading={busy}
        onConfirm={() => run(() => create(true))}
        onCancel={() => setConfirm(null)}
      />
      <ConfirmDialog
        visible={confirm === 'deactivate'}
        title={t('sharing.guest.deactivateTitle')}
        message={t('sharing.guest.deactivateText')}
        confirmLabel={t('sharing.guest.deactivateConfirm')}
        tone="danger"
        loading={busy}
        onConfirm={() => run(deactivate)}
        onCancel={() => setConfirm(null)}
      />
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
const mutedStyle: TextStyle = themed(() => ({ ...theme.textStyles.caption, color: theme.colors.textMuted }));
const urlBoxStyle: ViewStyle = themed(() => ({
  padding: theme.spacing.md,
  borderRadius: theme.borderRadius.small,
  borderWidth: 1,
  borderColor: theme.colors.border,
  backgroundColor: theme.colors.surfaceAlt,
}));
const urlStyle: TextStyle = themed(() => ({ ...theme.textStyles.caption, color: theme.colors.textPrimary, fontFamily: undefined }));
const buttonsStyle: ViewStyle = { flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.sm };
