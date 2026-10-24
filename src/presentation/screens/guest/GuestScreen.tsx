import React, { useState } from 'react';
import { ActivityIndicator, Platform, RefreshControl, Text, TextStyle, View, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../../core/auth/AuthContext';
import { ConsumptionPeriod } from '../../../domain/consumption/Consumption';
import { Banner } from '../../components/common/Banner';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { PageContainer } from '../../components/common/PageContainer';
import { PageHeader } from '../../components/common/PageHeader';
import { ConsumptionCard } from '../../components/consumption/ConsumptionCard';
import { useGuestView } from '../../hooks/useGuestView';
import { GuestParams } from '../../navigation/types';
import { theme } from '../../styles/theme';
import { themed } from '../../styles/themeRuntime';

type Props = NativeStackScreenProps<{ Guest: GuestParams }, 'Guest'>;

/**
 * HU-040/041: the page a guest opens from the link ({app}/guest/{token}). No login and nothing to change: it shows the
 * name of the place and its water. It is registered in both navigators, so it opens the same whether or not somebody is
 * signed in on the device. When the owner turns the link off, the page says so instead of showing old numbers.
 */
export const GuestScreen: React.FC<Props> = ({ route }) => {
  const { t } = useTranslation();
  const { token } = route.params;
  const { status } = useAuth();
  const [period, setPeriod] = useState<ConsumptionPeriod>('DAY');
  const guest = useGuestView(token, period);

  if (guest.unavailable) {
    return (
      <PageContainer narrow>
        <Card variant="outlined" style={emptyCardStyle}>
          <Ionicons name="link-outline" size={44} color={theme.colors.textMuted} />
          <Text style={emptyTitleStyle}>{t('guest.unavailableTitle')}</Text>
          <Text style={mutedStyle}>{t('guest.unavailableText')}</Text>
        </Card>
      </PageContainer>
    );
  }

  if (!guest.place && guest.loading) {
    return (
      <View style={centeredStyle}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <PageContainer medium gap={theme.spacing.lg} refreshControl={<RefreshControl refreshing={false} onRefresh={guest.reload} tintColor={theme.colors.primary} />}>
      <PageHeader
        caption={t('guest.caption')}
        title={guest.place?.name ?? t('guest.defaultName')}
        subtitle={guest.place?.cityName}
        webOnly={false}
        right={
          Platform.OS === 'web' ? (
            <Button
              label={t('dashboard.refresh')}
              variant="ghost"
              size="small"
              onPress={guest.reload}
              icon={<Ionicons name="refresh" size={16} color={theme.colors.primary} />}
            />
          ) : undefined
        }
      />
      <Banner tone="info" message={t('guest.readOnly')} />
      {!!guest.error && !guest.consumption && <Banner tone="error" message={t('guest.failed', { reason: guest.error.message })} action={{ label: t('common.retry'), onPress: guest.reload }} />}
      <ConsumptionCard
        period={period}
        onPeriodChange={setPeriod}
        data={guest.consumption}
        loading={guest.loading}
        error={guest.consumption ? guest.error : null}
        unit={guest.place?.measurementUnit ?? 'LITERS'}
      />
      {status === 'signedOut' && <Text style={mutedStyle}>{t('guest.haveAccount')}</Text>}
    </PageContainer>
  );
};

const centeredStyle: ViewStyle = themed(() => ({ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.colors.background }));
const emptyCardStyle: ViewStyle = { alignItems: 'center', gap: theme.spacing.md, paddingVertical: theme.spacing.xl };
const emptyTitleStyle: TextStyle = themed(() => ({ ...theme.textStyles.h2, fontSize: 20, color: theme.colors.textPrimary, textAlign: 'center' }));
const mutedStyle: TextStyle = themed(() => ({ ...theme.textStyles.caption, color: theme.colors.textMuted, textAlign: 'center' }));
