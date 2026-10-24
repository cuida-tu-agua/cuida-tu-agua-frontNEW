import React from 'react';
import { ActivityIndicator, Text, TextStyle, View, ViewStyle } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { isOwner } from '../../../domain/sharing/sharingRules';
import { Banner } from '../../components/common/Banner';
import { Button } from '../../components/common/Button';
import { PageContainer } from '../../components/common/PageContainer';
import { PageHeader } from '../../components/common/PageHeader';
import { GuestLinkCard } from '../../components/sharing/GuestLinkCard';
import { InviteCard } from '../../components/sharing/InviteCard';
import { MembersCard } from '../../components/sharing/MembersCard';
import { PendingInvitationsCard } from '../../components/sharing/PendingInvitationsCard';
import { usePlaceAccess } from '../../hooks/usePlaceAccess';
import { usePlaceSharing } from '../../hooks/usePlaceSharing';
import { MainStackParamList } from '../../navigation/types';
import { theme } from '../../styles/theme';
import { themed } from '../../styles/themeRuntime';

type Props = NativeStackScreenProps<MainStackParamList, 'PlaceSharing'>;

/** HU-039, HU-042, HU-043, HU-046: the owner shares the place: guest link, invitations and collaborators. */
export const PlaceSharingScreen: React.FC<Props> = ({ navigation, route }) => {
  const { t } = useTranslation();
  const { placeId, placeName } = route.params;
  const access = usePlaceAccess(placeId);
  const sharing = usePlaceSharing(placeId);

  const back = { label: placeName, onPress: () => navigation.navigate('PlaceDashboard', { placeId, placeName }) };

  if (!access.loaded) {
    return (
      <View style={centeredStyle}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  // Only the owner shares the place; the servers refuse anybody else anyway
  if (!isOwner(access.access)) {
    return (
      <PageContainer medium>
        <PageHeader back={back} caption={t('sharing.caption')} title={t('sharing.title')} />
        <Banner tone="warning" message={t('sharing.ownerOnly')} />
        <Button label={t('places.list.title')} variant="secondary" onPress={() => navigation.navigate('Places')} style={{ alignSelf: 'flex-start' }} />
      </PageContainer>
    );
  }

  return (
    <PageContainer medium gap={theme.spacing.lg}>
      <PageHeader back={back} caption={placeName} title={t('sharing.title')} subtitle={t('sharing.subtitle')} />
      {!!sharing.error && (
        <Banner tone="error" message={sharing.error.message} action={{ label: t('common.retry'), onPress: () => void sharing.reload() }} />
      )}
      {sharing.loading ? (
        <ActivityIndicator color={theme.colors.primary} />
      ) : (
        <>
          <GuestLinkCard
            link={sharing.guestLink}
            loading={false}
            create={sharing.createGuestLink}
            deactivate={sharing.deactivateGuestLink}
          />
          <InviteCard invite={sharing.invite} />
          <PendingInvitationsCard invitations={sharing.invitations} cancel={sharing.cancelInvitation} />
          <MembersCard members={sharing.members} changePermissions={sharing.changePermissions} revoke={sharing.revokeMember} />
        </>
      )}
      <Text style={footnoteStyle}>{t('sharing.footnote')}</Text>
    </PageContainer>
  );
};

const centeredStyle: ViewStyle = themed(() => ({ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.colors.background }));
const footnoteStyle: TextStyle = themed(() => ({ ...theme.textStyles.caption, color: theme.colors.textMuted }));
