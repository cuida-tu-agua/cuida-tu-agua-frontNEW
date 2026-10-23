import { useCallback, useRef, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { goalRepository } from '../../core/di/container';
import { AppError } from '../../domain/common/AppError';
import { deviceTimeZone } from '../../domain/consumption/consumptionFormat';
import { GoalProgress } from '../../domain/goals/Goal';
import { GoalRepository } from '../../domain/goals/GoalRepository';
import { toAppError } from '../../infrastructure/http/httpError';
import { onForeground } from './onForeground';

/** The progress follows the consumption: it is asked again at the same pace. */
export const GOAL_POLL_MS = 30_000;

interface GoalState {
  loading: boolean;
  data: GoalProgress | null;
  error: AppError | null;
}

/**
 * HU-023/024: the goal of the current month of a place. It loads when the screen gains focus and every minute; save()
 * creates or edits it and shows the answer at once. An old answer that arrives late never replaces a newer one.
 */
export const usePlaceGoal = (placeId: string, repository: GoalRepository = goalRepository) => {
  const [state, setState] = useState<GoalState>({ loading: true, data: null, error: null });
  const latest = useRef(0);

  const fetchGoal = useCallback(
    (isActive: () => boolean) => {
      const request = ++latest.current;
      const isCurrent = () => isActive() && request === latest.current;
      return repository
        .get(placeId, deviceTimeZone())
        .then((data) => {
          if (isCurrent()) setState({ loading: false, data, error: null });
        })
        .catch((error: unknown) => {
          if (isCurrent()) setState((s) => ({ ...s, loading: false, error: toAppError(error) }));
        });
    },
    [placeId, repository],
  );

  useFocusEffect(
    useCallback(() => {
      let active = true;
      const run = () => fetchGoal(() => active);
      setState((s) => ({ ...s, loading: true }));
      void run();
      const timer = setInterval(run, GOAL_POLL_MS);
      const stopForeground = onForeground(() => void run());
      return () => {
        active = false;
        clearInterval(timer);
        stopForeground();
      };
    }, [fetchGoal]),
  );

  /** Throws the AppError so the dialog can show it next to the field. */
  const save = useCallback(
    async (targetLiters: number) => {
      const request = ++latest.current; // a poll that was on its way must not bring back the old goal
      const data = await repository.set(placeId, targetLiters, deviceTimeZone());
      if (request === latest.current) setState({ loading: false, data, error: null });
      return data;
    },
    [placeId, repository],
  );

  return { ...state, reload: () => fetchGoal(() => true), save };
};
