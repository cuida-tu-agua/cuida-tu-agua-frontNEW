import { useCallback, useEffect, useRef, useState } from 'react';
import { guestRepository } from '../../core/di/container';
import { AppError } from '../../domain/common/AppError';
import { Consumption, ConsumptionPeriod } from '../../domain/consumption/Consumption';
import { deviceTimeZone } from '../../domain/consumption/consumptionFormat';
import { GuestRepository } from '../../domain/sharing/GuestRepository';
import { GuestPlace } from '../../domain/sharing/Sharing';
import { toAppError } from '../../infrastructure/http/httpError';

export const GUEST_POLL_MS = 60_000;

interface GuestState {
  loading: boolean;
  place: GuestPlace | null;
  consumption: Consumption | null;
  /** The link is wrong or was turned off: nothing to retry. */
  unavailable: boolean;
  error: AppError | null;
}

/**
 * HU-040/041: what a guest sees with the token of the link. No login. If the owner turns the link off while the page is
 * open, the next refresh answers 404 and the page switches to "link no longer works".
 */
export const useGuestView = (token: string, period: ConsumptionPeriod, repository: GuestRepository = guestRepository) => {
  const [state, setState] = useState<GuestState>({ loading: true, place: null, consumption: null, unavailable: false, error: null });
  const latest = useRef(0);

  const fetchAll = useCallback(
    (isActive: () => boolean) => {
      const request = ++latest.current;
      const isCurrent = () => isActive() && request === latest.current;
      return Promise.all([repository.getPlace(token), repository.getConsumption(token, period, deviceTimeZone())])
        .then(([place, consumption]) => {
          if (isCurrent()) setState({ loading: false, place, consumption, unavailable: false, error: null });
        })
        .catch((error: unknown) => {
          if (!isCurrent()) return;
          const appError = toAppError(error);
          if (appError.kind === 'not_found') setState({ loading: false, place: null, consumption: null, unavailable: true, error: null });
          else setState((s) => ({ ...s, loading: false, error: appError }));
        });
    },
    [token, period, repository],
  );

  useEffect(() => {
    let active = true;
    void fetchAll(() => active);
    const timer = setInterval(() => void fetchAll(() => active), GUEST_POLL_MS);
    return () => {
      active = false;
      clearInterval(timer);
    };
  }, [fetchAll]);

  const reload = useCallback(() => void fetchAll(() => true), [fetchAll]);

  // Another period is on its way when the data on screen is of a different one
  const loading = state.loading || (!state.unavailable && !state.error && !!state.consumption && state.consumption.period !== period);
  return { ...state, loading, reload };
};
