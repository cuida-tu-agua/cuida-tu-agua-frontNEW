import { useCallback, useRef, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { tariffRepository } from '../../core/di/container';
import { AppError } from '../../domain/common/AppError';
import { ConsumptionPeriod } from '../../domain/consumption/Consumption';
import { deviceTimeZone } from '../../domain/consumption/consumptionFormat';
import { CostEstimate } from '../../domain/tariffs/Tariff';
import { TariffRepository } from '../../domain/tariffs/TariffRepository';
import { toAppError } from '../../infrastructure/http/httpError';

/** The cost follows the consumption: it is asked again at the same pace. */
export const COST_POLL_MS = 60_000;

interface CostState {
  loading: boolean;
  data: CostEstimate | null;
  error: AppError | null;
}

/**
 * HU-056: what the water of the selected period costs. It loads when the screen gains focus (so a tariff just saved in
 * "Tarifa" is already applied when the user comes back) and again every minute. An old answer that arrives late, or one
 * of another period, never replaces the newest one.
 */
export const usePlaceCost = (
  placeId: string,
  period: ConsumptionPeriod,
  repository: TariffRepository = tariffRepository,
) => {
  const [state, setState] = useState<CostState>({ loading: true, data: null, error: null });
  const latest = useRef(0);

  const fetchCost = useCallback(
    (isActive: () => boolean) => {
      const request = ++latest.current;
      const isCurrent = () => isActive() && request === latest.current;
      return repository
        .cost(placeId, period, deviceTimeZone())
        .then((data) => {
          if (isCurrent()) setState({ loading: false, data, error: null });
        })
        .catch((error: unknown) => {
          if (isCurrent()) setState((s) => ({ ...s, loading: false, error: toAppError(error) }));
        });
    },
    [placeId, period, repository],
  );

  useFocusEffect(
    useCallback(() => {
      let active = true;
      const run = () => fetchCost(() => active);
      setState((s) => ({ ...s, loading: true }));
      void run();
      const timer = setInterval(run, COST_POLL_MS);
      return () => {
        active = false;
        clearInterval(timer);
      };
    }, [fetchCost]),
  );

  return { ...state, reload: () => fetchCost(() => true) };
};
