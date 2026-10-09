import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, RefreshControl, ScrollView, Text, TextStyle, View, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { placeRepository } from '../../../core/di/container';
import { ConsumptionPeriod } from '../../../domain/consumption/Consumption';
import { DEVICE_STATUS_LABELS } from '../../../domain/devices/deviceStatus';
import { MeasurementUnit } from '../../../domain/places/Place';
import { toAppError } from '../../../infrastructure/http/httpError';
import { Banner } from '../../components/common/Banner';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { SuccessModal } from '../../components/common/SuccessModal';
import { ConsumptionCard } from '../../components/consumption/ConsumptionCard';
import { CloseValveDialog } from '../../components/valve/CloseValveDialog';
import { ValveCard } from '../../components/valve/ValveCard';
import { useConsumption } from '../../hooks/useConsumption';
import { usePlaceDevice } from '../../hooks/usePlaceDevice';
import { useValve } from '../../hooks/useValve';
import { useLayout } from '../../layout/breakpoints';
import { MainStackParamList } from '../../navigation/types';
import { theme } from '../../styles/theme';

type Props = NativeStackScreenProps<MainStackParamList, 'PlaceDashboard'>;

export const PlaceDashboardScreen: React.FC<Props> = ({ navigation, route }) => {
  const { placeId, placeName } = route.params;
  const { isCompact } = useLayout();
  const [period, setPeriod] = useState<ConsumptionPeriod>('DAY');
  const [unit, setUnit] = useState<MeasurementUnit>('LITERS');

  const device = usePlaceDevice(placeId);
  const consumption = useConsumption(placeId, period);
  const valve = useValve(placeId);

  const [closing, setClosing] = useState(false);
  const [opening, setOpening] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [orderSent, setOrderSent] = useState(false);

  useEffect(() => {
    let active = true;
    placeRepository
      .getById(placeId)
      .then((place) => active && setUnit(place.measurementUnit))
      .catch(() => undefined); // liters is a fine fallback
    return () => {
      active = false;
    };
  }, [placeId]);

  const refreshAll = () => {
    device.reload();
    consumption.reload();
    valve.reload();
  };

  const openValve = async () => {
    setOpening(true);
    setActionError(null);
    try {
      await valve.open();
    } catch (e) {
      setActionError(toAppError(e).message);
    } finally {
      setOpening(false);
    }
  };

  const handleOrderSent = useCallback(() => setOrderSent(false), []);
  const goToDevice = () => navigation.navigate('PlaceDevice', { placeId, placeName });

  if (!device.loaded) {
    return (
      <View style={centeredStyle}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  if (!device.device && !device.error) {
    return (
      <ScrollView style={screenStyle} contentContainerStyle={contentStyle}>
        <Text style={placeNameStyle}>{placeName}</Text>
        <Card variant="outlined" style={emptyCardStyle}>
          <Ionicons name="speedometer-outline" size={44} color={theme.colors.primary} />
          <Text style={emptyTitleStyle}>Vincula un medidor para ver tu consumo</Text>
          <Text style={mutedStyle}>Con el medidor verás cuánta agua usas y podrás abrir o cerrar el paso desde aquí.</Text>
          <Button label="Vincular medidor" onPress={goToDevice} style={{ alignSelf: 'stretch' }} />
        </Card>
      </ScrollView>
    );
  }

  const status = device.device?.status;

  return (
    <ScrollView
      style={screenStyle}
      contentContainerStyle={contentStyle}
      refreshControl={<RefreshControl refreshing={false} onRefresh={refreshAll} tintColor={theme.colors.primary} />}
    >
      <View style={titleRowStyle}>
        <Text style={placeNameStyle} numberOfLines={1}>
          {placeName}
        </Text>
        {!!status && (
          <Button
            label={DEVICE_STATUS_LABELS[status]}
            variant="secondary"
            size="small"
            onPress={goToDevice}
            icon={
              <Ionicons
                name={status === 'CONNECTED' ? 'wifi' : 'cloud-offline-outline'}
                size={16}
                color={status === 'CONNECTED' ? theme.colors.success : theme.colors.warning}
              />
            }
          />
        )}
      </View>

      {status === 'DISCONNECTED' && (
        <Banner
          tone="warning"
          message="El medidor no está reportando: el consumo y la válvula pueden no estar al día."
          action={{ label: 'Revisar conexión', onPress: goToDevice }}
        />
      )}

      <View style={isCompact ? stackedStyle : splitStyle}>
        <View style={isCompact ? undefined : mainColumnStyle}>
          <ConsumptionCard
            period={period}
            onPeriodChange={setPeriod}
            data={consumption.data}
            loading={consumption.loading}
            error={consumption.error}
            unit={unit}
          />
        </View>
        <View style={isCompact ? stackedStyle : sideColumnStyle}>

      {!!actionError && <Banner tone="error" message={actionError} onClose={() => setActionError(null)} />}
      {!!valve.error && <Banner tone="warning" message={`No pudimos consultar la válvula. ${valve.error.message}`} />}

      {valve.valve ? (
        <ValveCard
          valve={valve.valve}
          command={valve.command}
          opening={opening}
          onClose={() => {
            setActionError(null);
            setClosing(true);
          }}
          onOpen={openValve}
          onDismissCommand={valve.dismissCommand}
          onHistory={() => navigation.navigate('ValveHistory', { placeId, placeName })}
        />
      ) : (
        !valve.loaded && <ActivityIndicator color={theme.colors.primary} />
      )}
      {valve.noDevice && (
        <Text style={mutedStyle}>La válvula aparecerá en cuanto el servicio de válvulas registre el medidor.</Text>
      )}
        </View>
      </View>

      <CloseValveDialog
        visible={closing}
        placeName={placeName}
        requestCode={valve.requestCloseCode}
        confirm={valve.close}
        onDone={() => {
          setClosing(false);
          setOrderSent(true);
        }}
        onCancel={() => setClosing(false)}
      />

      <SuccessModal
        visible={orderSent}
        message="Orden enviada. Esperando que el medidor cierre la válvula."
        onDismiss={handleOrderSent}
        autoCloseDuration={1500}
      />
    </ScrollView>
  );
};

const screenStyle: ViewStyle = { flex: 1, backgroundColor: theme.colors.background };
const contentStyle: ViewStyle = {
  paddingHorizontal: theme.spacing.lg,
  paddingTop: theme.spacing.lg,
  paddingBottom: theme.spacing.huge,
  gap: theme.spacing.lg,
};
const centeredStyle: ViewStyle = { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.colors.background };
const titleRowStyle: ViewStyle = { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: theme.spacing.md };
const placeNameStyle: TextStyle = { ...theme.textStyles.h2, color: theme.colors.textPrimary, flexShrink: 1 };
const mutedStyle: TextStyle = { ...theme.textStyles.caption, color: theme.colors.textMuted, textAlign: 'center' };
/** Phone: one column. Tablet / desktop: the consumption on the left, the valve (and its notices) on the right. */
const stackedStyle: ViewStyle = { gap: theme.spacing.lg };
const splitStyle: ViewStyle = { flexDirection: 'row', alignItems: 'flex-start', gap: theme.spacing.lg };
const mainColumnStyle: ViewStyle = { flex: 3, minWidth: 0 };
const sideColumnStyle: ViewStyle = { flex: 2, minWidth: 0, gap: theme.spacing.lg };
const emptyCardStyle: ViewStyle = { alignItems: 'center', gap: theme.spacing.md, paddingVertical: theme.spacing.xl };
const emptyTitleStyle: TextStyle = { ...theme.textStyles.h2, fontSize: 20, color: theme.colors.textPrimary, textAlign: 'center' };
