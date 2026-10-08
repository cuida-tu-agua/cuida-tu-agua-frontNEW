import { useCallback, useMemo, useRef, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { alertRepository } from '../../core/di/container';
import { Alert } from '../../domain/alerts/Alert';
import { AlertRepository } from '../../domain/alerts/AlertRepository';
import { countUnread, markAsReadLocally, removeLocally, sortNewestFirst } from '../../domain/alerts/alertRules';
import { AppError } from '../../domain/common/AppError';

/** HU-025: how often the list asks for new alerts again while the screen is visible. */
export const ALERTS_POLL_MS = 60_000;

interface AlertsState {
  loading: boolean;
  alerts: Alert[];
  error: AppError | null;
}

const asAppError = (error: unknown) =>
  error instanceof AppError ? error : new AppError('server', 'No se pudieron consultar las alertas.');

/**
 * Alerts of the user for the notification center and the bell.
 * Loads when the screen gains focus and every 60 s while it stays visible.
 * Marking as read and deleting are optimistic: the list changes right away and goes back
 * if the service refuses (the error is thrown so the screen can show it).
 */
export const useAlerts = (repository: AlertRepository = alertRepository) => {
  const [state, setState] = useState<AlertsState>({ loading: true, alerts: [], error: null });

  // The alerts as the user sees them now, to undo an optimistic change.
  const alertsRef = useRef<Alert[]>([]);
  // Number of the newest request. An older answer that arrives late is ignored,
  // so a poll that started before "Eliminar" cannot bring the deleted alert back.
  const latestRequest = useRef(0);

  const show = useCallback((alerts: Alert[]) => {
    alertsRef.current = alerts;
    setState((s) => ({ ...s, alerts }));
  }, []);

  const fetchAlerts = useCallback(
    (isActive: () => boolean) => {
      const requestId = ++latestRequest.current;
      const isCurrent = () => isActive() && requestId === latestRequest.current;

      return repository
        .list()
        .then((alerts) => {
          if (!isCurrent()) return;
          alertsRef.current = alerts;
          setState({ loading: false, alerts, error: null });
        })
        .catch((error: unknown) => {
          // Keep the last list on screen; just show the error next to it.
          if (isCurrent()) setState((s) => ({ ...s, loading: false, error: asAppError(error) }));
        });
    },
    [repository],
  );

  useFocusEffect(
    useCallback(() => {
      let active = true;
      const run = () => fetchAlerts(() => active);

      run();
      const timer = setInterval(run, ALERTS_POLL_MS);

      return () => {
        active = false;
        clearInterval(timer);
      };
    }, [fetchAlerts]),
  );

  /** Event handler (pull to refresh, "Reintentar"): ask again now. */
  const reload = useCallback(() => fetchAlerts(() => true), [fetchAlerts]);

  /** Runs a change with the optimistic update, and goes back if it fails. */
  const change = useCallback(
    async (optimistic: Alert[], action: () => Promise<void>) => {
      const previous = alertsRef.current;
      latestRequest.current++; // any poll still in flight is now outdated
      show(optimistic);
      try {
        await action();
      } catch (error) {
        // Already deleted somewhere else: the result the user wanted is already true.
        if (error instanceof AppError && error.code === 'alert.not_found') return;
        show(previous);
        throw asAppError(error);
      }
    },
    [show],
  );

  const markAsRead = useCallback(
    (alertId: string) => change(markAsReadLocally(alertsRef.current, alertId), () => repository.markAsRead(alertId)),
    [change, repository],
  );

  const remove = useCallback(
    (alertId: string) => change(removeLocally(alertsRef.current, alertId), () => repository.remove(alertId)),
    [change, repository],
  );

  const alerts = useMemo(() => sortNewestFirst(state.alerts), [state.alerts]);
  const unreadCount = useMemo(() => countUnread(state.alerts), [state.alerts]);

  return { loading: state.loading, error: state.error, alerts, unreadCount, reload, markAsRead, remove };
};
