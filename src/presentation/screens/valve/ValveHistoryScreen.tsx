import React, { useCallback, useState } from 'react';
import { ActivityIndicator, FlatList, RefreshControl, Text, TextStyle, View, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { valveRepository } from '../../../core/di/container';
import { AppError } from '../../../domain/common/AppError';
import { ValveCommand, ValveCommandStatus } from '../../../domain/valve/Valve';
import { describeRequester, STATUS_LABELS } from '../../../domain/valve/valveRules';
import { toAppError } from '../../../infrastructure/http/httpError';
import { Banner } from '../../components/common/Banner';
import { MainStackParamList } from '../../navigation/types';
import { theme } from '../../styles/theme';
import { themed } from '../../styles/themeRuntime';

type Props = NativeStackScreenProps<MainStackParamList, 'ValveHistory'>;

const STATUS_COLOR: Record<ValveCommandStatus, string> = themed(() => ({
  SENT: theme.colors.info,
  ACK_SUCCESS: theme.colors.success,
  ACK_TIMEOUT: theme.colors.warning,
  FAILED: theme.colors.error,
}));

const formatDate = (iso: string) => new Date(iso).toLocaleString('es-CO', { dateStyle: 'medium', timeStyle: 'short' });

export const ValveHistoryScreen: React.FC<Props> = ({ route }) => {
  const { placeId } = route.params;
  const [items, setItems] = useState<ValveCommand[] | null>(null);
  const [error, setError] = useState<AppError | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      setItems(await valveRepository.listCommands(placeId));
      setError(null);
    } catch (e) {
      setError(toAppError(e));
    }
  }, [placeId]);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      valveRepository
        .listCommands(placeId)
        .then((list) => {
          if (!active) return;
          setItems(list);
          setError(null);
        })
        .catch((e: unknown) => {
          if (active) setError(toAppError(e));
        });
      return () => {
        active = false;
      };
    }, [placeId]),
  );

  const refresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  if (items === null && !error) {
    return (
      <View style={centeredStyle}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <FlatList
      style={screenStyle}
      contentContainerStyle={contentStyle}
      data={items ?? []}
      keyExtractor={(c) => c.id}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={theme.colors.primary} />}
      ListHeaderComponent={
        <>
          {!!error && <Banner tone="error" message={error.message} />}
          <Text style={mutedStyle}>Últimos 30 días</Text>
        </>
      }
      ListEmptyComponent={!error ? <Text style={mutedStyle}>Todavía no se ha abierto ni cerrado la válvula.</Text> : null}
      renderItem={({ item }) => (
        <View style={rowStyle}>
          <View style={[iconStyle, { backgroundColor: item.action === 'CLOSE' ? theme.colors.errorBg : theme.colors.successBg }]}>
            <Ionicons
              name={item.action === 'CLOSE' ? 'lock-closed' : 'lock-open'}
              size={18}
              color={item.action === 'CLOSE' ? theme.colors.error : theme.colors.success}
            />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={titleStyle}>{item.action === 'CLOSE' ? 'Cerrar agua' : 'Abrir agua'}</Text>
            <Text style={mutedLeftStyle}>
              {formatDate(item.createdAt)} · {describeRequester(item)}
            </Text>
            {!!item.failureReason && item.status !== 'ACK_SUCCESS' && (
              <Text style={mutedLeftStyle} numberOfLines={2}>
                {item.status === 'ACK_TIMEOUT' ? 'El medidor no respondió a tiempo.' : 'No se pudo completar.'}
              </Text>
            )}
          </View>
          <Text style={[statusStyle, { color: STATUS_COLOR[item.status] }]}>{STATUS_LABELS[item.status]}</Text>
        </View>
      )}
    />
  );
};

const screenStyle: ViewStyle = themed(() => ({ flex: 1, backgroundColor: theme.colors.background }));
const contentStyle: ViewStyle = { padding: theme.spacing.lg, gap: theme.spacing.sm };
const centeredStyle: ViewStyle = themed(() => ({ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.colors.background }));
const rowStyle: ViewStyle = themed(() => ({
  flexDirection: 'row',
  alignItems: 'center',
  gap: theme.spacing.md,
  padding: theme.spacing.md,
  borderRadius: theme.borderRadius.medium,
  borderWidth: 1,
  borderColor: theme.colors.border,
  backgroundColor: theme.colors.surface,
}));
const iconStyle: ViewStyle = { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' };
const titleStyle: TextStyle = themed(() => ({ ...theme.textStyles.button, color: theme.colors.textPrimary }));
const mutedStyle: TextStyle = themed(() => ({ ...theme.textStyles.caption, color: theme.colors.textMuted, textAlign: 'center', marginBottom: theme.spacing.sm }));
const mutedLeftStyle: TextStyle = themed(() => ({ ...theme.textStyles.caption, color: theme.colors.textMuted }));
const statusStyle: TextStyle = { ...theme.textStyles.caption, fontWeight: '800', maxWidth: 96, textAlign: 'right' };
