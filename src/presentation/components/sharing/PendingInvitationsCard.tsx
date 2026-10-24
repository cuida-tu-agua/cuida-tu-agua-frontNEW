import React, { useState } from 'react';
import { Text, TextStyle, View, ViewStyle } from 'react-native';
import { useTranslation } from 'react-i18next';
import { AppError } from '../../../domain/common/AppError';
import { Invitation } from '../../../domain/sharing/Sharing';
import { toAppError } from '../../../infrastructure/http/httpError';
import { formatDate } from '../../../i18n/format';
import { theme } from '../../styles/theme';
import { themed } from '../../styles/themeRuntime';
import { Banner } from '../common/Banner';
import { Button } from '../common/Button';
import { Card } from '../common/Card';
import { permissionSummary } from './sharingLabels';

interface PendingInvitationsCardProps {
  invitations: Invitation[];
  cancel: (invitationId: string) => Promise<void>;
}

/** HU-042: the invitations still waiting for an answer, with the way to cancel them. */
export const PendingInvitationsCard: React.FC<PendingInvitationsCardProps> = ({ invitations, cancel }) => {
  const { t } = useTranslation();
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<AppError | null>(null);

  const onCancel = async (id: string) => {
    setBusyId(id);
    setError(null);
    try {
      await cancel(id);
    } catch (e) {
      setError(toAppError(e));
    } finally {
      setBusyId(null);
    }
  };

  return (
    <Card variant="outlined" style={cardStyle}>
      <Text style={titleStyle}>{t('sharing.pending.title')}</Text>
      {!!error && <Banner tone="error" message={error.message} onClose={() => setError(null)} />}
      {invitations.length === 0 ? (
        <Text style={mutedStyle}>{t('sharing.pending.empty')}</Text>
      ) : (
        invitations.map((invitation) => (
          <View key={invitation.id} style={rowStyle}>
            <View style={{ flex: 1, gap: 2 }}>
              <Text style={emailStyle} numberOfLines={1}>
                {invitation.email}
              </Text>
              <Text style={mutedStyle}>{permissionSummary(invitation.permissions)}</Text>
              <Text style={mutedStyle}>{t('sharing.pending.expires', { date: formatDate(invitation.expiresAt) })}</Text>
            </View>
            <Button
              label={t('sharing.pending.cancel')}
              size="small"
              variant="secondary"
              loading={busyId === invitation.id}
              disabled={busyId !== null}
              onPress={() => onCancel(invitation.id)}
            />
          </View>
        ))
      )}
    </Card>
  );
};

const cardStyle: ViewStyle = { gap: theme.spacing.md };
const rowStyle: ViewStyle = { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.md };
const titleStyle: TextStyle = themed(() => ({ ...theme.textStyles.h3, color: theme.colors.textPrimary }));
const emailStyle: TextStyle = themed(() => ({ ...theme.textStyles.body, color: theme.colors.textPrimary, fontWeight: '700' }));
const mutedStyle: TextStyle = themed(() => ({ ...theme.textStyles.caption, color: theme.colors.textMuted }));
