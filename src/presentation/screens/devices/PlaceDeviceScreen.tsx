import React, { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, ScrollView, Text, TextStyle, View, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { toAppError } from '../../../infrastructure/http/httpError';
import { DEVICE_STATUS_HINTS } from '../../../domain/devices/deviceStatus';
import { Banner } from '../../components/common/Banner';
import { PageContainer } from '../../components/common/PageContainer';
import { PageHeader } from '../../components/common/PageHeader';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { SuccessModal } from '../../components/common/SuccessModal';
import { DeviceStatusCard } from '../../components/devices/DeviceStatusCard';
import { usePlaceDevice } from '../../hooks/usePlaceDevice';
import { MainStackParamList } from '../../navigation/types';
import { theme } from '../../styles/theme';
import { themed } from '../../styles/themeRuntime';

type Props = NativeStackScreenProps<MainStackParamList, 'PlaceDevice'>;

export const PlaceDeviceScreen: React.FC<Props> = ({ navigation, route }) => {
  const { t } = useTranslation();
  const { placeId, placeName = t('dashboard.defaultPlaceName') } = route.params;
  const { loaded, device, error, checkedAt, reload, unlink } = usePlaceDevice(placeId);

  const [confirming, setConfirming] = useState(false);
  const [unlinking, setUnlinking] = useState(false);
  const [unlinkError, setUnlinkError] = useState<string | null>(null);
  const [unlinked, setUnlinked] = useState(false);

  const handleUnlink = async () => {
    setUnlinking(true);
    setUnlinkError(null);
    try {
      await unlink();
      setConfirming(false);
      setUnlinked(true); // success modal
    } catch (e) {
      setUnlinkError(toAppError(e).message);
    } finally {
      setUnlinking(false);
    }
  };

  const closeConfirm = () => {
    setConfirming(false);
    setUnlinkError(null);
  };

  const handleUnlinkedDismiss = useCallback(() => setUnlinked(false), []);

  const goToLink = () => navigation.navigate('DeviceWifiSetup', { placeId, placeName, next: 'link' });
  const goToWifi = () => navigation.navigate('DeviceWifiSetup', { placeId, placeName });
  const goToPanel = () => navigation.navigate('PlaceDashboard', { placeId, placeName });

  if (!loaded) {
    return (
      <View style={centeredStyle}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={mutedStyle}>{t('deviceScreens.place.loading')}</Text>
      </View>
    );
  }

  if (error && !device) {
    const placeGone = error.code === 'place.not_found';
    return (
      <View style={centeredStyle}>
        <Banner tone="error" message={error.message} />
        {placeGone ? (
          <Button label={t('deviceScreens.place.backToPlaces')} onPress={() => navigation.popTo('Places')} />
        ) : (
          <Button label={t('common.retry')} onPress={reload} />
        )}
      </View>
    );
  }

  const hint = device ? DEVICE_STATUS_HINTS[device.status] : null;

  return (
    <PageContainer>
      <PageHeader back={{ label: t('common.back'), onPress: () => navigation.goBack() }} title={t('deviceScreens.place.title')} />
      {/* the title stays on the left; the content is centered in a 720 px column */}
      <View style={formColumnStyle}>
      <Text style={eyebrowStyle}>{t('deviceScreens.place.eyebrow')}</Text>
      <Text style={placeNameStyle}>{placeName}</Text>

      {!!error && <Banner tone="warning" message={t('deviceScreens.place.updateFailed', { reason: error.message })} />}

      {device ? (
        <>
          <DeviceStatusCard device={device} now={checkedAt ?? undefined} />
          {!!hint && (
            <Banner
              tone={device.status === 'DISCONNECTED' ? 'warning' : 'info'}
              message={hint}
              action={{ label: t('deviceScreens.link.setupWifi'), onPress: goToWifi }}
            />
          )}
          <Button
            label={t('deviceScreens.place.viewPanel')}
            icon={<Ionicons name="stats-chart" size={18} color={theme.colors.textOnPrimary} />}
            onPress={goToPanel}
          />
          <Button
            label={t('deviceScreens.place.refresh')}
            variant="secondary"
            icon={<Ionicons name="refresh" size={18} color={theme.colors.textPrimary} />}
            onPress={reload}
          />
          <Text style={footnoteStyle}>{t('deviceScreens.place.autoRefresh')}</Text>

          <View style={dangerZoneStyle}>
            <Text style={dangerTitleStyle}>{t('deviceScreens.place.unlinkTitle')}</Text>
            <Text style={dangerTextStyle}>
              {t('deviceScreens.place.unlinkText')}
            </Text>
            <Button label={t('deviceScreens.place.unlinkButton')} variant="danger" onPress={() => setConfirming(true)} />
          </View>
        </>
      ) : (
        <Card variant="outlined" style={emptyCardStyle}>
          <View style={emptyIconStyle}>
            <Ionicons name="speedometer-outline" size={40} color={theme.colors.primary} />
          </View>
          <Text style={emptyTitleStyle}>{t('deviceScreens.place.emptyTitle')}</Text>
          <Text style={emptyTextStyle}>
            {t('deviceScreens.place.emptyText')}
          </Text>
          <Button label={t('deviceScreens.place.start')} onPress={goToLink} style={fullWidthStyle} />
          <Button
            label={t('deviceScreens.place.alreadyOnWifi')}
            variant="ghost"
            onPress={() => navigation.navigate('LinkDevice', { placeId, placeName })}
            style={fullWidthStyle}
          />
        </Card>
      )}

      <ConfirmDialog
        visible={confirming}
        tone="danger"
        title={t('deviceScreens.place.confirmTitle')}
        message={t('deviceScreens.place.confirmBody', { name: placeName })}
        confirmLabel={t('deviceScreens.place.confirmYes')}
        cancelLabel={t('deviceScreens.place.confirmNo')}
        loading={unlinking}
        onConfirm={handleUnlink}
        onCancel={closeConfirm}
      >
        {!!unlinkError && <Banner tone="error" message={unlinkError} />}
      </ConfirmDialog>

      <SuccessModal
        visible={unlinked}
        message={t('deviceScreens.place.unlinked')}
        onDismiss={handleUnlinkedDismiss}
        autoCloseDuration={1500}
      />
      </View>
    </PageContainer>
  );
};

const formColumnStyle: ViewStyle = { width: '100%', maxWidth: 720, alignSelf: 'center', gap: theme.spacing.lg };
const screenStyle: ViewStyle = themed(() => ({ flex: 1, backgroundColor: theme.colors.background }));

const contentStyle: ViewStyle = {
  paddingHorizontal: theme.spacing.lg,
  paddingTop: theme.spacing.xl,
  paddingBottom: theme.spacing.huge,
  gap: theme.spacing.lg,
};

const centeredStyle: ViewStyle = themed(() => ({
  flex: 1,
  alignItems: 'stretch',
  justifyContent: 'center',
  gap: theme.spacing.md,
  padding: theme.spacing.xl,
  backgroundColor: theme.colors.background,
}));

const eyebrowStyle: TextStyle = themed(() => ({
  ...theme.textStyles.label,
  color: theme.colors.textMuted,
  textTransform: 'uppercase',
  marginBottom: -theme.spacing.md,
}));

const placeNameStyle: TextStyle = themed(() => ({ ...theme.textStyles.h2, color: theme.colors.textPrimary }));

const mutedStyle: TextStyle = themed(() => ({ ...theme.textStyles.caption, color: theme.colors.textMuted, textAlign: 'center' }));

const footnoteStyle: TextStyle = { ...mutedStyle, marginTop: -theme.spacing.sm };

const dangerZoneStyle: ViewStyle = themed(() => ({
  marginTop: theme.spacing.lg,
  paddingTop: theme.spacing.xl,
  borderTopWidth: 1,
  borderTopColor: theme.colors.border,
}));

const dangerTitleStyle: TextStyle = themed(() => ({
  ...theme.textStyles.label,
  color: theme.colors.error,
  textTransform: 'uppercase',
  marginBottom: theme.spacing.sm,
}));

const dangerTextStyle: TextStyle = themed(() => ({
  ...theme.textStyles.caption,
  color: theme.colors.textSecondary,
  marginBottom: theme.spacing.lg,
}));

const emptyCardStyle: ViewStyle = { alignItems: 'center', gap: theme.spacing.md, paddingVertical: theme.spacing.xl };

const emptyIconStyle: ViewStyle = themed(() => ({
  width: 80,
  height: 80,
  borderRadius: 40,
  backgroundColor: theme.colors.infoBg,
  alignItems: 'center',
  justifyContent: 'center',
}));

const emptyTitleStyle: TextStyle = themed(() => ({
  ...theme.textStyles.h2,
  fontSize: theme.typography.sizes.h3,
  lineHeight: theme.typography.sizes.h3 * 1.3,
  color: theme.colors.textPrimary,
  textAlign: 'center',
}));

const emptyTextStyle: TextStyle = themed(() => ({
  ...theme.textStyles.caption,
  fontSize: 16,
  lineHeight: 24,
  color: theme.colors.textSecondary,
  textAlign: 'center',
}));

const fullWidthStyle: ViewStyle = { alignSelf: 'stretch' };
