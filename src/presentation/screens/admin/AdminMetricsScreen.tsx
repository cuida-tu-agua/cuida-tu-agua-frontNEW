import React from 'react';
import { ActivityIndicator, RefreshControl, ScrollView, Text, TextStyle, View, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { percent, unavailableLabels } from '../../../domain/admin/Admin';
import { Banner } from '../../components/common/Banner';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { RequireAdmin } from '../../components/admin/RequireAdmin';
import { useAdminMetrics } from '../../hooks/useAdminMetrics';
import { MainStackParamList } from '../../navigation/types';
import { theme } from '../../styles/theme';

type Props = NativeStackScreenProps<MainStackParamList, 'AdminMetrics'>;

interface Line {
  label: string;
  value: number;
  tone?: 'good' | 'warn';
}

/** HU-062: the platform at a glance. Each card is one section; a section whose service is down says so. */
export const AdminMetricsScreen: React.FC<Props> = () => (
  <RequireAdmin>
    <Metrics />
  </RequireAdmin>
);

const Metrics: React.FC = () => {
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

  return (
    <ScrollView
      style={screenStyle}
      contentContainerStyle={contentStyle}
      refreshControl={<RefreshControl refreshing={loading} onRefresh={() => void reload()} tintColor={theme.colors.primary} />}
    >
      <View style={titleRowStyle}>
        <View style={{ flex: 1 }}>
          <Text style={titleStyle}>Métricas de la plataforma</Text>
          <Text style={mutedStyle}>
            Actualizado a las {new Date(metrics.generatedAt).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })}
          </Text>
        </View>
        <Button
          label="Actualizar"
          size="small"
          variant="secondary"
          loading={loading}
          icon={<Ionicons name="refresh" size={18} color={theme.colors.textPrimary} />}
          onPress={() => void reload()}
        />
      </View>

      {!!error && <Banner tone="warning" message={`No pudimos actualizar. ${error.message}`} />}
      {down.length > 0 && (
        <Banner
          tone="warning"
          title="Datos incompletos"
          message={`No respondió: ${down.join(', ')}. Los demás números sí están al día.`}
        />
      )}

      <View style={gridStyle}>
        <StatCard
          icon="people-outline"
          title="Usuarios"
          total={metrics.users.total}
          active={metrics.users.active}
          activeLabel="activos"
          lines={[
            { label: 'Activos (verificados y sin bloqueo)', value: metrics.users.active, tone: 'good' },
            { label: 'Inactivos', value: metrics.users.inactive, tone: 'warn' },
            { label: '· Bloqueados', value: metrics.users.blocked },
            { label: '· Sin verificar', value: metrics.users.unverified },
          ]}
        />
        <StatCard
          icon="home-outline"
          title="Lugares"
          total={metrics.places?.total}
          active={metrics.places?.active}
          activeLabel="con medidor"
          lines={
            metrics.places && [
              { label: 'Activos (con un medidor vinculado)', value: metrics.places.active, tone: 'good' },
              { label: 'Inactivos', value: metrics.places.inactive, tone: 'warn' },
            ]
          }
        />
        <StatCard
          icon="speedometer-outline"
          title="Dispositivos"
          total={metrics.devices?.total}
          active={metrics.devices?.active}
          activeLabel="conectados"
          lines={
            metrics.devices && [
              { label: 'Activos (conectados ahora)', value: metrics.devices.active, tone: 'good' },
              { label: 'Inactivos', value: metrics.devices.inactive, tone: 'warn' },
              { label: '· Vinculados a un lugar', value: metrics.devices.linked },
            ]
          }
        />
      </View>
    </ScrollView>
  );
};

const StatCard: React.FC<{
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  total?: number;
  active?: number;
  activeLabel: string;
  lines?: Line[] | null;
}> = ({ icon, title, total, active, activeLabel, lines }) => {
  const available = typeof total === 'number' && !!lines;
  const share = available ? percent(active ?? 0, total) : 0;

  return (
    <Card variant="outlined" style={cardStyle}>
      <View style={cardHeaderStyle}>
        <View style={iconStyle}>
          <Ionicons name={icon} size={22} color={theme.colors.primary} />
        </View>
        <Text style={cardTitleStyle}>{title}</Text>
      </View>

      {available ? (
        <>
          <Text style={bigNumberStyle}>{total}</Text>
          <View style={barStyle} accessibilityRole="progressbar" accessibilityValue={{ min: 0, max: 100, now: share }}>
            <View style={[barFillStyle, { width: `${share}%` }]} />
          </View>
          <Text style={mutedStyle}>
            {share}% {activeLabel}
          </Text>
          {lines.map((line) => (
            <View key={line.label} style={lineStyle}>
              <Text style={[lineLabelStyle, line.tone === undefined && { color: theme.colors.textMuted }]}>{line.label}</Text>
              <Text
                style={[
                  lineValueStyle,
                  line.tone === 'good' && { color: theme.colors.success },
                  line.tone === 'warn' && { color: theme.colors.warning },
                ]}
              >
                {line.value}
              </Text>
            </View>
          ))}
        </>
      ) : (
        <View style={unavailableStyle}>
          <Ionicons name="cloud-offline-outline" size={28} color={theme.colors.textMuted} />
          <Text style={mutedStyle}>No disponible: el servicio no respondió.</Text>
        </View>
      )}
    </Card>
  );
};

const screenStyle: ViewStyle = { flex: 1, backgroundColor: theme.colors.background };
const contentStyle: ViewStyle = { padding: theme.spacing.lg, paddingBottom: theme.spacing.huge, gap: theme.spacing.lg };
const centerStyle: ViewStyle = {
  flex: 1,
  alignItems: 'center',
  justifyContent: 'center',
  padding: theme.spacing.xl,
  gap: theme.spacing.md,
  backgroundColor: theme.colors.background,
};
const titleRowStyle: ViewStyle = { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.md };
const titleStyle: TextStyle = { ...theme.textStyles.h2, color: theme.colors.textPrimary };
const mutedStyle: TextStyle = { ...theme.textStyles.caption, color: theme.colors.textMuted };
const gridStyle: ViewStyle = { flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.lg };
const cardStyle: ViewStyle = { flexGrow: 1, flexBasis: 260, gap: theme.spacing.sm };
const cardHeaderStyle: ViewStyle = { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.md };
const iconStyle: ViewStyle = {
  width: 40,
  height: 40,
  borderRadius: 20,
  backgroundColor: theme.colors.infoBg,
  alignItems: 'center',
  justifyContent: 'center',
};
const cardTitleStyle: TextStyle = { ...theme.textStyles.h2, fontSize: 18, color: theme.colors.textPrimary };
const bigNumberStyle: TextStyle = { fontSize: 44, fontWeight: '800', color: theme.colors.textPrimary, lineHeight: 52 };
const barStyle: ViewStyle = { height: 8, borderRadius: 4, backgroundColor: theme.colors.grayLight, overflow: 'hidden' };
const barFillStyle: ViewStyle = { height: 8, borderRadius: 4, backgroundColor: theme.colors.success };
const lineStyle: ViewStyle = {
  flexDirection: 'row',
  justifyContent: 'space-between',
  paddingVertical: theme.spacing.xs,
  borderTopWidth: 1,
  borderTopColor: theme.colors.border,
};
const lineLabelStyle: TextStyle = { ...theme.textStyles.caption, color: theme.colors.textSecondary, flex: 1 };
const lineValueStyle: TextStyle = { ...theme.textStyles.caption, fontWeight: '800', color: theme.colors.textPrimary };
const unavailableStyle: ViewStyle = { alignItems: 'center', gap: theme.spacing.sm, paddingVertical: theme.spacing.xl };
