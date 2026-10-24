import React, { useState } from 'react';
import { ActivityIndicator, RefreshControl, Text, TextStyle, View, ViewStyle } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { AppError } from '../../../domain/common/AppError';
import { InboxInvitation, SharedPlace } from '../../../domain/sharing/Sharing';
import { toAppError } from '../../../infrastructure/http/httpError';
import { formatDate } from '../../../i18n/format';
import { Banner } from '../../components/common/Banner';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { PageContainer } from '../../components/common/PageContainer';
import { PageHeader } from '../../components/common/PageHeader';
import { SharedPlaceCard } from '../../components/sharing/SharedPlaceCard';
import { permissionSummary } from '../../components/sharing/sharingLabels';
import { useSharedWithMe } from '../../hooks/useSharedWithMe';
import { MainStackParamList } from '../../navigation/types';
import { theme } from '../../styles/theme';
import { themed } from '../../styles/themeRuntime';

type Props = NativeStackScreenProps<MainStackParamList, 'Invitations'>;

/** HU-043 / HU-045: the invitations waiting for an answer and the places other people shared with the signed-in person. */
export const InvitationsScreen: React.FC<Props> = ({ navigation }) => {
  const { t } = useTranslation();
  const shared = useSharedWithMe();
  const [busyId, setBusyId] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<AppError | null>(null);
  const [leaving, setLeaving] = useState<SharedPlace | null>(null);

  const open = (item: SharedPlace) => navigation.navigate('PlaceDashboard', { placeId: item.place.id, placeName: item.place.name });

  const answer = async (invitation: InboxInvitation, accept: boolean) => {
    setBusyId(invitation.id);
    setError(null);
    setNotice(null);
    try {
      if (accept) {
        await shared.accept(invitation.id);
        setNotice(t('sharing.inbox.accepted', { place: invitation.placeName }));
      } else {
        await shared.reject(invitation.id);
        setNotice(t('sharing.inbox.rejected'));
      }
    } catch (e) {
      const appError = toAppError(e);
      setError(appError);
      // Expired, cancelled or already answered: it cannot be answered any more, so it leaves the list
      if (appError.kind === 'not_found' || appError.kind === 'conflict' || appError.kind === 'validation') shared.forget(invitation.id);
    } finally {
      setBusyId(null);
    }
  };

  const confirmLeave = async () => {
    if (!leaving) return;
    const item = leaving;
    setBusyId(item.memberId);
    setError(null);
    try {
      await shared.leave(item.place.id);
      setNotice(t('sharing.shared.left', { name: item.place.name }));
    } catch (e) {
      setError(toAppError(e));
    } finally {
      setBusyId(null);
      setLeaving(null);
    }
  };

  return (
    <PageContainer
      medium
      gap={theme.spacing.lg}
      refreshControl={<RefreshControl refreshing={false} onRefresh={() => void shared.reload()} tintColor={theme.colors.primary} />}
    >
      <PageHeader
        back={{ label: t('places.list.title'), onPress: () => navigation.navigate('Places') }}
        caption={t('sharing.inbox.caption')}
        title={t('sharing.inbox.title')}
        subtitle={t('sharing.inbox.subtitle')}
      />

      {!!error && <Banner tone="error" message={error.message} onClose={() => setError(null)} />}
      {!!notice && <Banner tone="success" message={notice} onClose={() => setNotice(null)} />}
      {!!shared.error && !shared.loading && (
        <Banner tone="warning" message={shared.error.message} action={{ label: t('common.retry'), onPress: () => void shared.reload() }} />
      )}

      {shared.loading ? (
        <ActivityIndicator color={theme.colors.primary} />
      ) : (
        <>
          <Text style={sectionStyle}>{t('sharing.inbox.pendingTitle')}</Text>
          {shared.inbox.length === 0 ? (
            <Text style={mutedStyle}>{t('sharing.inbox.empty')}</Text>
          ) : (
            shared.inbox.map((invitation) => (
              <Card key={invitation.id} variant="outlined" style={{ gap: theme.spacing.sm }}>
                <Text style={nameStyle}>{invitation.placeName}</Text>
                <Text style={mutedStyle}>
                  {invitation.invitedByName ? t('sharing.inbox.from', { name: invitation.invitedByName }) : t('sharing.inbox.fromUnknown')}
                </Text>
                <Text style={mutedStyle}>{permissionSummary(invitation.permissions)}</Text>
                <Text style={mutedStyle}>{t('sharing.inbox.expiresOn', { date: formatDate(invitation.expiresAt) })}</Text>
                <View style={buttonsStyle}>
                  <Button label={t('sharing.inbox.accept')} size="small" loading={busyId === invitation.id} disabled={busyId !== null} onPress={() => answer(invitation, true)} />
                  <Button label={t('sharing.inbox.reject')} size="small" variant="secondary" disabled={busyId !== null} onPress={() => answer(invitation, false)} />
                </View>
              </Card>
            ))
          )}

          <Text style={sectionStyle}>{t('sharing.shared.title')}</Text>
          {shared.sharedPlaces.length === 0 ? (
            <Text style={mutedStyle}>{t('sharing.shared.empty')}</Text>
          ) : (
            shared.sharedPlaces.map((item) => (
              <SharedPlaceCard key={item.memberId} shared={item} onOpen={() => open(item)} onLeave={() => setLeaving(item)} />
            ))
          )}
        </>
      )}

      <ConfirmDialog
        visible={!!leaving}
        title={t('sharing.shared.leaveTitle', { name: leaving?.place.name ?? '' })}
        message={t('sharing.shared.leaveText')}
        confirmLabel={t('sharing.shared.leaveConfirm')}
        tone="danger"
        loading={busyId !== null}
        onConfirm={confirmLeave}
        onCancel={() => setLeaving(null)}
      />
    </PageContainer>
  );
};

const buttonsStyle: ViewStyle = { flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.sm };
const sectionStyle: TextStyle = themed(() => ({ ...theme.textStyles.h3, color: theme.colors.textPrimary }));
const nameStyle: TextStyle = themed(() => ({ ...theme.textStyles.body, color: theme.colors.textPrimary, fontWeight: '800' }));
const mutedStyle: TextStyle = themed(() => ({ ...theme.textStyles.caption, color: theme.colors.textMuted }));
