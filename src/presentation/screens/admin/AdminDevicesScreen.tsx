import React from 'react';
import { ActivityIndicator, Pressable, Text, TextStyle, View, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import {
  AdminDeviceBadge,
  AdminDeviceCounts,
  AdminDeviceRow,
  LINK_FILTERS,
  STATUS_FILTERS,
  badgeOf,
} from '../../../domain/admin/AdminDevices';
import { formatLastReport } from '../../../domain/devices/deviceStatus';
import { FilterChips } from '../../components/admin/FilterChips';
import { RequireAdmin } from '../../components/admin/RequireAdmin';
import { Banner } from '../../components/common/Banner';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { Input } from '../../components/common/Input';
import { PageContainer } from '../../components/common/PageContainer';
import { PageHeader } from '../../components/common/PageHeader';
import { useAdminDevices } from '../../hooks/useAdminDevices';
import { useLayout } from '../../layout/breakpoints';
import { MainStackParamList } from '../../navigation/types';
import { theme } from '../../styles/theme';
import { themed } from '../../styles/themeRuntime';

type Props = NativeStackScreenProps<MainStackParamList, 'AdminDevices'>;

/** Admin panel of meters (Figma "Medidores"): the cards with the numbers, the search, two filters and the table. */
export const AdminDevicesScreen: React.FC<Props> = ({ navigation }) => (
  <RequireAdmin>
    <Devices
      onCreate={() => navigation.navigate('AdminDeviceCreate')}
      onOpen={(row) => navigation.navigate('AdminDeviceDetail', { deviceId: row.id, serialNumber: row.serialNumber })}
    />
  </RequireAdmin>
);

const Devices: React.FC<{ onCreate: () => void; onOpen: (row: AdminDeviceRow) => void }> = ({ onCreate, onOpen }) => {
  const { isCompact } = useLayout();
  const devices = useAdminDevices();
  const rows = devices.data?.items ?? [];

  return (
    <PageContainer gap={theme.spacing.md}>
      <PageHeader
        webOnly={false}
        title="Medidores"
        subtitle="Equipos registrados en la plataforma y su estado."
        right={
          <Button
            label="Alta de fábrica"
            size="medium"
            onPress={onCreate}
            icon={<Ionicons name="add" size={20} color={theme.colors.textOnPrimary} />}
          />
        }
      />

      <Counters counts={devices.data?.counts} />

      <Input
        placeholder="Buscar por serial (SW-ESP32-...)"
        value={devices.search}
        onChangeText={devices.setSearch}
        maxLength={32}
        autoCapitalize="characters"
        leftIcon={<Ionicons name="search" size={18} color={theme.colors.textMuted} />}
        style={{ marginBottom: 0 }}
      />
      <FilterChips options={STATUS_FILTERS} value={devices.status} onChange={devices.setStatus} accessibilityLabel="Filtrar por estado" />
      <FilterChips options={LINK_FILTERS} value={devices.link} onChange={devices.setLink} accessibilityLabel="Filtrar por vínculo" />

      {!!devices.error && (
        <Banner tone="error" message={devices.error.message} action={{ label: 'Reintentar', onPress: () => void devices.reload() }} onClose={devices.dismissError} />
      )}

      {!devices.data && devices.loading ? (
        <ActivityIndicator size="large" color={theme.colors.primary} style={{ marginTop: theme.spacing.xxl }} />
      ) : rows.length === 0 ? (
        <View style={emptyStyle}>
          <Ionicons name="hardware-chip-outline" size={44} color={theme.colors.textMuted} />
          <Text style={emptyTextStyle}>
            {devices.search || devices.status !== 'ALL' || devices.link !== 'ALL' ? 'No hay medidores con ese filtro.' : 'Todavía no hay medidores registrados.'}
          </Text>
        </View>
      ) : (
        <View style={[tableStyle, devices.loading && { opacity: 0.6 }]}>
          {!isCompact && (
            <View style={[rowStyle, headStyle]}>
              <Text style={[headCellStyle, serialCol]}>Serial</Text>
              <Text style={[headCellStyle, statusCol]}>Estado</Text>
              <Text style={[headCellStyle, placeCol]}>Lugar</Text>
              <Text style={[headCellStyle, reportCol]}>Último reporte</Text>
              <Text style={[headCellStyle, firmwareCol]}>Firmware</Text>
              <View style={chevronCol} />
            </View>
          )}
          {rows.map((row) => (
            <DeviceRow key={row.id} row={row} compact={isCompact} onPress={() => onOpen(row)} />
          ))}
        </View>
      )}

      {devices.data && devices.data.totalItems > 0 && (
        <View style={pagerStyle}>
          <Text style={mutedStyle}>
            {devices.data.totalItems} en total · página {devices.data.page + 1} de {Math.max(devices.data.totalPages, 1)}
          </Text>
          <View style={pagerButtonsStyle}>
            <Button label="Anterior" size="small" variant="secondary" disabled={devices.page <= 0 || devices.loading} onPress={() => devices.goTo(devices.page - 1)} />
            <Button
              label="Siguiente"
              size="small"
              variant="secondary"
              disabled={devices.page + 1 >= devices.data.totalPages || devices.loading}
              onPress={() => devices.goTo(devices.page + 1)}
            />
          </View>
        </View>
      )}
    </PageContainer>
  );
};

const Counters: React.FC<{ counts?: AdminDeviceCounts }> = ({ counts }) => {
  const cards: { title: string; value?: number; detail?: string; tone?: 'good' | 'warn' | 'bad' }[] = [
    { title: 'Registrados', value: counts?.registered, detail: counts ? `${counts.linked} vinculados` : undefined },
    { title: 'Conectados', value: counts?.connected, tone: 'good' },
    { title: 'Desconectados', value: counts?.disconnected, tone: 'warn' },
    { title: 'Nunca han reportado', value: counts?.neverReported },
    { title: 'Dados de baja', value: counts?.decommissioned, tone: 'bad' },
  ];
  return (
    <View style={countersStyle}>
      {cards.map((card) => (
        <Card key={card.title} variant="outlined" style={counterStyle}>
          <Text style={counterTitleStyle}>{card.title}</Text>
          <Text
            style={[
              counterValueStyle,
              card.tone === 'good' && { color: theme.colors.success },
              card.tone === 'warn' && { color: theme.colors.warning },
              card.tone === 'bad' && { color: theme.colors.error },
            ]}
          >
            {card.value ?? '–'}
          </Text>
          {!!card.detail && <Text style={mutedStyle}>{card.detail}</Text>}
        </Card>
      ))}
    </View>
  );
};

const TONES = (): Record<AdminDeviceBadge['tone'], { fg: string; bg: string }> => ({
  good: { fg: theme.colors.success, bg: theme.colors.successBg },
  warn: { fg: theme.colors.textPrimary, bg: theme.colors.warningBg },
  bad: { fg: theme.colors.error, bg: theme.colors.errorBg },
  neutral: { fg: theme.colors.textSecondary, bg: theme.colors.surfaceAlt },
});

const StatusPill: React.FC<{ row: AdminDeviceRow }> = ({ row }) => {
  const badge = badgeOf(row);
  const tone = TONES()[badge.tone];
  return (
    <View style={[pillStyle, { backgroundColor: tone.bg, borderColor: tone.fg }]}>
      <Text style={[pillTextStyle, { color: tone.fg }]}>{badge.label}</Text>
    </View>
  );
};

const DeviceRow: React.FC<{ row: AdminDeviceRow; compact: boolean; onPress: () => void }> = ({ row, compact, onPress }) => {
  const report = row.lastReportAt ? formatLastReport(row.lastReportAt) : 'nunca';
  const firmware = row.firmwareVersion ?? '—';

  if (compact) {
    return (
      <Pressable onPress={onPress} style={cardRowStyle} accessibilityRole="button" accessibilityLabel={`Abrir el medidor ${row.serialNumber}`}>
        <View style={{ flex: 1, gap: 4 }}>
          <Text style={serialStyle}>{row.serialNumber}</Text>
          <View style={cardMetaStyle}>
            <StatusPill row={row} />
            <Text style={cellStyle}>{row.linked ? 'Vinculado' : 'Libre'}</Text>
          </View>
          <Text style={mutedStyle}>Último reporte: {report} · Firmware {firmware}</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color={theme.colors.textMuted} />
      </Pressable>
    );
  }

  return (
    <Pressable onPress={onPress} style={[rowStyle, bodyStyle]} accessibilityRole="button" accessibilityLabel={`Abrir el medidor ${row.serialNumber}`}>
      <Text style={[serialStyle, serialCol]}>{row.serialNumber}</Text>
      <View style={statusCol}>
        <StatusPill row={row} />
      </View>
      <Text style={[cellStyle, placeCol]}>{row.linked ? 'Vinculado' : 'Libre'}</Text>
      <Text style={[cellStyle, reportCol]}>{report}</Text>
      <Text style={[cellStyle, firmwareCol]}>{firmware}</Text>
      <View style={chevronCol}>
        <Ionicons name="chevron-forward" size={18} color={theme.colors.textMuted} />
      </View>
    </Pressable>
  );
};

const countersStyle: ViewStyle = { flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.md };
const counterStyle: ViewStyle = { flexGrow: 1, flexBasis: 170, gap: 2 };
const counterTitleStyle: TextStyle = themed(() => ({ ...theme.textStyles.caption, color: theme.colors.textSecondary }));
const counterValueStyle: TextStyle = themed(() => ({ fontSize: 34, lineHeight: 42, fontWeight: '800', color: theme.colors.textPrimary }));
const mutedStyle: TextStyle = themed(() => ({ ...theme.textStyles.caption, color: theme.colors.textMuted }));
const tableStyle: ViewStyle = themed(() => ({
  backgroundColor: theme.colors.surface,
  borderRadius: theme.borderRadius.medium,
  borderWidth: 1,
  borderColor: theme.colors.border,
  overflow: 'hidden',
}));
const rowStyle: ViewStyle = { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.md, paddingHorizontal: theme.spacing.lg };
const headStyle: ViewStyle = themed(() => ({ height: 40, backgroundColor: theme.colors.surfaceAlt }));
const bodyStyle: ViewStyle = themed(() => ({ minHeight: 52, borderTopWidth: 1, borderTopColor: theme.colors.border }));
const headCellStyle: TextStyle = themed(() => ({ ...theme.textStyles.label, color: theme.colors.textMuted, textTransform: 'uppercase' }));
const serialCol: TextStyle & ViewStyle = { flex: 3 };
const statusCol: ViewStyle = { flex: 2.4, alignItems: 'flex-start' };
const placeCol: TextStyle & ViewStyle = { flex: 2 };
const reportCol: TextStyle & ViewStyle = { flex: 2.4 };
const firmwareCol: TextStyle & ViewStyle = { flex: 1.6 };
const chevronCol: ViewStyle = { width: 24, alignItems: 'flex-end' };
const cellStyle: TextStyle = themed(() => ({ ...theme.textStyles.caption, color: theme.colors.textSecondary }));
const serialStyle: TextStyle = themed(() => ({ ...theme.textStyles.label, fontSize: 14, color: theme.colors.textPrimary }));
const pillStyle: ViewStyle = { paddingHorizontal: theme.spacing.md, paddingVertical: 3, borderRadius: theme.borderRadius.full, borderWidth: 1 };
const pillTextStyle: TextStyle = { ...theme.textStyles.caption, fontSize: 13, fontWeight: '800' };
const cardRowStyle: ViewStyle = themed(() => ({
  flexDirection: 'row',
  alignItems: 'center',
  gap: theme.spacing.md,
  padding: theme.spacing.lg,
  borderTopWidth: 1,
  borderTopColor: theme.colors.border,
}));
const cardMetaStyle: ViewStyle = { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.md };
const emptyStyle: ViewStyle = { alignItems: 'center', gap: theme.spacing.md, paddingVertical: theme.spacing.huge };
const emptyTextStyle: TextStyle = themed(() => ({ ...theme.textStyles.caption, color: theme.colors.textSecondary, textAlign: 'center' }));
const pagerStyle: ViewStyle = { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: theme.spacing.md };
const pagerButtonsStyle: ViewStyle = { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.md };
