import React, { useCallback, useState } from 'react';
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
  const { placeId, placeName } = route.params;
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
        <Text style={mutedStyle}>Consultando el medidor...</Text>
      </View>
    );
  }

  if (error && !device) {
    const placeGone = error.code === 'place.not_found';
    return (
      <View style={centeredStyle}>
        <Banner tone="error" message={error.message} />
        {placeGone ? (
          <Button label="Volver a mis lugares" onPress={() => navigation.popTo('Places')} />
        ) : (
          <Button label="Reintentar" onPress={reload} />
        )}
      </View>
    );
  }

  const hint = device ? DEVICE_STATUS_HINTS[device.status] : null;

  return (
    <PageContainer medium gap={theme.spacing.lg}>
      <PageHeader back={{ label: 'Volver', onPress: () => navigation.goBack() }} title="Medidor" />
      <Text style={eyebrowStyle}>Lugar</Text>
      <Text style={placeNameStyle}>{placeName}</Text>

      {!!error && <Banner tone="warning" message={`No pudimos actualizar el estado. ${error.message}`} />}

      {device ? (
        <>
          <DeviceStatusCard device={device} now={checkedAt ?? undefined} />
          {!!hint && (
            <Banner
              tone={device.status === 'DISCONNECTED' ? 'warning' : 'info'}
              message={hint}
              action={{ label: 'Configurar WiFi del medidor', onPress: goToWifi }}
            />
          )}
          <Button
            label="Ver consumo y válvula"
            icon={<Ionicons name="stats-chart" size={18} color={theme.colors.textOnPrimary} />}
            onPress={goToPanel}
          />
          <Button
            label="Actualizar estado"
            variant="secondary"
            icon={<Ionicons name="refresh" size={18} color={theme.colors.textPrimary} />}
            onPress={reload}
          />
          <Text style={footnoteStyle}>El estado se actualiza solo cada 30 segundos.</Text>

          <View style={dangerZoneStyle}>
            <Text style={dangerTitleStyle}>Desvincular</Text>
            <Text style={dangerTextStyle}>
              Úsalo si vas a cambiar el medidor de lugar o lo vas a reemplazar. El historial de consumo se conserva.
            </Text>
            <Button label="Desvincular medidor" variant="danger" onPress={() => setConfirming(true)} />
          </View>
        </>
      ) : (
        <Card variant="outlined" style={emptyCardStyle}>
          <View style={emptyIconStyle}>
            <Ionicons name="speedometer-outline" size={40} color={theme.colors.primary} />
          </View>
          <Text style={emptyTitleStyle}>Este lugar aún no tiene medidor</Text>
          <Text style={emptyTextStyle}>
            Primero conecta el medidor a tu WiFi y después vincúlalo con el serial y el código de la etiqueta.
          </Text>
          <Button label="Empezar" onPress={goToLink} style={fullWidthStyle} />
          <Button
            label="Mi medidor ya está en el WiFi"
            variant="ghost"
            onPress={() => navigation.navigate('LinkDevice', { placeId, placeName })}
            style={fullWidthStyle}
          />
        </Card>
      )}

      <ConfirmDialog
        visible={confirming}
        tone="danger"
        title="¿Desvincular el medidor?"
        message={`El medidor dejará de enviar datos a "${placeName}". El historial de consumo del lugar se conserva.`}
        confirmLabel="Sí, desvincular"
        cancelLabel="No, mantenerlo"
        loading={unlinking}
        onConfirm={handleUnlink}
        onCancel={closeConfirm}
      >
        {!!unlinkError && <Banner tone="error" message={unlinkError} />}
      </ConfirmDialog>

      <SuccessModal
        visible={unlinked}
        message="El medidor se desvinculó del lugar."
        onDismiss={handleUnlinkedDismiss}
        autoCloseDuration={1500}
      />
    </PageContainer>
  );
};

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
