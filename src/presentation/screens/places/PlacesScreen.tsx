import React, { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ActivityIndicator,
  FlatList,
  Platform,
  RefreshControl,
  Text,
  TextStyle,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../../core/auth/AuthContext';
import { placeRepository } from '../../../core/di/container';
import { avatarUri } from '../../../config/api';
import { AppError } from '../../../domain/common/AppError';
import { Place } from '../../../domain/places/Place';
import { toAppError } from '../../../infrastructure/http/httpError';
import { Avatar } from '../../components/common/Avatar';
import { Banner } from '../../components/common/Banner';
import { NotificationBell } from '../../components/notifications/NotificationBell';
import { Button } from '../../components/common/Button';
import { PageHeader } from '../../components/common/PageHeader';
import { PlaceCard } from '../../components/places/PlaceCard';
import { SharedPlaceCard } from '../../components/sharing/SharedPlaceCard';
import { useSharedWithMe } from '../../hooks/useSharedWithMe';
import { listContentStyle } from '../../components/common/PageContainer';
import { useLayout } from '../../layout/breakpoints';
import { MainStackParamList } from '../../navigation/types';
import { theme } from '../../styles/theme';
import { themed } from '../../styles/themeRuntime';

type Props = NativeStackScreenProps<MainStackParamList, 'Places'>;

export const PlacesScreen: React.FC<Props> = ({ navigation, route }) => {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { columns } = useLayout();

  const [places, setPlaces] = useState<Place[] | null>(null); // null = first load
  const [loadError, setLoadError] = useState<AppError | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const notice = route.params?.notice;
  const shared = useSharedWithMe(); // HU-043/045: invitations waiting and places other people shared

  useFocusEffect(
    useCallback(() => {
      let active = true;
      placeRepository
        .list()
        .then((loaded) => {
          if (!active) return;
          setPlaces(loaded);
          setLoadError(null);
        })
        .catch((error: unknown) => {
          if (active) setLoadError(toAppError(error));
        });
      return () => {
        active = false;
      };
    }, []),
  );

  const refresh = async () => {
    setRefreshing(true);
    try {
      setPlaces(await placeRepository.list());
      setLoadError(null);
    } catch (error) {
      setLoadError(toAppError(error));
    } finally {
      setRefreshing(false);
    }
  };

  const isWeb = Platform.OS === 'web';
  // Web: the header, the empty state and the list share one centered column, the same width as Notificaciones
  const webColumn = isWeb ? listContentStyle() : undefined;
  const welcome = places && places.length > 0 ? t('places.list.welcome') : t('places.list.welcomeEmpty');

  // Web: the Figma page header inside the content (the menu already has the bell and the profile). Phone: the bar with bell + avatar.
  const webHeader = (
    <PageHeader
      caption={t('places.list.greeting', { name: user?.firstName ?? '' })}
      title={t('places.list.title')}
      subtitle={welcome}
      right={
        places && places.length > 0 ? (
          <Button
            label={t('places.list.register')}
            size="medium"
            onPress={() => navigation.navigate('CreatePlace')}
            icon={<Ionicons name="add" size={20} color={theme.colors.textOnPrimary} />}
          />
        ) : undefined
      }
    />
  );

  const header = isWeb ? null : (
    <View style={[headerStyle, { paddingTop: insets.top + theme.spacing.lg }]}>
      <View style={headerTextStyle}>
        <Text style={helloStyle}>{t('places.list.greeting', { name: user?.firstName ?? '' })}</Text>
        <Text style={subtitleStyle}>
          {places && places.length > 0 ? t('places.list.pickOne') : t('places.list.welcomeEmpty').replace(/\.$/, '')}
        </Text>
      </View>
      <NotificationBell onPress={() => navigation.navigate('Notifications')} />
      <TouchableOpacity
        onPress={() => navigation.navigate('Profile')}
        accessibilityRole="button"
        accessibilityLabel={t('places.list.openProfile')}
        hitSlop={8}
      >
        {user && <Avatar uri={avatarUri(user.avatarUrl)} firstName={user.firstName} lastName={user.lastName} size={44} />}
      </TouchableOpacity>
    </View>
  );

  const banners = (
    <>
      {!!notice && <Banner tone="success" message={notice} onClose={() => navigation.setParams({ notice: undefined })} />}
      {shared.inbox.length > 0 && (
        <Banner
          tone="info"
          message={t('sharing.banner.pending', { count: shared.inbox.length })}
          action={{ label: t('sharing.banner.view'), onPress: () => navigation.navigate('Invitations') }}
        />
      )}
    </>
  );

  // HU-045: the places of other people where the person collaborates, below their own
  const sharedSection =
    shared.sharedPlaces.length > 0 ? (
      <View style={sharedSectionStyle}>
        <Text style={isWeb ? webCountStyle : sectionTitleStyle}>{t('sharing.shared.title')}</Text>
        {shared.sharedPlaces.map((item) => (
          <SharedPlaceCard
            key={item.memberId}
            shared={item}
            onOpen={() => navigation.navigate('PlaceDashboard', { placeId: item.place.id, placeName: item.place.name })}
          />
        ))}
        <Button label={t('sharing.shared.manage')} variant="ghost" size="small" onPress={() => navigation.navigate('Invitations')} />
      </View>
    ) : null;

  if (places === null) {
    return (
      <View style={screenStyle}>
        {header}
        {isWeb && <View style={webColumn}>{webHeader}</View>}
        <View style={centerStyle}>
          {loadError ? (
            <>
              <Banner tone="error" message={loadError.message} />
              <Button label={t('common.retry')} onPress={refresh} loading={refreshing} />
            </>
          ) : (
            <>
              <ActivityIndicator size="large" color={theme.colors.primary} />
              <Text style={mutedStyle}>{t('places.list.loading')}</Text>
            </>
          )}
        </View>
      </View>
    );
  }

  if (places.length === 0) {
    const emptyContent = (
      <>
        <View style={emptyIconStyle}>
          <Ionicons name="water-outline" size={isWeb ? 34 : 48} color={theme.colors.primary} />
        </View>
        <Text style={emptyTitleStyle}>{t('places.list.emptyTitle')}</Text>
        <Text style={emptyTextStyle}>
          {t('places.list.emptyText')}
        </Text>
        <Button
          label={t('places.list.registerFirst')}
          size={isWeb ? 'medium' : 'large'}
          onPress={() => navigation.navigate('CreatePlace')}
          style={isWeb ? undefined : fullWidthStyle}
        />
      </>
    );

    return (
      <View style={screenStyle}>
        {header}
        {isWeb ? (
          <View style={[contentStyle, webColumn]}>
            {webHeader}
            {banners}
            <View style={emptyCardStyle}>{emptyContent}</View>
            {sharedSection}
          </View>
        ) : (
          <>
            <View style={contentStyle}>{banners}</View>
            <View style={centerStyle}>{emptyContent}</View>
            {!!sharedSection && <View style={contentStyle}>{sharedSection}</View>}
          </>
        )}
      </View>
    );
  }

  return (
    <View style={screenStyle}>
      {header}
      <FlatList
        key={columns} // numColumns cannot change on a mounted list
        numColumns={columns}
        columnWrapperStyle={columns > 1 ? gridRowStyle : undefined}
        data={places}
        keyExtractor={(place) => place.id}
        contentContainerStyle={[contentStyle, listContentStyle(), { paddingBottom: insets.bottom + theme.spacing.xl }]}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={theme.colors.primary} />}
        accessibilityRole="radiogroup"
        ListHeaderComponent={
          <>
            {isWeb && webHeader}
            {banners}
            {!!loadError && <Banner tone="warning" message={t('places.list.refreshFailed', { reason: loadError.message })} />}
            <Text style={isWeb ? webCountStyle : sectionTitleStyle}>
              {isWeb ? t('places.list.count', { count: places.length }) : t('places.list.mobileTitle', { count: places.length })}
            </Text>
          </>
        }
        renderItem={({ item }) => (
          <View style={columns > 1 ? { flex: 1, maxWidth: `${100 / columns}%` } : undefined}>
            <PlaceCard
              place={item}
              onEdit={() => navigation.navigate('EditPlace', { placeId: item.id })}
              onOpenPanel={() => navigation.navigate('PlaceDashboard', { placeId: item.id, placeName: item.name })}
              onShare={() => navigation.navigate('PlaceSharing', { placeId: item.id, placeName: item.name })}
            />
          </View>
        )}
        ListFooterComponent={
          <>
            {isWeb ? null : (
              <Button
                label={t('places.list.registerAnother')}
                variant="secondary"
                icon={<Ionicons name="add" size={20} color={theme.colors.textPrimary} />}
                onPress={() => navigation.navigate('CreatePlace')}
                style={{ marginTop: theme.spacing.sm }}
              />
            )}
            {sharedSection}
          </>
        }
      />
    </View>
  );
};

const screenStyle: ViewStyle = themed(() => ({ flex: 1, backgroundColor: theme.colors.background }));

const headerStyle: ViewStyle = themed(() => ({
  flexDirection: 'row',
  alignItems: 'center',
  gap: theme.spacing.md,
  paddingHorizontal: theme.spacing.lg,
  paddingBottom: theme.spacing.lg,
  backgroundColor: theme.colors.surface,
  borderBottomWidth: 1,
  borderBottomColor: theme.colors.border,
}));

const headerTextStyle: ViewStyle = { flex: 1 };

const gridRowStyle: ViewStyle = { gap: theme.spacing.lg };

const sharedSectionStyle: ViewStyle = { gap: theme.spacing.md, marginTop: theme.spacing.xl };

const webCountStyle: TextStyle = themed(() => ({ ...theme.textStyles.h3, fontSize: 19, fontWeight: '800', color: theme.colors.textPrimary, marginBottom: theme.spacing.md }));
// Web empty state: a card as wide as the page column (it starts on the same left edge as the title) with its content centered inside
const emptyCardStyle: ViewStyle = themed(() => ({
  width: '100%',
  alignItems: 'center',
  gap: theme.spacing.md,
  paddingHorizontal: theme.spacing.xl,
  paddingVertical: theme.spacing.xxl,
  borderRadius: theme.borderRadius.large,
  borderWidth: 1,
  borderColor: theme.colors.border,
  backgroundColor: theme.colors.surface,
}));

const helloStyle: TextStyle = themed(() => ({ ...theme.textStyles.h2, color: theme.colors.textPrimary }));

const subtitleStyle: TextStyle = themed(() => ({ ...theme.textStyles.caption, color: theme.colors.textSecondary, marginTop: 2 }));

const contentStyle: ViewStyle = { paddingHorizontal: theme.spacing.lg, paddingTop: theme.spacing.lg };

const centerStyle: ViewStyle = {
  flex: 1,
  alignItems: 'center',
  justifyContent: 'center',
  padding: theme.spacing.xl,
  gap: theme.spacing.md,
};

const mutedStyle: TextStyle = themed(() => ({ ...theme.textStyles.caption, color: theme.colors.textMuted }));

const sectionTitleStyle: TextStyle = themed(() => ({
  ...theme.textStyles.label,
  color: theme.colors.textMuted,
  textTransform: 'uppercase',
  marginBottom: theme.spacing.md,
}));

const emptyIconStyle: ViewStyle = themed(() => ({
  width: 72,
  height: 72,
  borderRadius: 36,
  backgroundColor: theme.colors.infoBg,
  alignItems: 'center',
  justifyContent: 'center',
}));

const emptyTitleStyle: TextStyle = themed(() => ({
  ...theme.textStyles.h3,
  fontSize: 22,
  fontWeight: '800',
  lineHeight: 28,
  color: theme.colors.textPrimary,
  textAlign: 'center',
}));

const emptyTextStyle: TextStyle = themed(() => ({
  ...theme.textStyles.caption,
  fontSize: 15,
  lineHeight: 23,
  color: theme.colors.textSecondary,
  textAlign: 'center',
}));

const fullWidthStyle: ViewStyle = { alignSelf: 'stretch' };
