import React, { useCallback } from 'react';
import { ActivityIndicator, FlatList, RefreshControl, Text, TextStyle, View, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { placeRepository } from '../../../core/di/container';
import { AppNotification } from '../../../domain/notifications/Notification';
import { Banner } from '../../components/common/Banner';
import { Button } from '../../components/common/Button';
import { NotificationItem } from '../../components/notifications/NotificationItem';
import { useNotifications } from '../../hooks/useNotifications';
import { MainStackParamList } from '../../navigation/types';
import { theme } from '../../styles/theme';

type Props = NativeStackScreenProps<MainStackParamList, 'Notifications'>;

/** HU-025: the inbox. Tapping a notification marks it read and opens the panel of its place. */
export const NotificationsScreen: React.FC<Props> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const inbox = useNotifications();

  const open = useCallback(
    async (item: AppNotification) => {
      void inbox.markRead(item.id);
      if (!item.placeId) return;
      // The panel shows the name of the place in its title: ask for it (a failure only loses the name)
      const place = await placeRepository.getById(item.placeId).catch(() => null);
      navigation.navigate('PlaceDashboard', { placeId: item.placeId, placeName: place?.name ?? 'Mi lugar' });
    },
    [inbox, navigation],
  );

  if (!inbox.loaded) {
    return (
      <View style={centerStyle}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={mutedStyle}>Cargando tus notificaciones...</Text>
      </View>
    );
  }

  const toolbar = (
    <View style={toolbarStyle}>
      <Text style={countStyle}>
        {inbox.unread > 0 ? `${inbox.unread} sin leer` : 'Estás al día'}
      </Text>
      <View style={actionsStyle}>
        <Button
          label="Marcar todas como leídas"
          size="small"
          variant="secondary"
          onPress={() => void inbox.markAllRead()}
          disabled={inbox.unread === 0}
        />
        <Button
          label="Preferencias"
          size="small"
          variant="ghost"
          icon={<Ionicons name="settings-outline" size={18} color={theme.colors.primary} />}
          onPress={() => navigation.navigate('NotificationPreferences')}
        />
      </View>
    </View>
  );

  return (
    <FlatList
      style={screenStyle}
      data={inbox.items}
      keyExtractor={(item) => item.id}
      contentContainerStyle={[contentStyle, { paddingBottom: insets.bottom + theme.spacing.xl }]}
      refreshControl={
        <RefreshControl refreshing={inbox.refreshing} onRefresh={() => void inbox.refresh()} tintColor={theme.colors.primary} />
      }
      onEndReached={() => void inbox.loadMore()}
      onEndReachedThreshold={0.4}
      ListHeaderComponent={
        <>
          {toolbar}
          {!!inbox.error && (
            <Banner
              tone={inbox.items.length ? 'warning' : 'error'}
              message={inbox.error.message}
              action={{ label: 'Reintentar', onPress: () => void inbox.reload() }}
              onClose={inbox.dismissError}
            />
          )}
        </>
      }
      renderItem={({ item }) => <NotificationItem item={item} onPress={() => void open(item)} />}
      ListEmptyComponent={
        inbox.error ? null : (
          <View style={emptyStyle}>
            <View style={emptyIconStyle}>
              <Ionicons name="notifications-off-outline" size={44} color={theme.colors.primary} />
            </View>
            <Text style={emptyTitleStyle}>Todavía no tienes notificaciones</Text>
            <Text style={emptyTextStyle}>
              Aquí aparecerán las alertas de tus medidores y de tu válvula: una fuga, un medidor desconectado o el agua cerrada.
            </Text>
          </View>
        )
      }
      ListFooterComponent={
        inbox.loadingMore ? <ActivityIndicator color={theme.colors.primary} style={{ marginVertical: theme.spacing.lg }} /> : null
      }
    />
  );
};

const screenStyle: ViewStyle = { flex: 1, backgroundColor: theme.colors.background };
const contentStyle: ViewStyle = { padding: theme.spacing.lg, flexGrow: 1 };
const centerStyle: ViewStyle = {
  flex: 1,
  alignItems: 'center',
  justifyContent: 'center',
  gap: theme.spacing.md,
  backgroundColor: theme.colors.background,
};
const mutedStyle: TextStyle = { ...theme.textStyles.caption, color: theme.colors.textMuted };
const toolbarStyle: ViewStyle = {
  flexDirection: 'row',
  flexWrap: 'wrap',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: theme.spacing.sm,
  marginBottom: theme.spacing.md,
};
const countStyle: TextStyle = { ...theme.textStyles.h2, fontSize: 20, color: theme.colors.textPrimary };
const actionsStyle: ViewStyle = { flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.sm, maxWidth: '100%' };
const emptyStyle: ViewStyle = { alignItems: 'center', gap: theme.spacing.md, paddingVertical: theme.spacing.huge };
const emptyIconStyle: ViewStyle = {
  width: 88,
  height: 88,
  borderRadius: 44,
  backgroundColor: theme.colors.infoBg,
  alignItems: 'center',
  justifyContent: 'center',
};
const emptyTitleStyle: TextStyle = { ...theme.textStyles.h2, fontSize: 20, color: theme.colors.textPrimary, textAlign: 'center' };
const emptyTextStyle: TextStyle = {
  ...theme.textStyles.caption,
  fontSize: 15,
  color: theme.colors.textSecondary,
  textAlign: 'center',
  maxWidth: 420,
};
