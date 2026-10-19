import React from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Platform, RefreshControl, Text, TextStyle, View, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { CATEGORY_LABELS } from '../../../domain/tips/Tip';
import { Banner } from '../../components/common/Banner';
import { Button } from '../../components/common/Button';
import { PageContainer } from '../../components/common/PageContainer';
import { PageHeader } from '../../components/common/PageHeader';
import { SegmentedControl } from '../../components/common/SegmentedControl';
import { TipCard } from '../../components/tips/TipCard';
import { TipsView, useTips } from '../../hooks/useTips';
import { useLayout } from '../../layout/breakpoints';
import { MainStackParamList } from '../../navigation/types';
import { theme } from '../../styles/theme';
import { themed } from '../../styles/themeRuntime';

type Props = NativeStackScreenProps<MainStackParamList, 'Tips'>;

/**
 * HU-065: general water saving tips for a home or a business (not personalised), at least 3 different ones, and the ones the
 * user marked as favorite.
 */
export const TipsScreen: React.FC<Props> = ({ navigation, route }) => {
  const { t } = useTranslation();
  const viewOptions: { value: TipsView; label: string }[] = [
    { value: 'forYou', label: t('tips.forYou') },
    { value: 'favorites', label: t('tips.favorites') },
  ];
  const tips = useTips(route.params?.placeId);
  const { columns } = useLayout();
  // Web (Figma "Consejos favoritos"): only the ones you kept; the day's tips live in the panel of each place
  const isWeb = Platform.OS === 'web';
  const view: TipsView = isWeb ? 'favorites' : tips.view;
  const shown = isWeb ? (tips.favorites ?? []) : tips.tips;

  if (tips.loading && !tips.session) {
    return (
      <View style={centerStyle}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={mutedStyle}>{t('tips.searching')}</Text>
      </View>
    );
  }

  if (!tips.session) {
    return (
      <View style={centerStyle}>
        <Banner tone="error" message={tips.error?.message ?? t('tips.loadFailed')} />
        <Button label={t('common.retry')} onPress={() => void tips.reload()} />
      </View>
    );
  }

  const columnCount = Math.min(columns, 2);

  return (
    <PageContainer
      contentStyle={{ gap: theme.spacing.md }}
      refreshControl={<RefreshControl refreshing={tips.loading} onRefresh={() => void tips.reload()} tintColor={theme.colors.primary} />}
    >
      {isWeb ? (
        <PageHeader
          // Opened from a place's panel: a way back to that same panel (no detour through "Mis lugares")
          back={route.params?.placeId ? { label: t('tips.backToPanel'), onPress: () => navigation.goBack() } : undefined}
          title={t('tips.favoritesTitle')}
          subtitle={t('tips.favoritesSubtitle')}
        />
      ) : (
        <>
          <Text style={titleStyle}>{t('tips.screenTitle')}</Text>
          <Text style={mutedStyle}>
            {tips.session.category === 'COMMERCIAL' ? t('tips.introBusiness') : t('tips.introHome')}
          </Text>
          <SegmentedControl options={viewOptions} value={tips.view} onChange={tips.setView} />
        </>
      )}

      {!!tips.error && <Banner tone="warning" message={tips.error.message} onClose={tips.dismissError} />}

      {shown.length === 0 ? (
        <View style={emptyStyle}>
          <Ionicons name={view === 'favorites' ? 'heart-outline' : 'bulb-outline'} size={44} color={theme.colors.textMuted} />
          <Text style={emptyTitleStyle}>
            {view === 'favorites' ? t('tips.noFavoritesTitle') : t('tips.noTipsTitle')}
          </Text>
          <Text style={mutedStyle}>
            {view === 'favorites' ? t('tips.noFavoritesText') : t('tips.noTipsText')}
          </Text>
        </View>
      ) : (
        <View style={gridStyle}>
          {shown.map((tip) => (
            <View key={tip.id} style={{ flexBasis: columnCount > 1 ? '48%' : '100%', flexGrow: 1 }}>
              <TipCard tip={tip} compact={isWeb} busy={tips.busyId === tip.id} onToggleFavorite={() => void tips.toggleFavorite(tip)} />
            </View>
          ))}
        </View>
      )}

      {view === 'forYou' && tips.session.total > tips.tips.length && (
        <Text style={mutedStyle}>
          {t('tips.todayCount', { shown: tips.tips.length, total: tips.session.total })}
        </Text>
      )}
    </PageContainer>
  );
};

const centerStyle: ViewStyle = themed(() => ({ flex: 1, alignItems: 'center', justifyContent: 'center', gap: theme.spacing.md, padding: theme.spacing.xl, backgroundColor: theme.colors.background }));
const titleStyle: TextStyle = themed(() => ({ ...theme.textStyles.h2, color: theme.colors.textPrimary }));
const mutedStyle: TextStyle = themed(() => ({ ...theme.textStyles.caption, color: theme.colors.textMuted }));
const gridStyle: ViewStyle = { flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.lg };
const emptyStyle: ViewStyle = { alignItems: 'center', gap: theme.spacing.md, paddingVertical: theme.spacing.huge };
const emptyTitleStyle: TextStyle = themed(() => ({ ...theme.textStyles.h3, color: theme.colors.textPrimary, textAlign: 'center' }));
