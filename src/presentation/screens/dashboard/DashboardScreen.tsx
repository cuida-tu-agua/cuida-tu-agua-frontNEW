import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../styles/theme';
import { Card, Logo } from '../../components/common';

// ─────────────────────────────────────────────────────────────
// BETA: datos de prueba. Reemplazar por la API cuando exista.
// ─────────────────────────────────────────────────────────────
type Period = 'day' | 'week' | 'month';
type ValveState = 'open' | 'closed' | 'unknown';

interface ChartPoint {
  label: string;
  liters: number;
}

const MOCK_DATA: Record<Period, { total: number; previous: number; points: ChartPoint[] }> = {
  day: {
    total: 312,
    previous: 348,
    points: [
      { label: '0h', liters: 4 }, { label: '3h', liters: 2 }, { label: '6h', liters: 48 },
      { label: '9h', liters: 36 }, { label: '12h', liters: 62 }, { label: '15h', liters: 28 },
      { label: '18h', liters: 84 }, { label: '21h', liters: 48 },
    ],
  },
  week: {
    total: 2140,
    previous: 2010,
    points: [
      { label: 'L', liters: 298 }, { label: 'M', liters: 276 }, { label: 'X', liters: 330 },
      { label: 'J', liters: 312 }, { label: 'V', liters: 290 }, { label: 'S', liters: 356 },
      { label: 'D', liters: 278 },
    ],
  },
  month: {
    total: 7420,
    previous: 8100,
    points: [
      { label: 'S1', liters: 2050 }, { label: 'S2', liters: 1890 },
      { label: 'S3', liters: 2140 }, { label: 'S4', liters: 1340 },
    ],
  },
};

const MOCK_STATUS = {
  placeName: 'Casa principal',
  flowLpm: 6.4, // 0 = sin flujo
  valve: 'open' as ValveState,
  deviceOnline: true,
  monthlyGoal: 9000,
  monthConsumed: 7420,
  daysLeft: 8,
  unreadAlerts: 2,
  lastUpdate: new Date(),
};

const PERIOD_OPTIONS: { key: Period; label: string }[] = [
  { key: 'day', label: 'Día' },
  { key: 'week', label: 'Semana' },
  { key: 'month', label: 'Mes' },
];

const PERIOD_CAPTION: Record<Period, string> = {
  day: 'Consumo de hoy',
  week: 'Consumo de esta semana',
  month: 'Consumo de este mes',
};

const VALVE_INFO: Record<ValveState, { label: string; color: string; bg: string; icon: keyof typeof Ionicons.glyphMap }> = {
  open: { label: 'Abierta', color: theme.colors.success, bg: theme.colors.successBg, icon: 'water' },
  closed: { label: 'Cerrada', color: theme.colors.error, bg: theme.colors.errorBg, icon: 'close-circle' },
  unknown: { label: 'Sin comunicación', color: theme.colors.textMuted, bg: theme.colors.grayLight, icon: 'help-circle' },
};

const formatLiters = (value: number) => value.toLocaleString('es-CO');
const formatTime = (date: Date) =>
  date.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' });

interface DashboardScreenProps {
  userName?: string;
  onNotificationsPress?: () => void;
}

export const DashboardScreen: React.FC<DashboardScreenProps> = ({
  userName = 'Usuario',
  onNotificationsPress,
}) => {
  const insets = useSafeAreaInsets();
  const [period, setPeriod] = useState<Period>('day'); // HU-016: "Día" preseleccionado
  const [selectedBar, setSelectedBar] = useState<number | null>(null);
  const [lastUpdate, setLastUpdate] = useState(MOCK_STATUS.lastUpdate);

  const data = MOCK_DATA[period];
  const maxLiters = useMemo(() => Math.max(...data.points.map((p) => p.liters), 1), [data]);
  const diffPct = Math.round(((data.total - data.previous) / data.previous) * 100);
  const isSaving = diffPct <= 0;

  const goalPct = Math.round((MOCK_STATUS.monthConsumed / MOCK_STATUS.monthlyGoal) * 100);
  const goalColor =
    goalPct >= 100 ? theme.colors.error : goalPct >= 80 ? theme.colors.warning : theme.colors.primary;

  const valve = VALVE_INFO[MOCK_STATUS.valve];
  const hasFlow = MOCK_STATUS.flowLpm > 0;

  const handlePeriodChange = (p: Period) => {
    setPeriod(p);
    setSelectedBar(null);
  };

  return (
    <View style={[containerStyle, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <ScrollView contentContainerStyle={contentStyle} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={headerStyle}>
          <View style={headerLeftStyle}>
            <Logo size={40} />
            <View>
              <Text style={greetingStyle}>Hola, {userName}</Text>
              <View style={placeRowStyle}>
                <Ionicons name="home-outline" size={14} color={theme.colors.textSecondary} />
                <Text style={placeTextStyle}>{MOCK_STATUS.placeName}</Text>
                <View style={betaBadgeStyle}>
                  <Text style={betaTextStyle}>BETA</Text>
                </View>
              </View>
            </View>
          </View>

          <TouchableOpacity
            style={bellButtonStyle}
            onPress={onNotificationsPress}
            accessibilityLabel={`Notificaciones, ${MOCK_STATUS.unreadAlerts} sin leer`}
          >
            <Ionicons name="notifications-outline" size={22} color={theme.colors.textPrimary} />
            {MOCK_STATUS.unreadAlerts > 0 && (
              <View style={bellBadgeStyle}>
                <Text style={bellBadgeTextStyle}>{MOCK_STATUS.unreadAlerts}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Selector de período (HU-016) */}
        <View style={segmentedStyle}>
          {PERIOD_OPTIONS.map((opt) => {
            const active = opt.key === period;
            return (
              <TouchableOpacity
                key={opt.key}
                style={[segmentStyle, active && segmentActiveStyle]}
                onPress={() => handlePeriodChange(opt.key)}
                accessibilityRole="button"
                accessibilityState={{ selected: active }}
              >
                <Text style={[segmentTextStyle, active && segmentTextActiveStyle]}>{opt.label}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Consumo + gráfica (HU-017) */}
        <Card style={sectionCardStyle}>
          <Text style={captionStyle}>{PERIOD_CAPTION[period]}</Text>
          <View style={totalRowStyle}>
            <Text style={totalValueStyle}>{formatLiters(data.total)}</Text>
            <Text style={totalUnitStyle}>L</Text>
          </View>
          <View style={[trendChipStyle, { backgroundColor: isSaving ? theme.colors.successBg : theme.colors.warningBg }]}>
            <Ionicons
              name={isSaving ? 'trending-down' : 'trending-up'}
              size={14}
              color={isSaving ? theme.colors.success : theme.colors.warning}
            />
            <Text style={[trendTextStyle, { color: isSaving ? theme.colors.success : theme.colors.warning }]}>
              {diffPct > 0 ? '+' : ''}{diffPct}% vs período anterior
            </Text>
          </View>

          {/* Valor del punto tocado */}
          <View style={tooltipRowStyle}>
            {selectedBar !== null ? (
              <Text style={tooltipTextStyle}>
                {data.points[selectedBar].label}: {formatLiters(data.points[selectedBar].liters)} L
              </Text>
            ) : (
              <Text style={tooltipHintStyle}>Toca una barra para ver el valor</Text>
            )}
          </View>

          <View style={chartStyle}>
            {data.points.map((p, i) => {
              const active = selectedBar === i;
              const heightPct = Math.max((p.liters / maxLiters) * 100, 3);
              return (
                <TouchableOpacity
                  key={p.label}
                  style={barColumnStyle}
                  onPress={() => setSelectedBar(active ? null : i)}
                  accessibilityLabel={`${p.label}: ${p.liters} litros`}
                >
                  <View style={barTrackStyle}>
                    <View
                      style={[
                        barStyle,
                        {
                          height: `${heightPct}%`,
                          backgroundColor: active ? theme.colors.primaryActive : theme.colors.primary,
                          opacity: selectedBar === null || active ? 1 : 0.45,
                        },
                      ]}
                    />
                  </View>
                  <Text style={[barLabelStyle, active && { color: theme.colors.textPrimary }]}>{p.label}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </Card>

        {/* Caudal (HU-018) + Válvula (HU-019) */}
        <View style={statsRowStyle}>
          <Card style={statCardStyle}>
            <View style={statHeaderStyle}>
              <Ionicons name="speedometer-outline" size={18} color={theme.colors.primary} />
              <Text style={statLabelStyle}>Caudal actual</Text>
            </View>
            {hasFlow ? (
              <View style={totalRowStyle}>
                <Text style={statValueStyle}>{MOCK_STATUS.flowLpm.toFixed(1)}</Text>
                <Text style={statUnitStyle}>L/min</Text>
              </View>
            ) : (
              <Text style={statValueMutedStyle}>Sin flujo</Text>
            )}
            <Text style={statFootStyle}>{hasFlow ? 'El agua está corriendo' : 'No hay consumo ahora'}</Text>
          </Card>

          <Card style={statCardStyle}>
            <View style={statHeaderStyle}>
              <Ionicons name="git-commit-outline" size={18} color={theme.colors.primary} />
              <Text style={statLabelStyle}>Válvula</Text>
            </View>
            <View style={[valveBadgeStyle, { backgroundColor: valve.bg }]}>
              <Ionicons name={valve.icon} size={16} color={valve.color} />
              <Text style={[valveTextStyle, { color: valve.color }]}>{valve.label}</Text>
            </View>
            <View style={deviceRowStyle}>
              <View
                style={[
                  deviceDotStyle,
                  { backgroundColor: MOCK_STATUS.deviceOnline ? theme.colors.success : theme.colors.error },
                ]}
              />
              <Text style={statFootStyle}>{MOCK_STATUS.deviceOnline ? 'Sensor en línea' : 'Sensor desconectado'}</Text>
            </View>
          </Card>
        </View>

        {/* Meta mensual (HU-024) */}
        <Card style={sectionCardStyle}>
          <View style={goalHeaderStyle}>
            <Text style={sectionTitleStyle}>Meta del mes</Text>
            <Text style={[goalPctStyle, { color: goalColor }]}>{goalPct}%</Text>
          </View>
          <View style={goalTrackStyle}>
            <View style={[goalFillStyle, { width: `${Math.min(goalPct, 100)}%`, backgroundColor: goalColor }]} />
          </View>
          <View style={goalFooterStyle}>
            <Text style={goalFootTextStyle}>
              {formatLiters(MOCK_STATUS.monthConsumed)} / {formatLiters(MOCK_STATUS.monthlyGoal)} L
            </Text>
            <Text style={goalFootTextStyle}>{MOCK_STATUS.daysLeft} días restantes</Text>
          </View>
        </Card>

        {/* Última actualización (HU-015) */}
        <View style={updateRowStyle}>
          <Text style={updateTextStyle}>Actualizado a las {formatTime(lastUpdate)}</Text>
          <TouchableOpacity
            style={refreshButtonStyle}
            onPress={() => setLastUpdate(new Date())}
            accessibilityLabel="Actualizar datos"
          >
            <Ionicons name="refresh" size={16} color={theme.colors.primary} />
            <Text style={refreshTextStyle}>Actualizar</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

// ───────────────────────────── Estilos ─────────────────────────────
const mono = theme.typography.fontFamily.monospace;
// H3 del sistema de diseño (20px Manrope 600); aún no existe en textStyles
const h3: TextStyle = {
  fontFamily: theme.typography.fontFamily.manrope,
  fontSize: theme.typography.sizes.h3,
  fontWeight: '600',
  lineHeight: theme.typography.sizes.h3 * theme.typography.lineHeights.h3,
};

const containerStyle: ViewStyle = { flex: 1, backgroundColor: theme.colors.background };

const contentStyle: ViewStyle = {
  paddingHorizontal: theme.spacing.lg,
  paddingTop: theme.spacing.xl,
  paddingBottom: theme.spacing.huge,
  gap: theme.spacing.lg,
};

const headerStyle: ViewStyle = { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' };
const headerLeftStyle: ViewStyle = { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.md };
const greetingStyle: TextStyle = { ...h3, color: theme.colors.textPrimary };
const placeRowStyle: ViewStyle = { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.xs, marginTop: 2 };
const placeTextStyle: TextStyle = { ...theme.textStyles.caption, color: theme.colors.textSecondary };
const betaBadgeStyle: ViewStyle = {
  marginLeft: theme.spacing.xs,
  paddingHorizontal: 6,
  paddingVertical: 1,
  borderRadius: theme.borderRadius.full,
  backgroundColor: theme.colors.warningBg,
};
const betaTextStyle: TextStyle = { fontFamily: mono, fontSize: 10, fontWeight: '600', color: theme.colors.warning };

const bellButtonStyle: ViewStyle = {
  width: 48,
  height: 48,
  borderRadius: 24,
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: theme.colors.surface,
  ...theme.shadows.subtle,
};
const bellBadgeStyle: ViewStyle = {
  position: 'absolute',
  top: 8,
  right: 8,
  minWidth: 16,
  height: 16,
  paddingHorizontal: 3,
  borderRadius: 8,
  backgroundColor: theme.colors.error,
  alignItems: 'center',
  justifyContent: 'center',
};
const bellBadgeTextStyle: TextStyle = { fontFamily: mono, fontSize: 10, color: theme.colors.textOnPrimary };

const segmentedStyle: ViewStyle = {
  flexDirection: 'row',
  backgroundColor: theme.colors.infoBg,
  borderRadius: theme.borderRadius.medium,
  padding: theme.spacing.xs,
};
const segmentStyle: ViewStyle = {
  flex: 1,
  height: 40,
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: theme.borderRadius.small,
};
const segmentActiveStyle: ViewStyle = { backgroundColor: theme.colors.surface, ...theme.shadows.subtle };
const segmentTextStyle: TextStyle = { ...theme.textStyles.caption, fontWeight: '600', color: theme.colors.textSecondary };
const segmentTextActiveStyle: TextStyle = { color: theme.colors.textPrimary, fontWeight: '800' };

const sectionCardStyle: ViewStyle = { gap: theme.spacing.sm };
const captionStyle: TextStyle = { ...theme.textStyles.caption, color: theme.colors.textMuted };
const totalRowStyle: ViewStyle = { flexDirection: 'row', alignItems: 'flex-end', gap: theme.spacing.xs };
const totalValueStyle: TextStyle = { fontFamily: mono, fontSize: 40, fontWeight: '500', color: theme.colors.textPrimary };
const totalUnitStyle: TextStyle = { fontFamily: mono, fontSize: 18, color: theme.colors.textSecondary, marginBottom: 7 };
const trendChipStyle: ViewStyle = {
  flexDirection: 'row',
  alignSelf: 'flex-start',
  alignItems: 'center',
  gap: theme.spacing.xs,
  paddingHorizontal: theme.spacing.sm,
  paddingVertical: 2,
  borderRadius: theme.borderRadius.full,
};
const trendTextStyle: TextStyle = { fontFamily: mono, fontSize: 12 };

const tooltipRowStyle: ViewStyle = { height: 20, marginTop: theme.spacing.md, justifyContent: 'center' };
const tooltipTextStyle: TextStyle = { fontFamily: mono, fontSize: 13, fontWeight: '500', color: theme.colors.textPrimary };
const tooltipHintStyle: TextStyle = { ...theme.textStyles.caption, fontSize: 12, color: theme.colors.textMuted };

const chartStyle: ViewStyle = { flexDirection: 'row', height: 160, gap: theme.spacing.sm, alignItems: 'flex-end' };
const barColumnStyle: ViewStyle = { flex: 1, height: '100%', alignItems: 'center', gap: theme.spacing.xs };
const barTrackStyle: ViewStyle = { flex: 1, width: '100%', justifyContent: 'flex-end' };
const barStyle: ViewStyle = { width: '100%', borderRadius: 6 };
const barLabelStyle: TextStyle = { fontFamily: mono, fontSize: 11, color: theme.colors.textMuted };

const statsRowStyle: ViewStyle = { flexDirection: 'row', gap: theme.spacing.md };
const statCardStyle: ViewStyle = { flex: 1, gap: theme.spacing.sm };
const statHeaderStyle: ViewStyle = { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.xs };
const statLabelStyle: TextStyle = { ...theme.textStyles.caption, fontWeight: '600', color: theme.colors.textSecondary };
const statValueStyle: TextStyle = { fontFamily: mono, fontSize: 28, fontWeight: '500', color: theme.colors.textPrimary };
const statUnitStyle: TextStyle = { fontFamily: mono, fontSize: 13, color: theme.colors.textSecondary, marginBottom: 5 };
const statValueMutedStyle: TextStyle = { ...h3, color: theme.colors.textMuted };
const statFootStyle: TextStyle = { ...theme.textStyles.caption, fontSize: 12, color: theme.colors.textMuted };

const valveBadgeStyle: ViewStyle = {
  flexDirection: 'row',
  alignSelf: 'flex-start',
  alignItems: 'center',
  gap: theme.spacing.xs,
  paddingHorizontal: theme.spacing.md,
  paddingVertical: theme.spacing.xs,
  borderRadius: theme.borderRadius.full,
};
const valveTextStyle: TextStyle = { ...theme.textStyles.caption, fontWeight: '800' };
const deviceRowStyle: ViewStyle = { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.xs };
const deviceDotStyle: ViewStyle = { width: 8, height: 8, borderRadius: 4 };

const goalHeaderStyle: ViewStyle = { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' };
const sectionTitleStyle: TextStyle = { ...h3, color: theme.colors.textPrimary };
const goalPctStyle: TextStyle = { fontFamily: mono, fontSize: 16, fontWeight: '500' };
const goalTrackStyle: ViewStyle = {
  height: 10,
  borderRadius: theme.borderRadius.full,
  backgroundColor: theme.colors.infoBg,
  overflow: 'hidden',
};
const goalFillStyle: ViewStyle = { height: '100%', borderRadius: theme.borderRadius.full };
const goalFooterStyle: ViewStyle = { flexDirection: 'row', justifyContent: 'space-between' };
const goalFootTextStyle: TextStyle = { fontFamily: mono, fontSize: 12, color: theme.colors.textMuted };

const updateRowStyle: ViewStyle = { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' };
const updateTextStyle: TextStyle = { fontFamily: mono, fontSize: 12, color: theme.colors.textMuted };
const refreshButtonStyle: ViewStyle = {
  flexDirection: 'row',
  alignItems: 'center',
  gap: theme.spacing.xs,
  minHeight: 48,
  paddingHorizontal: theme.spacing.md,
};
const refreshTextStyle: TextStyle = { ...theme.textStyles.caption, fontWeight: '600', color: theme.colors.primary };
