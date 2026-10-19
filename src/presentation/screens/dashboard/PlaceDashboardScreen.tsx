import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Platform, Pressable, RefreshControl, Text, TextStyle, View, ViewStyle } from 'react-native';
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
import { PageContainer } from '../../components/common/PageContainer';
import { PageHeader } from '../../components/common/PageHeader';
import { TipsPanel } from '../../components/tips/TipsPanel';
import { SuccessModal } from '../../components/common/SuccessModal';
import { ConsumptionCard } from '../../components/consumption/ConsumptionCard';
import { CostCard } from '../../components/tariffs/CostCard';
import { CloseValveDialog } from '../../components/valve/CloseValveDialog';
import { ValveCard } from '../../components/valve/ValveCard';
import { useConsumption } from '../../hooks/useConsumption';
import { usePlaceCost } from '../../hooks/usePlaceCost';
import { usePlaceDevice } from '../../hooks/usePlaceDevice';
import { useValve } from '../../hooks/useValve';
import { useLayout } from '../../layout/breakpoints';
import { MainStackParamList } from '../../navigation/types';
import { theme } from '../../styles/theme';
import { themed } from '../../styles/themeRuntime';

type Props = NativeStackScreenProps<MainStackParamList, 'PlaceDashboard'>;

export const PlaceDashboardScreen: React.FC<Props> = ({ navigation, route }) => {
  const { placeId, placeName } = route.params;
  const { isCompact } = useLayout();
  const [period, setPeriod] = useState<ConsumptionPeriod>('DAY');
  const [unit, setUnit] = useState<MeasurementUnit>('LITERS');

  const device = usePlaceDevice(placeId);
  const consumption = useConsumption(placeId, period);
  const cost = usePlaceCost(placeId, period);
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
    void cost.reload();
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

  const isWeb = Platform.OS === 'web';
  const status = device.device?.status;
  const back = { label: 'Mis lugares', onPress: () => navigation.navigate('Places') };
  const tipsPanel = isWeb ? <TipsPanel placeId={placeId} onOpenFavorites={() => navigation.navigate('Tips', { placeId })} /> : null;

  if (!device.loaded) {
    return (
      <View style={centeredStyle}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  if (!device.device && !device.error) {
    return (
      <PageContainer>
        <PageHeader back={back} caption="Panel del lugar" title={placeName} webOnly={false} />
        <View style={isCompact ? stackedStyle : splitStyle}>
        <View style={isCompact ? stackedStyle : mainColumnStyle}>
        <Card variant="outlined" style={emptyCardStyle}>
          <Ionicons name="speedometer-outline" size={44} color={theme.colors.primary} />
          <Text style={emptyTitleStyle}>Vincula un medidor para ver tu consumo</Text>
          <Text style={mutedStyle}>Con el medidor verás cuánta agua usas y podrás abrir o cerrar el paso desde aquí.</Text>
          <Button label="Vincular medidor" onPress={goToDevice} style={{ alignSelf: 'stretch' }} />
        </Card>
        </View>
        {!!tipsPanel && <View style={isCompact ? stackedStyle : sideColumnStyle}>{tipsPanel}</View>}
        </View>
      </PageContainer>
    );
  }

  return (
    <PageContainer refreshControl={<RefreshControl refreshing={false} onRefresh={refreshAll} tintColor={theme.colors.primary} />}>
      <PageHeader
        back={back}
        caption="Panel del lugar"
        title={placeName}
        webOnly={false}
        right={
          <>
            {!!status && (
              <Pressable
                onPress={goToDevice}
                style={chipStyle}
                accessibilityRole="button"
                accessibilityLabel={`Medidor: ${DEVICE_STATUS_LABELS[status]}. Ver el medidor`}
              >
                <Ionicons
                  name={status === 'CONNECTED' ? 'wifi' : 'cloud-offline-outline'}
                  size={16}
                  color={status === 'CONNECTED' ? theme.colors.success : theme.colors.warning}
                />
                <Text style={chipTextStyle}>Medidor: {DEVICE_STATUS_LABELS[status]}</Text>
              </Pressable>
            )}
            {isWeb && (
              <Button
                label="Actualizar"
                variant="ghost"
                size="small"
                onPress={refreshAll}
                icon={<Ionicons name="refresh" size={16} color={theme.colors.primary} />}
              />
            )}
          </>
        }
      />

      {status === 'DISCONNECTED' && (
        <Banner
          tone="warning"
          message="El medidor no está reportando: el consumo y la válvula pueden no estar al día."
          action={{ label: 'Revisar conexión', onPress: goToDevice }}
        />
      )}

      <View style={isCompact ? stackedStyle : splitStyle}>
        <View style={isCompact ? stackedStyle : mainColumnStyle}>
          <ConsumptionCard
            period={period}
            onPeriodChange={setPeriod}
            data={consumption.data}
            loading={consumption.loading}
            error={consumption.error}
            unit={unit}
          />
          <CostCard
            period={period}
            cost={cost.data}
            loading={cost.loading}
            error={cost.error}
            onConfigure={() => navigation.navigate('PlaceTariff', { placeId, placeName })}
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
      {tipsPanel}
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
    </PageContainer>
  );
};

const centeredStyle: ViewStyle = themed(() => ({ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.colors.background }));
const chipStyle: ViewStyle = themed(() => ({
  flexDirection: 'row',
  alignItems: 'center',
  gap: theme.spacing.sm,
  minHeight: 44,
  paddingHorizontal: theme.spacing.md,
  borderRadius: theme.borderRadius.medium,
  borderWidth: 1,
  borderColor: theme.colors.border,
  backgroundColor: theme.colors.surface,
}));
const chipTextStyle: TextStyle = themed(() => ({ ...theme.textStyles.caption, fontWeight: '800', color: theme.colors.textPrimary }));
const mutedStyle: TextStyle = themed(() => ({ ...theme.textStyles.caption, color: theme.colors.textMuted, textAlign: 'center' }));
/** Phone: one column. Tablet / desktop: the consumption on the left, the valve (and its notices) on the right. */
const stackedStyle: ViewStyle = { gap: theme.spacing.lg };
const splitStyle: ViewStyle = { flexDirection: 'row', alignItems: 'flex-start', gap: theme.spacing.lg };
const mainColumnStyle: ViewStyle = { flex: 3, minWidth: 0, gap: theme.spacing.lg };
const sideColumnStyle: ViewStyle = { flex: 2, minWidth: 0, gap: theme.spacing.lg };
const emptyCardStyle: ViewStyle = { alignItems: 'center', gap: theme.spacing.md, paddingVertical: theme.spacing.xl };
const emptyTitleStyle: TextStyle = themed(() => ({ ...theme.textStyles.h2, fontSize: 20, color: theme.colors.textPrimary, textAlign: 'center' }));
