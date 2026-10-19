import React from 'react';
import { ActivityIndicator, RefreshControl, Text, TextStyle, TouchableOpacity, View, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import i18n from '../../../i18n';
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
import { formatTime } from '../../../i18n/format';
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
  const { t } = useTranslation();
  const { metrics, error, loading, reload } = useAdminMetrics();

  if (!metrics) {
    return (
      <View style={centerStyle}>
        {error ? (
          <>
            <Banner tone="error" message={error.message} />
            <Button label={t('adminCommon.retry')} onPress={() => void reload()} />
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
        title={t('adminMetrics.title')}
        subtitle={t('adminMetrics.updatedAt', { time: formatTime(metrics.generatedAt) })}
        right={
          <Button
            label={t('adminMetrics.refresh')}
            size="small"
            variant="secondary"
            loading={loading}
            icon={<Ionicons name="refresh" size={18} color={theme.colors.primary} />}
            onPress={() => void reload()}
          />
        }
      />

      {!!error && <Banner tone="warning" message={t('adminMetrics.updateFailed', { message: error.message })} />}
      {down.length > 0 && (
        <Banner tone="warning" title={t('adminMetrics.incompleteTitle')} message={t('adminMetrics.incompleteMessage', { names: down.join(', ') })} />
      )}

      <View style={gridStyle}>
        <Stat title={t('adminMetrics.activeAccounts')} value={users.active} detail={t('adminMetrics.ofAccounts', { total: users.total })} flag={users.blocked > 0 ? t('adminMetrics.blockedFlag', { count: users.blocked }) : undefined} flagTone="bad" />
        <Stat
          title={t('adminMetrics.connectedMeters')}
          value={devices?.active}
          detail={devices ? t('adminMetrics.ofRegistered', { total: devices.total }) : undefined}
          flag={devices && devices.inactive > 0 ? t('adminMetrics.offlineFlag', { count: devices.inactive }) : undefined}
          flagTone="warn"
        />
        <Stat title={t('adminMetrics.registeredPlaces')} value={places?.total} detail={places ? t('adminMetrics.withMeter', { count: places.active }) : undefined} />
        <Stat
          title={t('adminMetrics.unverified')}
          value={users.unverified}
          detail={t('adminMetrics.waitingCode')}
          flag={users.unverified > 0 ? t('adminMetrics.pendingFlag') : undefined}
          flagTone="warn"
        />
      </View>

      <View style={gridStyle}>
        <Section
          title={t('adminMetrics.usersSection')}
          action={{ label: t('adminMetrics.seeUsers'), onPress: onUsers }}
          lines={[
            { label: t('adminMetrics.totalAccounts'), value: users.total },
            { label: t('adminMetrics.active'), value: users.active, tone: 'good' },
            { label: t('adminMetrics.emailUnverified'), value: users.unverified, tone: users.unverified > 0 ? 'warn' : undefined },
            { label: t('adminMetrics.blocked'), value: users.blocked, tone: users.blocked > 0 ? 'warn' : undefined },
          ]}
        />
        <Section title={t('adminMetrics.metersSection')} lines={devicesLines(metrics)} />
      </View>
    </PageContainer>
  );
};

const devicesLines = (metrics: PlatformMetrics): Line[] | null =>
  metrics.devices && [
    { label: i18n.t('adminMetrics.registered'), value: metrics.devices.total },
    { label: i18n.t('adminMetrics.connected'), value: metrics.devices.active, tone: 'good' },
    { label: i18n.t('adminMetrics.disconnected'), value: metrics.devices.inactive, tone: metrics.devices.inactive > 0 ? 'warn' : undefined },
    { label: i18n.t('adminMetrics.linkedToPlace'), value: metrics.devices.linked },
  ];

/** One number of the top row. A service that did not answer shows a dash and says why, never a zero. */
const Stat: React.FC<{ title: string; value?: number; detail?: string; flag?: string; flagTone?: 'warn' | 'bad' }> = ({ title, value, detail, flag, flagTone }) => {
  const { t } = useTranslation();
  return (
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
          <Text style={mutedStyle}>{t('adminMetrics.unavailable')}</Text>
        </>
      )}
    </Card>
  );
};

const Section: React.FC<{ title: string; lines: Line[] | null; action?: { label: string; onPress: () => void } }> = ({ title, lines, action }) => {
  const { t } = useTranslation();
  return (
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
          <Text style={mutedStyle}>{t('adminMetrics.unavailable')}</Text>
        </View>
      )}
    </Card>
  );
};

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
