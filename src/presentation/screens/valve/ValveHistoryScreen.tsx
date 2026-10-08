import React, { useCallback, useState } from 'react';
import { ActivityIndicator, FlatList, RefreshControl, Text, TextStyle, View, ViewStyle } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { valveRepository } from '../../../core/di/container';
import { AppError } from '../../../domain/common/AppError';
import { ValveCommand } from '../../../domain/valve/Valve';
import {
  DEFAULT_HISTORY_FILTER,
  describeFilter,
  HistoryFilter,
  HistoryPreset,
  resolveHistoryRange,
} from '../../../domain/valve/historyRange';
import { toAppError } from '../../../infrastructure/http/httpError';
import { Banner } from '../../components/common/Banner';
import { ValveHistoryFilter } from '../../components/valve/ValveHistoryFilter';
import { ValveHistoryItem } from '../../components/valve/ValveHistoryItem';
import { MainStackParamList } from '../../navigation/types';
import { theme } from '../../styles/theme';

type Props = NativeStackScreenProps<MainStackParamList, 'ValveHistory'>;

export const ValveHistoryScreen: React.FC<Props> = ({ route }) => {
  const { placeId } = route.params;
  const [items, setItems] = useState<ValveCommand[] | null>(null);
  const [error, setError] = useState<AppError | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  // What the user is choosing vs. what is already applied to the list.
  const [preset, setPreset] = useState<HistoryPreset>(DEFAULT_HISTORY_FILTER.preset);
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [applied, setApplied] = useState<HistoryFilter>(DEFAULT_HISTORY_FILTER);
  const [rangeError, setRangeError] = useState<string | null>(null);

  const fetchList = useCallback(
    async (filter: HistoryFilter) => {
      const range = resolveHistoryRange(filter);
      if (!range.ok) return; // custom ranges are validated before they are applied
      return valveRepository.listCommands(placeId, range.range);
    },
    [placeId],
  );

  const load = useCallback(async () => {
    try {
      const list = await fetchList(applied);
      if (list) setItems(list);
      setError(null);
    } catch (e) {
      setError(toAppError(e));
    }
  }, [fetchList, applied]);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      fetchList(applied)
        .then((list) => {
          if (!active || !list) return;
          setItems(list);
          setError(null);
        })
        .catch((e: unknown) => {
          if (active) setError(toAppError(e));
        });
      return () => {
        active = false;
      };
    }, [fetchList, applied]),
  );

  // A new range shows the spinner again instead of the previous range's rows.
  const applyFilter = (filter: HistoryFilter) => {
    setItems(null);
    setApplied(filter);
  };

  const changePreset = (next: HistoryPreset) => {
    setPreset(next);
    setRangeError(null);
    if (next !== 'CUSTOM') applyFilter({ preset: next, from: '', to: '' });
  };

  const applyCustom = () => {
    const candidate: HistoryFilter = { preset: 'CUSTOM', from, to };
    const result = resolveHistoryRange(candidate);
    if (!result.ok) {
      setRangeError(result.message);
      return;
    }
    setRangeError(null);
    applyFilter(candidate);
  };

  const refresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  const filterBar = (
    <ValveHistoryFilter
      preset={preset}
      from={from}
      to={to}
      error={rangeError}
      onPresetChange={changePreset}
      onFromChange={setFrom}
      onToChange={setTo}
      onApply={applyCustom}
    />
  );

  if (items === null && !error) {
    return (
      <View style={screenStyle}>
        <View style={contentStyle}>{filterBar}</View>
        <View style={centeredStyle}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
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
          {filterBar}
          {!!error && <Banner tone="error" message={error.message} />}
          <Text style={mutedStyle}>{describeFilter(applied)}</Text>
        </>
      }
      ListEmptyComponent={
        !error ? (
          <Text style={mutedStyle}>
            {applied.preset === 'MONTH' ? 'Todavía no se ha abierto ni cerrado la válvula.' : 'No hay acciones sobre la válvula en este periodo.'}
          </Text>
        ) : null
      }
      renderItem={({ item }) => <ValveHistoryItem command={item} />}
    />
  );
};

const screenStyle: ViewStyle = { flex: 1, backgroundColor: theme.colors.background };
const contentStyle: ViewStyle = { padding: theme.spacing.lg, gap: theme.spacing.sm };
const centeredStyle: ViewStyle = { flex: 1, alignItems: 'center', justifyContent: 'center' };
const mutedStyle: TextStyle = { ...theme.textStyles.caption, color: theme.colors.textMuted, textAlign: 'center', marginBottom: theme.spacing.sm };
