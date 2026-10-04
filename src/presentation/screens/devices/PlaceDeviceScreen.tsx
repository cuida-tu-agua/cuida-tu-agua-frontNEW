import React, { useCallback, useState } from 'react';
import { ActivityIndicator, ScrollView, Text, TextStyle, View, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { toAppError } from '../../../infrastructure/http/httpError';
import { DEVICE_STATUS_HINTS } from '../../../domain/devices/deviceStatus';
import { Banner } from '../../components/common/Banner';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { SuccessModal } from '../../components/common/SuccessModal';
import { DeviceStatusCard } from '../../components/devices/DeviceStatusCard';
import { usePlaceDevice } from '../../hooks/usePlaceDevice';
import { MainStackParamList } from '../../navigation/types';
import { theme } from '../../styles/theme';

type Props = NativeStackScreenProps<MainStackParamList, 'PlaceDevice'>;

/** HU-013 (status) and HU-014 (unlink) of ONE place, and the entry to HU-012 (link). */
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

  // useCallback: SuccessModal restarts its timer whenever this function changes
  const handleUnlinkedDismiss = useCallback(() => setUnlinked(false), []);

  const goToLink = () => navigation.navigate('LinkDevice', { placeId, placeName });

  // ── First load ─────────────────────────────────────────────────────
  if (!loaded) {
    return (
      <View style={centeredStyle}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={mutedStyle}>Consultando el medidor...</Text>
      </View>
    );
  }

  // ── First load failed and there is nothing to show ─────────────────
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
    <ScrollView style={screenStyle} contentContainerStyle={contentStyle}>
      <Text style={eyebrowStyle}>Lugar</Text>
      <Text style={placeNameStyle}>{placeName}</Text>

      {!!error && <Banner tone="warning" message={`No pudimos actualizar el estado. ${error.message}`} />}

      {device ? (
        <>
          <DeviceStatusCard device={device} now={checkedAt ?? undefined} />
          {!!hint && <Banner tone={device.status === 'DISCONNECTED' ? 'warning' : 'info'} message={hint} />}
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
            Vincula tu medidor Cuida Tu Agua con el serial y el código que vienen en la caja.
          </Text>
          <Button label="Vincular medidor" onPress={goToLink} style={fullWidthStyle} />
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
    </ScrollView>
  );
};

const screenStyle: ViewStyle = { flex: 1, backgroundColor: theme.colors.background };

const contentStyle: ViewStyle = {
  paddingHorizontal: theme.spacing.lg,
  paddingTop: theme.spacing.xl,
  paddingBottom: theme.spacing.huge,
  gap: theme.spacing.lg,
};

const centeredStyle: ViewStyle = {
  flex: 1,
  alignItems: 'stretch',
  justifyContent: 'center',
  gap: theme.spacing.md,
  padding: theme.spacing.xl,
  backgroundColor: theme.colors.background,
};

const eyebrowStyle: TextStyle = {
  ...theme.textStyles.label,
  color: theme.colors.textMuted,
  textTransform: 'uppercase',
  marginBottom: -theme.spacing.md,
};

const placeNameStyle: TextStyle = { ...theme.textStyles.h2, color: theme.colors.textPrimary };

const mutedStyle: TextStyle = { ...theme.textStyles.caption, color: theme.colors.textMuted, textAlign: 'center' };

const footnoteStyle: TextStyle = { ...mutedStyle, marginTop: -theme.spacing.sm };

const dangerZoneStyle: ViewStyle = {
  marginTop: theme.spacing.lg,
  paddingTop: theme.spacing.xl,
  borderTopWidth: 1,
  borderTopColor: theme.colors.border,
};

const dangerTitleStyle: TextStyle = {
  ...theme.textStyles.label,
  color: theme.colors.error,
  textTransform: 'uppercase',
  marginBottom: theme.spacing.sm,
};

const dangerTextStyle: TextStyle = {
  ...theme.textStyles.caption,
  color: theme.colors.textSecondary,
  marginBottom: theme.spacing.lg,
};

const emptyCardStyle: ViewStyle = { alignItems: 'center', gap: theme.spacing.md, paddingVertical: theme.spacing.xl };

const emptyIconStyle: ViewStyle = {
  width: 80,
  height: 80,
  borderRadius: 40,
  backgroundColor: theme.colors.infoBg,
  alignItems: 'center',
  justifyContent: 'center',
};

const emptyTitleStyle: TextStyle = {
  ...theme.textStyles.h2,
  fontSize: theme.typography.sizes.h3,
  lineHeight: theme.typography.sizes.h3 * 1.3,
  color: theme.colors.textPrimary,
  textAlign: 'center',
};

const emptyTextStyle: TextStyle = {
  ...theme.textStyles.caption,
  fontSize: 16,
  lineHeight: 24,
  color: theme.colors.textSecondary,
  textAlign: 'center',
};

const fullWidthStyle: ViewStyle = { alignSelf: 'stretch' };
