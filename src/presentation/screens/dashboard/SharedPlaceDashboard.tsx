import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Platform, RefreshControl, Text, TextStyle, View, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { sharingRepository } from '../../../core/di/container';
import { ConsumptionPeriod } from '../../../domain/consumption/Consumption';
import { DEVICE_STATUS_LABELS } from '../../../domain/devices/deviceStatus';
import { MeasurementUnit } from '../../../domain/places/Place';
import { PlaceAccess } from '../../../domain/sharing/Sharing';
import { can, canControlValve, canSeeValve } from '../../../domain/sharing/sharingRules';
import { toAppError } from '../../../infrastructure/http/httpError';
import { Banner } from '../../components/common/Banner';
import { Button } from '../../components/common/Button';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { PageContainer } from '../../components/common/PageContainer';
import { PageHeader } from '../../components/common/PageHeader';
import { SuccessModal } from '../../components/common/SuccessModal';
import { ConsumptionCard } from '../../components/consumption/ConsumptionCard';
import { permissionSummary } from '../../components/sharing/sharingLabels';
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

type Props = NativeStackScreenProps<MainStackParamList, 'PlaceDashboard'> & { access: PlaceAccess };

const noop = () => undefined;

/**
 * HU-044/045: the panel of a place that belongs to someone else. It only draws what the collaborator may use:
 * consumption always; the meter status with VIEW_DEVICE_STATUS; the valve with VIEW_DEVICE_STATUS or CONTROL_VALVE (and
 * its buttons only with CONTROL_VALVE); the cost with VIEW_BILLS. There are no goals, tariff or sharing here: those
 * belong to the owner. The servers check every call again, so hiding is a courtesy, not the protection.
 */
export const SharedPlaceDashboard: React.FC<Props> = ({ navigation, route, access }) => {
  const { t } = useTranslation();
  const { placeId, placeName = t('dashboard.defaultPlaceName') } = route.params;
  const { isCompact } = useLayout();
  const [period, setPeriod] = useState<ConsumptionPeriod>('DAY');
  const [unit, setUnit] = useState<MeasurementUnit>('LITERS');
  const consumption = useConsumption(placeId, period);

  const [leaving, setLeaving] = useState(false);
  const [leaveBusy, setLeaveBusy] = useState(false);
  const [leaveError, setLeaveError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    // The owner-only place endpoint is closed to collaborators; the shared list carries the unit of the place
    sharingRepository
      .listSharedPlaces()
      .then((list) => {
        const found = list.find((item) => item.place.id === placeId);
        if (active && found) setUnit(found.place.measurementUnit);
      })
      .catch(() => undefined); // liters is a fine fallback
    return () => {
      active = false;
    };
  }, [placeId]);

  const leave = async () => {
    setLeaveBusy(true);
    setLeaveError(null);
    try {
      await sharingRepository.leave(placeId);
      navigation.navigate('Places', { notice: t('sharing.shared.left', { name: placeName }) });
    } catch (e) {
      setLeaveError(toAppError(e).message);
      setLeaving(false);
    } finally {
      setLeaveBusy(false);
    }
  };

  const showStatus = can(access, 'VIEW_DEVICE_STATUS');
  const showValve = canSeeValve(access);
  const showCost = can(access, 'VIEW_BILLS');

  return (
    <PageContainer
      gap={theme.spacing.lg}
      refreshControl={<RefreshControl refreshing={false} onRefresh={consumption.reload} tintColor={theme.colors.primary} />}
    >
      <PageHeader
        back={{ label: t('places.list.title'), onPress: () => navigation.navigate('Places') }}
        caption={t('sharing.dashboard.caption')}
        title={placeName}
        subtitle={permissionSummary(access.permissions)}
        webOnly={false}
        right={
          <>
            {showStatus && <DeviceChip placeId={placeId} />}
            {Platform.OS === 'web' && (
              <Button
                label={t('dashboard.refresh')}
                variant="ghost"
                size="small"
                onPress={consumption.reload}
                icon={<Ionicons name="refresh" size={16} color={theme.colors.primary} />}
              />
            )}
          </>
        }
      />

      {!!leaveError && <Banner tone="error" message={leaveError} onClose={() => setLeaveError(null)} />}

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
          {showCost && <SharedCost placeId={placeId} period={period} />}
        </View>
        <View style={isCompact ? stackedStyle : sideColumnStyle}>
          {showValve && <SharedValve placeId={placeId} placeName={placeName} canControl={canControlValve(access)} navigation={navigation} />}
          <Button label={t('sharing.shared.leave')} variant="secondary" size="small" onPress={() => setLeaving(true)} style={{ alignSelf: 'flex-start' }} />
        </View>
      </View>

      <ConfirmDialog
        visible={leaving}
        title={t('sharing.shared.leaveTitle', { name: placeName })}
        message={t('sharing.shared.leaveText')}
        confirmLabel={t('sharing.shared.leaveConfirm')}
        tone="danger"
        loading={leaveBusy}
        onConfirm={leave}
        onCancel={() => setLeaving(false)}
      />
    </PageContainer>
  );
};

/** VIEW_DEVICE_STATUS: is the meter talking? Its own component so the device is only asked for when it is allowed. */
const DeviceChip: React.FC<{ placeId: string }> = ({ placeId }) => {
  const { t } = useTranslation();
  const { device } = usePlaceDevice(placeId);
  const status = device?.status;
  if (!status) return null;
  return (
    <View style={chipStyle} accessibilityLabel={t('dashboard.meterA11y', { status: DEVICE_STATUS_LABELS[status] })}>
      <Ionicons
        name={status === 'CONNECTED' ? 'wifi' : 'cloud-offline-outline'}
        size={16}
        color={status === 'CONNECTED' ? theme.colors.success : theme.colors.warning}
      />
      <Text style={chipTextStyle}>{t('dashboard.meterChip', { status: DEVICE_STATUS_LABELS[status] })}</Text>
    </View>
  );
};

/** VIEW_BILLS: the estimated cost, without the buttons to change the tariff (that is the owner's). */
const SharedCost: React.FC<{ placeId: string; period: ConsumptionPeriod }> = ({ placeId, period }) => {
  const cost = usePlaceCost(placeId, period);
  return <CostCard period={period} cost={cost.data} loading={cost.loading} error={cost.error} />;
};

/** The valve: seen with VIEW_DEVICE_STATUS or CONTROL_VALVE; opened and closed only with CONTROL_VALVE. */
const SharedValve: React.FC<{
  placeId: string;
  placeName: string;
  canControl: boolean;
  navigation: Props['navigation'];
}> = ({ placeId, placeName, canControl, navigation }) => {
  const { t } = useTranslation();
  const valve = useValve(placeId);
  const [closing, setClosing] = useState(false);
  const [opening, setOpening] = useState(false);
  const [orderSent, setOrderSent] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const handleOrderSent = useCallback(() => setOrderSent(false), []);

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

  return (
    <>
      {!!actionError && <Banner tone="error" message={actionError} onClose={() => setActionError(null)} />}
      {!!valve.error && <Banner tone="warning" message={t('dashboard.valveFailed', { reason: valve.error.message })} />}
      {valve.valve ? (
        <ValveCard
          valve={valve.valve}
          command={valve.command}
          opening={opening}
          readOnly={!canControl}
          onClose={() => {
            setActionError(null);
            setClosing(true);
          }}
          onOpen={canControl ? openValve : noop}
          onDismissCommand={valve.dismissCommand}
          onHistory={() => navigation.navigate('ValveHistory', { placeId, placeName })}
        />
      ) : (
        !valve.loaded && <ActivityIndicator color={theme.colors.primary} />
      )}
      {valve.noDevice && <Text style={mutedStyle}>{t('dashboard.valveSoon')}</Text>}

      {canControl && (
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
      )}
      <SuccessModal visible={orderSent} message={t('dashboard.orderSent')} onDismiss={handleOrderSent} autoCloseDuration={1500} />
    </>
  );
};

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
const stackedStyle: ViewStyle = { gap: theme.spacing.lg };
const splitStyle: ViewStyle = { flexDirection: 'row', alignItems: 'flex-start', gap: theme.spacing.lg };
const mainColumnStyle: ViewStyle = { flex: 3, minWidth: 0, gap: theme.spacing.lg };
const sideColumnStyle: ViewStyle = { flex: 2, minWidth: 0, gap: theme.spacing.lg };
