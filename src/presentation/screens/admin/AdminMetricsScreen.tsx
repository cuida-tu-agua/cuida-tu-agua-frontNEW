import React from 'react';
import { ActivityIndicator, RefreshControl, Text, TextStyle, TouchableOpacity, View, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { PlatformMetrics, unavailableLabels } from '../../../domain/admin/Admin';
import { Banner } from '../../components/common/Banner';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { PageContainer } from '../../components/common/PageContainer';
import { PageHeader } from '../../components/common/PageHeader';
import { RequireAdmin } from '../../components/admin/RequireAdmin';
import { useAdminMetrics } from '../../hooks/useAdminMetrics';
import { MainStackParamList } from '../../navigation/types';
import { theme } from '../../styles/theme';
import { themed } from '../../styles/themeRuntime';

type Props = NativeStackScreenProps<MainStackParamList, 'AdminMetrics'>;

interface Line {
  label: string;
  value: number;
  tone?: 'good' | 'warn';
}

/** HU-062: the platform at a glance. Each block is one section; a section whose service is down says so. */
export const AdminMetricsScreen: React.FC<Props> = ({ navigation }) => (
  <RequireAdmin>
    <Metrics onUsers={() => navigation.navigate('AdminUsers')} />
  </RequireAdmin>
);

const Metrics: React.FC<{ onUsers: () => void }> = ({ onUsers }) => {
  const { metrics, error, loading, reload } = useAdminMetrics();

  if (!metrics) {
    return (
      <View style={centerStyle}>
        {error ? (
          <>
            <Banner tone="error" message={error.message} />
            <Button label="Reintentar" onPress={() => void reload()} />
          </>
        ) : (
          <ActivityIndicator size="large" color={theme.colors.primary} />
        )}
      </View>
    );
  }

  const down = unavailableLabels(metrics.unavailable);
  const { users, places, devices } = metrics;

  return (
    <PageContainer gap={theme.spacing.lg} refreshControl={<RefreshControl refreshing={loading} onRefresh={() => void reload()} tintColor={theme.colors.primary} />}>
      <PageHeader
        webOnly={false}
        title="Resumen de la plataforma"
        subtitle={`Datos actualizados a las ${new Date(metrics.generatedAt).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })}`}
        right={
          <Button
            label="Actualizar"
            size="small"
            variant="secondary"
            loading={loading}
            icon={<Ionicons name="refresh" size={18} color={theme.colors.primary} />}
            onPress={() => void reload()}
          />
        }
      />

      {!!error && <Banner tone="warning" message={`No pudimos actualizar. ${error.message}`} />}
      {down.length > 0 && (
        <Banner tone="warning" title="Datos incompletos" message={`No respondió: ${down.join(', ')}. Los demás números sí están al día.`} />
      )}

      <View style={gridStyle}>
        <Stat title="Cuentas activas" value={users.active} detail={`de ${users.total} cuentas`} flag={users.blocked > 0 ? `${users.blocked} bloqueada${users.blocked === 1 ? '' : 's'}` : undefined} flagTone="bad" />
        <Stat
          title="Medidores conectados"
          value={devices?.active}
          detail={devices ? `de ${devices.total} registrados` : undefined}
          flag={devices && devices.inactive > 0 ? `${devices.inactive} sin conexión` : undefined}
          flagTone="warn"
        />
        <Stat title="Lugares registrados" value={places?.total} detail={places ? `${places.active} con medidor` : undefined} />
        <Stat
          title="Sin verificar"
          value={users.unverified}
          detail="cuentas esperando su código"
          flag={users.unverified > 0 ? 'Pendientes de verificar' : undefined}
          flagTone="warn"
        />
      </View>

      <View style={gridStyle}>
        <Section
          title="Usuarios"
          action={{ label: 'Ver usuarios', onPress: onUsers }}
          lines={[
            { label: 'Cuentas en total', value: users.total },
            { label: 'Activas', value: users.active, tone: 'good' },
            { label: 'Sin verificar el correo', value: users.unverified, tone: users.unverified > 0 ? 'warn' : undefined },
            { label: 'Bloqueadas', value: users.blocked, tone: users.blocked > 0 ? 'warn' : undefined },
          ]}
        />
        <Section title="Medidores" lines={devicesLines(metrics)} />
      </View>
    </PageContainer>
  );
};

const devicesLines = (metrics: PlatformMetrics): Line[] | null =>
  metrics.devices && [
    { label: 'Registrados', value: metrics.devices.total },
    { label: 'Conectados', value: metrics.devices.active, tone: 'good' },
    { label: 'Desconectados', value: metrics.devices.inactive, tone: metrics.devices.inactive > 0 ? 'warn' : undefined },
    { label: 'Vinculados a un lugar', value: metrics.devices.linked },
  ];

/** One number of the top row. A service that did not answer shows a dash and says why, never a zero. */
const Stat: React.FC<{ title: string; value?: number; detail?: string; flag?: string; flagTone?: 'warn' | 'bad' }> = ({ title, value, detail, flag, flagTone }) => (
  <Card variant="outlined" style={statStyle}>
    <Text style={statTitleStyle}>{title}</Text>
    {typeof value === 'number' ? (
      <>
        <Text style={bigNumberStyle}>{value}</Text>
        {!!detail && <Text style={mutedStyle}>{detail}</Text>}
        {!!flag && (
          <View style={flagRowStyle}>
            <Ionicons
              name={flagTone === 'bad' ? 'alert-circle' : 'alert-circle-outline'}
              size={16}
              color={flagTone === 'bad' ? theme.colors.error : theme.colors.warning}
            />
            <Text style={flagTextStyle}>{flag}</Text>
          </View>
        )}
      </>
    ) : (
      <>
        <Text style={bigNumberStyle}>–</Text>
        <Text style={mutedStyle}>No disponible: el servicio no respondió.</Text>
      </>
    )}
  </Card>
);

const Section: React.FC<{ title: string; lines: Line[] | null; action?: { label: string; onPress: () => void } }> = ({ title, lines, action }) => (
  <Card variant="outlined" style={sectionStyle}>
    <View style={sectionHeaderStyle}>
      <Text style={sectionTitleStyle} accessibilityRole="header">
        {title}
      </Text>
      {!!action && (
        <TouchableOpacity onPress={action.onPress} accessibilityRole="link" hitSlop={8}>
          <Text style={linkStyle}>{action.label}</Text>
        </TouchableOpacity>
      )}
    </View>
    {lines ? (
      lines.map((line) => (
        <View key={line.label} style={lineStyle}>
          <Text style={lineLabelStyle}>{line.label}</Text>
          <Text style={[lineValueStyle, line.tone === 'good' && { color: theme.colors.success }, line.tone === 'warn' && { color: theme.colors.warning }]}>
            {line.value}
          </Text>
        </View>
      ))
    ) : (
      <View style={unavailableStyle}>
        <Ionicons name="cloud-offline-outline" size={28} color={theme.colors.textMuted} />
        <Text style={mutedStyle}>No disponible: el servicio no respondió.</Text>
      </View>
    )}
  </Card>
);

const centerStyle: ViewStyle = themed(() => ({
  flex: 1,
  alignItems: 'center',
  justifyContent: 'center',
  padding: theme.spacing.xl,
  gap: theme.spacing.md,
  backgroundColor: theme.colors.background,
}));
const mutedStyle: TextStyle = themed(() => ({ ...theme.textStyles.caption, color: theme.colors.textMuted }));
const gridStyle: ViewStyle = { flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.lg };
const statStyle: ViewStyle = { flexGrow: 1, flexBasis: 200, gap: theme.spacing.xs };
const statTitleStyle: TextStyle = themed(() => ({ ...theme.textStyles.caption, fontWeight: '800', color: theme.colors.textSecondary }));
const bigNumberStyle: TextStyle = themed(() => ({ fontSize: 40, fontWeight: '800', color: theme.colors.textPrimary, lineHeight: 48 }));
const flagRowStyle: ViewStyle = { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 2 };
const flagTextStyle: TextStyle = themed(() => ({ ...theme.textStyles.caption, fontWeight: '800', color: theme.colors.textPrimary }));
const sectionStyle: ViewStyle = { flexGrow: 1, flexBasis: 320, gap: theme.spacing.xs };
const sectionHeaderStyle: ViewStyle = { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: theme.spacing.xs };
const sectionTitleStyle: TextStyle = themed(() => ({ ...theme.textStyles.h3, fontSize: 18, fontWeight: '800', color: theme.colors.textPrimary }));
const linkStyle: TextStyle = themed(() => ({ ...theme.textStyles.caption, fontWeight: '800', color: theme.colors.primary }));
const lineStyle: ViewStyle = themed(() => ({
  flexDirection: 'row',
  justifyContent: 'space-between',
  paddingVertical: theme.spacing.sm,
  borderTopWidth: 1,
  borderTopColor: theme.colors.border,
}));
const lineLabelStyle: TextStyle = themed(() => ({ ...theme.textStyles.caption, color: theme.colors.textSecondary, flex: 1 }));
const lineValueStyle: TextStyle = themed(() => ({ ...theme.textStyles.caption, fontWeight: '800', color: theme.colors.textPrimary }));
const unavailableStyle: ViewStyle = { alignItems: 'center', gap: theme.spacing.sm, paddingVertical: theme.spacing.xl };
