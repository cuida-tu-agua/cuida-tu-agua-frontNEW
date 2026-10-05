import { useCallback, useRef, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { consumptionRepository } from '../../core/di/container';
import { AppError } from '../../domain/common/AppError';
import { Consumption, ConsumptionPeriod } from '../../domain/consumption/Consumption';
import { ConsumptionRepository } from '../../domain/consumption/ConsumptionRepository';
import { deviceTimeZone } from '../../domain/consumption/consumptionFormat';

export const CONSUMPTION_POLL_MS = 60_000;

interface ConsumptionState {
  loading: boolean;
  data: Consumption | null;
  error: AppError | null;
}

const asAppError = (error: unknown) =>
  error instanceof AppError ? error : new AppError('server', 'No se pudo consultar el consumo.');

export const useConsumption = (
  placeId: string,
  period: ConsumptionPeriod,
  repository: ConsumptionRepository = consumptionRepository,
) => {
  const [state, setState] = useState<ConsumptionState>({ loading: true, data: null, error: null });
  const latestRequest = useRef(0);

  const fetchConsumption = useCallback(
    (isActive: () => boolean) => {
      const requestId = ++latestRequest.current;
      const isCurrent = () => isActive() && requestId === latestRequest.current;
      return repository
        .get(placeId, period, deviceTimeZone())
        .then((data) => {
          if (isCurrent()) setState({ loading: false, data, error: null });
        })
        .catch((error: unknown) => {
          if (isCurrent()) setState((s) => ({ ...s, loading: false, error: asAppError(error) }));
        });
    },
    [placeId, period, repository],
  );

  useFocusEffect(
    useCallback(() => {
      let active = true;
      const run = () => fetchConsumption(() => active);
      setState((s) => ({ ...s, loading: true }));
      run();
      const timer = setInterval(run, CONSUMPTION_POLL_MS);
      return () => {
        active = false;
        clearInterval(timer);
      };
    }, [fetchConsumption]),
  );

  const reload = useCallback(() => {
    fetchConsumption(() => true);
  }, [fetchConsumption]);

  return { ...state, reload };
};
