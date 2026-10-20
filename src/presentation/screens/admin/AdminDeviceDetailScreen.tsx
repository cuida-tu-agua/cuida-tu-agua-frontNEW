import React, { useState } from 'react';
import { ActivityIndicator, Text, TextStyle, View, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
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
import { formatDateTime } from '../../../i18n/format';
import { useAdminDevice } from '../../hooks/useAdminDevice';
import { MainStackParamList } from '../../navigation/types';
import { theme } from '../../styles/theme';
import { themed } from '../../styles/themeRuntime';

type Props = NativeStackScreenProps<MainStackParamList, 'AdminDeviceDetail'>;

const when = (iso: string | null): string =>
  iso ? formatDateTime(iso) : '—';

export const AdminDeviceDetailScreen: React.FC<Props> = ({ navigation, route }) => (
  <RequireAdmin>
    <Detail deviceId={route.params.deviceId} onBack={() => navigation.navigate('AdminDevices')} />
  </RequireAdmin>
);

const Detail: React.FC<{ deviceId: string; onBack: () => void }> = ({ deviceId, onBack }) => {
  const { t } = useTranslation();
  const d = useAdminDevice(deviceId);
  const [askRenew, setAskRenew] = useState(false);
  const [askDecommission, setAskDecommission] = useState(false);

  if (!d.device) {
    return (
      <View style={centerStyle}>
        {d.error ? (
          <>
            <Banner tone="error" message={d.error.message} />
            <Button label={t('adminDeviceDetail.backToList')} variant="secondary" onPress={onBack} />
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
        back={{ label: t('adminDeviceDetail.backLabel'), onPress: onBack }}
        title={device.serialNumber}
        right={<BadgePill tone={badge.tone} label={badge.label} />}
      />

      {!!d.error && <Banner tone="error" message={d.error.message} onClose={d.dismissError} />}

      {d.issued && (
        <CredentialsSheet devices={[d.issued]} onFinish={d.closeIssued} finishLabel={t('adminDeviceDetail.close')} />
      )}

      <View style={splitStyle}>
        <Card variant="outlined" style={halfStyle}>
          <Text style={sectionTitleStyle}>{t('adminDeviceDetail.data')}</Text>
          <Row label={t('adminDeviceDetail.place')} value={device.placeId ? t('adminDeviceDetail.linkedSince', { date: when(device.linkedAt) }) : t('adminDeviceDetail.freePlace')} />
          <Row label={t('adminDeviceDetail.lastReport')} value={device.lastReportAt ? `${when(device.lastReportAt)} (${formatLastReport(device.lastReportAt)})` : t('adminDeviceDetail.neverReported')} />
          <Row label={t('adminDeviceDetail.firmware')} value={device.firmwareVersion ?? '—'} />
          <Row label={t('adminDeviceDetail.registered')} value={when(device.createdAt)} />
          <Row label={t('adminDeviceDetail.tokenLastUsed')} value={when(device.tokenLastUsedAt)} />
          <Row label={t('adminDeviceDetail.failedAttempts')} value={String(device.failedPairingAttempts)} />
          {device.decommissioned && <Row label={t('adminDeviceDetail.decommissioned')} value={when(device.decommissionedAt)} />}
        </Card>

        <Card variant="outlined" style={halfStyle}>
          <Text style={sectionTitleStyle}>{t('adminDeviceDetail.actions')}</Text>
          {device.decommissioned ? (
            <Banner tone="error" message={t('adminDeviceDetail.decommissionedBanner')} />
          ) : device.placeId ? (
            <Banner tone="info" message={t('adminDeviceDetail.linkedBanner')} />
          ) : null}

          <ActionRow
            title={t('adminDeviceDetail.renewTitle')}
            text={t('adminDeviceDetail.renewText')}
            label={t('adminDeviceDetail.renewButton')}
            variant="secondary"
            disabled={locked}
            onPress={() => setAskRenew(true)}
          />
          <ActionRow
            title={t('adminDeviceDetail.decommissionTitle')}
            text={t('adminDeviceDetail.decommissionText')}
            label={t('adminDeviceDetail.decommissionButton')}
            variant="danger"
            disabled={locked}
            onPress={() => setAskDecommission(true)}
          />
        </Card>
      </View>

      <Card variant="outlined" style={{ gap: theme.spacing.sm }}>
        <Text style={sectionTitleStyle}>{t('adminDeviceDetail.history')}</Text>
        {device.log.length === 0 ? (
          <Text style={mutedStyle}>{t('adminDeviceDetail.noHistory')}</Text>
        ) : (
          device.log.map((entry, index) => (
            <View key={`${entry.occurredAt}-${index}`} style={logRowStyle}>
              <View style={dotStyle} />
              <View style={{ flex: 1 }}>
                <Text style={logTextStyle}>
                  <Text style={{ fontWeight: '800' }}>{ACTION_LABELS[entry.action]}</Text>
                  {entry.adminName ? t('adminDeviceDetail.byAdmin', { name: entry.adminName }) : ''}
                </Text>
                <Text style={mutedStyle}>{when(entry.occurredAt)}</Text>
              </View>
            </View>
          ))
        )}
      </Card>

      <Card variant="outlined" style={{ gap: theme.spacing.sm }}>
        <Text style={sectionTitleStyle}>{t('adminDeviceDetail.stays')}</Text>
        {device.places.length === 0 ? (
          <Text style={mutedStyle}>{t('adminDeviceDetail.noStays')}</Text>
        ) : (
          <View style={tableStyle}>
            <View style={[stayRowStyle, headStyle]}>
              <Text style={[headCellStyle, { flex: 3 }]}>{t('adminDeviceDetail.place')}</Text>
              <Text style={[headCellStyle, { flex: 2 }]}>{t('adminDeviceDetail.from')}</Text>
              <Text style={[headCellStyle, { flex: 2 }]}>{t('adminDeviceDetail.until')}</Text>
            </View>
            {device.places.map((stay) => (
              <View key={`${stay.placeId}-${stay.from}`} style={[stayRowStyle, bodyStyle]}>
                <Text style={[monoStyle, { flex: 3 }]} numberOfLines={1}>
                  {stay.placeId.slice(0, 8)}
                </Text>
                <Text style={[cellStyle, { flex: 2 }]}>{when(stay.from)}</Text>
                <Text style={[cellStyle, { flex: 2 }]}>{stay.until ? when(stay.until) : t('adminDeviceDetail.stillLinked')}</Text>
              </View>
            ))}
          </View>
        )}
      </Card>

      <ConfirmDialog
        visible={askRenew}
        title={t('adminDeviceDetail.renewDialogTitle')}
        message={t('adminDeviceDetail.renewDialogMessage', { serial: device.serialNumber })}
        confirmLabel={t('adminDeviceDetail.renewConfirm')}
        cancelLabel={t('adminDeviceDetail.cancel')}
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
        title={t('adminDeviceDetail.decommissionDialogTitle', { serial: device.serialNumber })}
        message={t('adminDeviceDetail.decommissionDialogMessage')}
        confirmLabel={t('adminDeviceDetail.decommissionConfirm')}
        cancelLabel={t('adminDeviceDetail.keep')}
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
