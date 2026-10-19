import React, { useCallback, useState } from 'react';
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
import * as Haptics from 'expo-haptics';
import { useAuth } from '../../../core/auth/AuthContext';
import { placeRepository } from '../../../core/di/container';
import { avatarUri } from '../../../config/api';
import { AppError } from '../../../domain/common/AppError';
import { Place } from '../../../domain/places/Place';
import { markSelected } from '../../../domain/places/selection';
import { toAppError } from '../../../infrastructure/http/httpError';
import { Avatar } from '../../components/common/Avatar';
import { Banner } from '../../components/common/Banner';
import { NotificationBell } from '../../components/notifications/NotificationBell';
import { Button } from '../../components/common/Button';
import { PageHeader } from '../../components/common/PageHeader';
import { PlaceCard } from '../../components/places/PlaceCard';
import { useLayout } from '../../layout/breakpoints';
import { MainStackParamList } from '../../navigation/types';
import { theme } from '../../styles/theme';
import { themed } from '../../styles/themeRuntime';

type Props = NativeStackScreenProps<MainStackParamList, 'Places'>;

export const PlacesScreen: React.FC<Props> = ({ navigation, route }) => {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { columns } = useLayout();

  const [places, setPlaces] = useState<Place[] | null>(null); // null = first load
  const [loadError, setLoadError] = useState<AppError | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [selectingId, setSelectingId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const notice = route.params?.notice;

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

  const select = async (place: Place) => {
    if (!places || selectingId) return;
    const previous = places;
    setActionError(null);
    setSelectingId(place.id);
    setPlaces(markSelected(places, place.id)); // optimistic: the mark moves right away
    Haptics.selectionAsync().catch(() => undefined);
    try {
      await placeRepository.select(place.id);
    } catch (error) {
      setPlaces(previous); // undo
      setActionError(`No pudimos seleccionar "${place.name}". ${toAppError(error).message}`);
    } finally {
      setSelectingId(null);
    }
  };

  const isWeb = Platform.OS === 'web';
  const welcome = places && places.length > 0 ? 'Elige el lugar que quieres monitorear o abre su panel para ver el consumo y la válvula.' : 'Empecemos a cuidar el agua.';

  // Web: the Figma page header inside the content (the menu already has the bell and the profile). Phone: the bar with bell + avatar.
  const webHeader = (
    <PageHeader
      caption={`Hola, ${user?.firstName ?? ''}`}
      title="Mis lugares"
      subtitle={welcome}
      right={
        places && places.length > 0 ? (
          <Button
            label="Registrar lugar"
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
        <Text style={helloStyle}>Hola, {user?.firstName ?? ''}</Text>
        <Text style={subtitleStyle}>
          {places && places.length > 0 ? 'Elige el lugar que quieres monitorear' : 'Empecemos a cuidar el agua'}
        </Text>
      </View>
      <NotificationBell onPress={() => navigation.navigate('Notifications')} />
      <TouchableOpacity
        onPress={() => navigation.navigate('Profile')}
        accessibilityRole="button"
        accessibilityLabel="Abrir mi perfil"
        hitSlop={8}
      >
        {user && <Avatar uri={avatarUri(user.avatarUrl)} firstName={user.firstName} lastName={user.lastName} size={44} />}
      </TouchableOpacity>
    </View>
  );

  const banners = (
    <>
      {!!notice && <Banner tone="success" message={notice} onClose={() => navigation.setParams({ notice: undefined })} />}
      {!!actionError && <Banner tone="error" message={actionError} onClose={() => setActionError(null)} />}
    </>
  );

  if (places === null) {
    return (
      <View style={screenStyle}>
        {header}
        {isWeb && <View style={webPageStyle}>{webHeader}</View>}
        <View style={centerStyle}>
          {loadError ? (
            <>
              <Banner tone="error" message={loadError.message} />
              <Button label="Reintentar" onPress={refresh} loading={refreshing} />
            </>
          ) : (
            <>
              <ActivityIndicator size="large" color={theme.colors.primary} />
              <Text style={mutedStyle}>Cargando tus lugares...</Text>
            </>
          )}
        </View>
      </View>
    );
  }

  if (places.length === 0) {
    return (
      <View style={screenStyle}>
        {header}
        <View style={[contentStyle, isWeb && webPageStyle]}>
          {isWeb && webHeader}
          {banners}
        </View>
        <View style={[centerStyle, isWeb && emptyCardStyle]}>
          <View style={emptyIconStyle}>
            <Ionicons name="water-outline" size={48} color={theme.colors.primary} />
          </View>
          <Text style={emptyTitleStyle}>Aún no tienes lugares</Text>
          <Text style={emptyTextStyle}>
            Registra tu casa, tu local o tu finca. Después podrás vincular un medidor y ver cuánta agua consumes.
          </Text>
          <Button label="Registrar mi primer lugar" onPress={() => navigation.navigate('CreatePlace')} style={fullWidthStyle} />
        </View>
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
        contentContainerStyle={[contentStyle, isWeb && { paddingTop: theme.spacing.xl }, { paddingBottom: insets.bottom + theme.spacing.xl }]}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={theme.colors.primary} />}
        accessibilityRole="radiogroup"
        ListHeaderComponent={
          <>
            {isWeb && webHeader}
            {banners}
            {!!loadError && <Banner tone="warning" message={`No pudimos actualizar la lista. ${loadError.message}`} />}
            <Text style={isWeb ? webCountStyle : sectionTitleStyle}>
              {isWeb ? `${places.length} ${places.length === 1 ? 'lugar' : 'lugares'}` : `Mis lugares (${places.length})`}
            </Text>
          </>
        }
        renderItem={({ item }) => (
          <View style={columns > 1 ? { flex: 1, maxWidth: `${100 / columns}%` } : undefined}>
            <PlaceCard
              place={item}
              onSelect={() => select(item)}
              onEdit={() => navigation.navigate('EditPlace', { placeId: item.id })}
              onOpenPanel={() => navigation.navigate('PlaceDashboard', { placeId: item.id, placeName: item.name })}
              selecting={selectingId === item.id}
              disabled={!!selectingId}
            />
          </View>
        )}
        ListFooterComponent={
          isWeb ? null : (
          <Button
            label="Registrar otro lugar"
            variant="secondary"
            icon={<Ionicons name="add" size={20} color={theme.colors.textPrimary} />}
            onPress={() => navigation.navigate('CreatePlace')}
            style={{ marginTop: theme.spacing.sm }}
          />
          )
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

const webPageStyle: ViewStyle = { paddingHorizontal: theme.spacing.lg, paddingTop: theme.spacing.xl };
const webCountStyle: TextStyle = themed(() => ({ ...theme.textStyles.h3, fontSize: 19, fontWeight: '800', color: theme.colors.textPrimary, marginBottom: theme.spacing.md }));
const emptyCardStyle: ViewStyle = themed(() => ({
  flex: 0,
  alignSelf: 'stretch',
  marginHorizontal: theme.spacing.lg,
  paddingVertical: theme.spacing.huge,
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
  width: 96,
  height: 96,
  borderRadius: 48,
  backgroundColor: theme.colors.infoBg,
  alignItems: 'center',
  justifyContent: 'center',
}));

const emptyTitleStyle: TextStyle = themed(() => ({ ...theme.textStyles.h2, color: theme.colors.textPrimary, textAlign: 'center' }));

const emptyTextStyle: TextStyle = themed(() => ({
  ...theme.textStyles.caption,
  fontSize: 16,
  lineHeight: 24,
  color: theme.colors.textSecondary,
  textAlign: 'center',
  marginBottom: theme.spacing.md,
}));

const fullWidthStyle: ViewStyle = { alignSelf: 'stretch' };
