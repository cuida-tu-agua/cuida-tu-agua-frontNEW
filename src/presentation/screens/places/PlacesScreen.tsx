import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
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
import { Button } from '../../components/common/Button';
import { PlaceCard } from '../../components/places/PlaceCard';
import { MainStackParamList } from '../../navigation/types';
import { theme } from '../../styles/theme';

type Props = NativeStackScreenProps<MainStackParamList, 'Places'>;

export const PlacesScreen: React.FC<Props> = ({ navigation, route }) => {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();

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

  const header = (
    <View style={[headerStyle, { paddingTop: insets.top + theme.spacing.lg }]}>
      <View style={headerTextStyle}>
        <Text style={helloStyle}>Hola, {user?.firstName ?? ''}</Text>
        <Text style={subtitleStyle}>
          {places && places.length > 0 ? 'Elige el lugar que quieres monitorear' : 'Empecemos a cuidar el agua'}
        </Text>
      </View>
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
        <View style={contentStyle}>{banners}</View>
        <View style={centerStyle}>
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
        data={places}
        keyExtractor={(place) => place.id}
        contentContainerStyle={[contentStyle, { paddingBottom: insets.bottom + theme.spacing.xl }]}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={theme.colors.primary} />}
        accessibilityRole="radiogroup"
        ListHeaderComponent={
          <>
            {banners}
            {!!loadError && <Banner tone="warning" message={`No pudimos actualizar la lista. ${loadError.message}`} />}
            <Text style={sectionTitleStyle}>Mis lugares ({places.length})</Text>
          </>
        }
        renderItem={({ item }) => (
          <PlaceCard
            place={item}
            onSelect={() => select(item)}
            onEdit={() => navigation.navigate('EditPlace', { placeId: item.id })}
            onOpenPanel={() => navigation.navigate('PlaceDashboard', { placeId: item.id, placeName: item.name })}
            selecting={selectingId === item.id}
            disabled={!!selectingId}
          />
        )}
        ListFooterComponent={
          <Button
            label="Registrar otro lugar"
            variant="secondary"
            icon={<Ionicons name="add" size={20} color={theme.colors.textPrimary} />}
            onPress={() => navigation.navigate('CreatePlace')}
            style={{ marginTop: theme.spacing.sm }}
          />
        }
      />
    </View>
  );
};

const screenStyle: ViewStyle = { flex: 1, backgroundColor: theme.colors.background };

const headerStyle: ViewStyle = {
  flexDirection: 'row',
  alignItems: 'center',
  gap: theme.spacing.md,
  paddingHorizontal: theme.spacing.lg,
  paddingBottom: theme.spacing.lg,
  backgroundColor: theme.colors.surface,
  borderBottomWidth: 1,
  borderBottomColor: theme.colors.border,
};

const headerTextStyle: ViewStyle = { flex: 1 };

const helloStyle: TextStyle = { ...theme.textStyles.h2, color: theme.colors.textPrimary };

const subtitleStyle: TextStyle = { ...theme.textStyles.caption, color: theme.colors.textSecondary, marginTop: 2 };

const contentStyle: ViewStyle = { paddingHorizontal: theme.spacing.lg, paddingTop: theme.spacing.lg };

const centerStyle: ViewStyle = {
  flex: 1,
  alignItems: 'center',
  justifyContent: 'center',
  padding: theme.spacing.xl,
  gap: theme.spacing.md,
};

const mutedStyle: TextStyle = { ...theme.textStyles.caption, color: theme.colors.textMuted };

const sectionTitleStyle: TextStyle = {
  ...theme.textStyles.label,
  color: theme.colors.textMuted,
  textTransform: 'uppercase',
  marginBottom: theme.spacing.md,
};

const emptyIconStyle: ViewStyle = {
  width: 96,
  height: 96,
  borderRadius: 48,
  backgroundColor: theme.colors.infoBg,
  alignItems: 'center',
  justifyContent: 'center',
};

const emptyTitleStyle: TextStyle = { ...theme.textStyles.h2, color: theme.colors.textPrimary, textAlign: 'center' };

const emptyTextStyle: TextStyle = {
  ...theme.textStyles.caption,
  fontSize: 16,
  lineHeight: 24,
  color: theme.colors.textSecondary,
  textAlign: 'center',
  marginBottom: theme.spacing.md,
};

const fullWidthStyle: ViewStyle = { alignSelf: 'stretch' };
