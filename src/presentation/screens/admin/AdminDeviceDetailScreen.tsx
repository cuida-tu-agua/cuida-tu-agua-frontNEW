import React, { useState } from 'react';
import { ActivityIndicator, Text, TextStyle, View, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ACTION_LABELS, AdminDeviceDetail, badgeOf } from '../../../domain/admin/AdminDevices';
import { formatLastReport } from '../../../domain/devices/deviceStatus';
import { CredentialsSheet } from '../../components/admin/CredentialsSheet';
import { RequireAdmin } from '../../components/admin/RequireAdmin';
import { Banner } from '../../components/common/Banner';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { PageContainer } from '../../components/common/PageContainer';
import { PageHeader } from '../../components/common/PageHeader';
import { useAdminDevice } from '../../hooks/useAdminDevice';
import { MainStackParamList } from '../../navigation/types';
import { theme } from '../../styles/theme';
import { themed } from '../../styles/themeRuntime';

type Props = NativeStackScreenProps<MainStackParamList, 'AdminDeviceDetail'>;

const when = (iso: string | null): string =>
  iso ? new Date(iso).toLocaleString('es-CO', { day: 'numeric', month: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' }) : '—';

export const AdminDeviceDetailScreen: React.FC<Props> = ({ navigation, route }) => (
  <RequireAdmin>
    <Detail deviceId={route.params.deviceId} onBack={() => navigation.navigate('AdminDevices')} />
  </RequireAdmin>
);

const Detail: React.FC<{ deviceId: string; onBack: () => void }> = ({ deviceId, onBack }) => {
  const d = useAdminDevice(deviceId);
  const [askRenew, setAskRenew] = useState(false);
  const [askDecommission, setAskDecommission] = useState(false);

  if (!d.device) {
    return (
      <View style={centerStyle}>
        {d.error ? (
          <>
            <Banner tone="error" message={d.error.message} />
            <Button label="Volver a medidores" variant="secondary" onPress={onBack} />
          </>
        ) : (
          <ActivityIndicator size="large" color={theme.colors.primary} />
        )}
      </View>
    );
  }

  const device = d.device;
  const badge = badgeOf(device);
  const locked = device.placeId !== null || device.decommissioned; // the actions need a device nobody has

  return (
    <PageContainer gap={theme.spacing.lg}>
      <PageHeader
        webOnly={false}
        back={{ label: 'Medidores', onPress: onBack }}
        title={device.serialNumber}
        right={<BadgePill tone={badge.tone} label={badge.label} />}
      />

      {!!d.error && <Banner tone="error" message={d.error.message} onClose={d.dismissError} />}

      {d.issued && (
        <CredentialsSheet devices={[d.issued]} onFinish={d.closeIssued} finishLabel="Cerrar" />
      )}

      <View style={splitStyle}>
        <Card variant="outlined" style={halfStyle}>
          <Text style={sectionTitleStyle}>Datos</Text>
          <Row label="Lugar" value={device.placeId ? `Vinculado desde ${when(device.linkedAt)}` : 'Libre (nadie lo tiene vinculado)'} />
          <Row label="Último reporte" value={device.lastReportAt ? `${when(device.lastReportAt)} (${formatLastReport(device.lastReportAt)})` : 'Nunca ha reportado'} />
          <Row label="Firmware" value={device.firmwareVersion ?? '—'} />
          <Row label="Registrado" value={when(device.createdAt)} />
          <Row label="Token usado por última vez" value={when(device.tokenLastUsedAt)} />
          <Row label="Intentos fallidos de emparejar" value={String(device.failedPairingAttempts)} />
          {device.decommissioned && <Row label="Dado de baja" value={when(device.decommissionedAt)} />}
        </Card>

        <Card variant="outlined" style={halfStyle}>
          <Text style={sectionTitleStyle}>Acciones</Text>
          {device.decommissioned ? (
            <Banner tone="error" message="Este medidor está dado de baja: el servidor ignora sus mensajes y nadie puede vincularlo." />
          ) : device.placeId ? (
            <Banner tone="info" message="Está vinculado a un lugar. Para darlo de baja o cambiarle las credenciales, su dueño debe desvincularlo desde la app." />
          ) : null}

          <ActionRow
            title="Generar credenciales nuevas"
            text="Token y código nuevos; los anteriores dejan de funcionar. Sirve si se perdió la etiqueta o el equipo vuelve de reparación."
            label="Generar"
            variant="secondary"
            disabled={locked}
            onPress={() => setAskRenew(true)}
          />
          <ActionRow
            title="Dar de baja"
            text="El servidor ignora sus mensajes y nadie lo puede vincular. Para equipos robados, dañados o retirados. No se deshace."
            label="Dar de baja"
            variant="danger"
            disabled={locked}
            onPress={() => setAskDecommission(true)}
          />
        </Card>
      </View>

      <Card variant="outlined" style={{ gap: theme.spacing.sm }}>
        <Text style={sectionTitleStyle}>Historial de administración</Text>
        {device.log.length === 0 ? (
          <Text style={mutedStyle}>Todavía no hay acciones registradas.</Text>
        ) : (
          device.log.map((entry, index) => (
            <View key={`${entry.occurredAt}-${index}`} style={logRowStyle}>
              <View style={dotStyle} />
              <View style={{ flex: 1 }}>
                <Text style={logTextStyle}>
                  <Text style={{ fontWeight: '800' }}>{ACTION_LABELS[entry.action]}</Text>
                  {entry.adminName ? ` por ${entry.adminName}` : ''}
                </Text>
                <Text style={mutedStyle}>{when(entry.occurredAt)}</Text>
              </View>
            </View>
          ))
        )}
      </Card>

      <Card variant="outlined" style={{ gap: theme.spacing.sm }}>
        <Text style={sectionTitleStyle}>Lugares donde ha estado</Text>
        {device.places.length === 0 ? (
          <Text style={mutedStyle}>Nunca ha estado vinculado a un lugar.</Text>
        ) : (
          <View style={tableStyle}>
            <View style={[stayRowStyle, headStyle]}>
              <Text style={[headCellStyle, { flex: 3 }]}>Lugar</Text>
              <Text style={[headCellStyle, { flex: 2 }]}>Desde</Text>
              <Text style={[headCellStyle, { flex: 2 }]}>Hasta</Text>
            </View>
            {device.places.map((stay) => (
              <View key={`${stay.placeId}-${stay.from}`} style={[stayRowStyle, bodyStyle]}>
                <Text style={[monoStyle, { flex: 3 }]} numberOfLines={1}>
                  {stay.placeId.slice(0, 8)}
                </Text>
                <Text style={[cellStyle, { flex: 2 }]}>{when(stay.from)}</Text>
                <Text style={[cellStyle, { flex: 2 }]}>{stay.until ? when(stay.until) : 'Sigue vinculado'}</Text>
              </View>
            ))}
          </View>
        )}
      </Card>

      <ConfirmDialog
        visible={askRenew}
        title="¿Generar credenciales nuevas?"
        message={`El token y el código actuales de ${device.serialNumber} dejarán de funcionar al instante. Los nuevos se muestran una sola vez.`}
        confirmLabel="Sí, generar"
        cancelLabel="Cancelar"
        loading={d.busy}
        onConfirm={() => {
          setAskRenew(false);
          void d.regenerate();
        }}
        onCancel={() => setAskRenew(false)}
      />
      <ConfirmDialog
        visible={askDecommission}
        tone="danger"
        title={`¿Dar de baja ${device.serialNumber}?`}
        message="Es definitivo: el servidor ignorará sus mensajes y nadie podrá vincularlo. No se puede deshacer."
        confirmLabel="Sí, dar de baja"
        cancelLabel="No, conservarlo"
        loading={d.busy}
        onConfirm={() => {
          setAskDecommission(false);
          void d.decommission();
        }}
        onCancel={() => setAskDecommission(false)}
      />
    </PageContainer>
  );
};

const BadgePill: React.FC<{ tone: 'good' | 'warn' | 'bad' | 'neutral'; label: string }> = ({ tone, label }) => {
  const colors = {
    good: { fg: theme.colors.success, bg: theme.colors.successBg },
    warn: { fg: theme.colors.textPrimary, bg: theme.colors.warningBg },
    bad: { fg: theme.colors.error, bg: theme.colors.errorBg },
    neutral: { fg: theme.colors.textSecondary, bg: theme.colors.surfaceAlt },
  }[tone];
  return (
    <View style={[pillStyle, { backgroundColor: colors.bg, borderColor: colors.fg }]}>
      <Ionicons name={tone === 'good' ? 'wifi' : tone === 'bad' ? 'ban' : 'cloud-offline-outline'} size={14} color={colors.fg} />
      <Text style={[pillTextStyle, { color: colors.fg }]}>{label}</Text>
    </View>
  );
};

const Row: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <View style={dataRowStyle}>
    <Text style={dataLabelStyle}>{label}</Text>
    <Text style={dataValueStyle}>{value}</Text>
  </View>
);

const ActionRow: React.FC<{
  title: string;
  text: string;
  label: string;
  variant: 'secondary' | 'danger';
  disabled: boolean;
  onPress: () => void;
}> = ({ title, text, label, variant, disabled, onPress }) => (
  <View style={actionRowStyle}>
    <View style={{ flex: 1, minWidth: 200, gap: 2 }}>
      <Text style={actionTitleStyle}>{title}</Text>
      <Text style={mutedStyle}>{text}</Text>
    </View>
    <Button label={label} size="small" variant={variant} disabled={disabled} onPress={onPress} />
  </View>
);

const centerStyle: ViewStyle = themed(() => ({ flex: 1, alignItems: 'center', justifyContent: 'center', gap: theme.spacing.md, padding: theme.spacing.xl, backgroundColor: theme.colors.background }));
const splitStyle: ViewStyle = { flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.lg, alignItems: 'flex-start' };
const halfStyle: ViewStyle = { flexGrow: 1, flexBasis: 340, gap: theme.spacing.sm };
const sectionTitleStyle: TextStyle = themed(() => ({ ...theme.textStyles.h3, fontSize: 19, fontWeight: '800', color: theme.colors.textPrimary }));
const mutedStyle: TextStyle = themed(() => ({ ...theme.textStyles.caption, color: theme.colors.textMuted }));
const dataRowStyle: ViewStyle = { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: theme.spacing.md, paddingVertical: 4 };
const dataLabelStyle: TextStyle = themed(() => ({ ...theme.textStyles.caption, color: theme.colors.textMuted, flexBasis: 160 }));
const dataValueStyle: TextStyle = themed(() => ({ ...theme.textStyles.caption, color: theme.colors.textPrimary, flex: 1, minWidth: 160 }));
const actionRowStyle: ViewStyle = themed(() => ({
  flexDirection: 'row',
  flexWrap: 'wrap',
  alignItems: 'center',
  gap: theme.spacing.md,
  paddingTop: theme.spacing.md,
  borderTopWidth: 1,
  borderTopColor: theme.colors.border,
}));
const actionTitleStyle: TextStyle = themed(() => ({ ...theme.textStyles.caption, fontSize: 15, fontWeight: '800', color: theme.colors.textPrimary }));
const logRowStyle: ViewStyle = { flexDirection: 'row', alignItems: 'flex-start', gap: theme.spacing.md };
const dotStyle: ViewStyle = themed(() => ({ width: 10, height: 10, borderRadius: 5, marginTop: 6, backgroundColor: theme.colors.primary }));
const logTextStyle: TextStyle = themed(() => ({ ...theme.textStyles.caption, color: theme.colors.textPrimary }));
const pillStyle: ViewStyle = { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: theme.spacing.md, paddingVertical: 4, borderRadius: theme.borderRadius.full, borderWidth: 1 };
const pillTextStyle: TextStyle = { ...theme.textStyles.caption, fontSize: 13, fontWeight: '800' };
const tableStyle: ViewStyle = themed(() => ({ borderRadius: theme.borderRadius.medium, borderWidth: 1, borderColor: theme.colors.border, overflow: 'hidden' }));
const stayRowStyle: ViewStyle = { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.md, paddingHorizontal: theme.spacing.md };
const headStyle: ViewStyle = themed(() => ({ height: 38, backgroundColor: theme.colors.surfaceAlt }));
const bodyStyle: ViewStyle = themed(() => ({ minHeight: 44, borderTopWidth: 1, borderTopColor: theme.colors.border }));
const headCellStyle: TextStyle = themed(() => ({ ...theme.textStyles.label, color: theme.colors.textMuted, textTransform: 'uppercase' }));
const cellStyle: TextStyle = themed(() => ({ ...theme.textStyles.caption, color: theme.colors.textSecondary }));
const monoStyle: TextStyle = themed(() => ({ ...theme.textStyles.label, fontSize: 13, color: theme.colors.primary }));
