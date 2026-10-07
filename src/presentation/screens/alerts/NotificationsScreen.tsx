import React, { useState } from 'react';
import { ActivityIndicator, FlatList, RefreshControl, Text, TextStyle, View, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Alert } from '../../../domain/alerts/Alert';
import { toAppError } from '../../../infrastructure/http/httpError';
import { AlertListItem } from '../../components/alerts/AlertListItem';
import { Banner } from '../../components/common/Banner';
import { Button } from '../../components/common/Button';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { useAlerts } from '../../hooks/useAlerts';
import { MainStackParamList } from '../../navigation/types';
import { theme } from '../../styles/theme';

type Props = NativeStackScreenProps<MainStackParamList, 'Notifications'>;

/** HU-025: notification center. Alerts from the newest to the oldest, mark as read, delete. */
export const NotificationsScreen: React.FC<Props> = () => {
  const { loading, error, alerts, unreadCount, reload, markAsRead, remove } = useAlerts();

  const [refreshing, setRefreshing] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<Alert | null>(null);
  const [deleting, setDeleting] = useState(false);

  const refresh = async () => {
    setRefreshing(true);
    await reload();
    setRefreshing(false);
  };

  const handleMarkAsRead = async (alertId: string) => {
    setActionError(null);
    try {
      await markAsRead(alertId);
    } catch (e) {
      setActionError(`No pudimos marcar la alerta como leída. ${toAppError(e).message}`);
    }
  };

  const handleConfirmDelete = async () => {
    if (!pendingDelete) return;
    setDeleting(true);
    setActionError(null);
    try {
      await remove(pendingDelete.id);
    } catch (e) {
      setActionError(`No pudimos eliminar la alerta. ${toAppError(e).message}`);
    } finally {
      setPendingDelete(null);
      setDeleting(false);
    }
  };

  // First load, nothing to show yet
  if (loading && alerts.length === 0 && !error) {
    return (
      <View style={centeredStyle}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={mutedStyle}>Cargando tus alertas...</Text>
      </View>
    );
  }

  // First load failed and there is nothing to show
  if (error && alerts.length === 0) {
    return (
      <View style={centeredStyle}>
        <Banner tone="error" message={error.message} />
        <Button label="Reintentar" onPress={refresh} loading={refreshing} />
      </View>
    );
  }

  return (
    <View style={screenStyle}>
      <FlatList
        data={alerts}
        keyExtractor={(a) => a.id}
        contentContainerStyle={contentStyle}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={theme.colors.primary} />}
        ListHeaderComponent={
          <>
            {!!actionError && <Banner tone="error" message={actionError} onClose={() => setActionError(null)} />}
            {!!error && <Banner tone="warning" message={`No pudimos actualizar las alertas. ${error.message}`} />}
            {alerts.length > 0 && (
              <Text style={summaryStyle}>{unreadCount > 0 ? `${unreadCount} sin leer` : 'Todo al día'}</Text>
            )}
          </>
        }
        ListEmptyComponent={
          <View style={emptyStyle}>
            <View style={emptyIconStyle}>
              <Ionicons name="notifications-off-outline" size={40} color={theme.colors.primary} />
            </View>
            <Text style={emptyTitleStyle}>No tienes alertas</Text>
            <Text style={mutedStyle}>Cuando algo requiera tu atención, como una posible fuga, lo verás aquí.</Text>
          </View>
        }
        renderItem={({ item }) => (
          <AlertListItem alert={item} onMarkAsRead={() => handleMarkAsRead(item.id)} onDelete={() => setPendingDelete(item)} />
        )}
      />

      <ConfirmDialog
        visible={!!pendingDelete}
        tone="danger"
        title="¿Eliminar esta alerta?"
        message="Desaparecerá de tu lista y no podrás recuperarla."
        confirmLabel="Sí, eliminar"
        cancelLabel="No, conservarla"
        loading={deleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setPendingDelete(null)}
      />
    </View>
  );
};

const screenStyle: ViewStyle = { flex: 1, backgroundColor: theme.colors.background };
const contentStyle: ViewStyle = { padding: theme.spacing.lg, gap: theme.spacing.sm, flexGrow: 1 };
const centeredStyle: ViewStyle = {
  flex: 1,
  alignItems: 'stretch',
  justifyContent: 'center',
  gap: theme.spacing.md,
  padding: theme.spacing.xl,
  backgroundColor: theme.colors.background,
};
const summaryStyle: TextStyle = { ...theme.textStyles.label, color: theme.colors.textMuted, textTransform: 'uppercase', marginBottom: theme.spacing.sm };
const mutedStyle: TextStyle = { ...theme.textStyles.caption, color: theme.colors.textMuted, textAlign: 'center' };
const emptyStyle: ViewStyle = { alignItems: 'center', gap: theme.spacing.md, paddingVertical: theme.spacing.xxl };
const emptyIconStyle: ViewStyle = {
  width: 80,
  height: 80,
  borderRadius: 40,
  backgroundColor: theme.colors.infoBg,
  alignItems: 'center',
  justifyContent: 'center',
};
const emptyTitleStyle: TextStyle = { ...theme.textStyles.h2, fontSize: theme.typography.sizes.h3, color: theme.colors.textPrimary, textAlign: 'center' };
