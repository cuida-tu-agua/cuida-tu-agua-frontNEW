import { useCallback, useEffect, useRef, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { valveRepository } from '../../core/di/container';
import { AppError } from '../../domain/common/AppError';
import { CodeSent, Valve, ValveCommand } from '../../domain/valve/Valve';
import { ValveRepository } from '../../domain/valve/ValveRepository';
import { COMMAND_POLL_MS, COMMAND_WAIT_MS, isFinished } from '../../domain/valve/valveRules';

export const VALVE_POLL_MS = 15_000;

interface ValveHookState {
  loaded: boolean;
  valve: Valve | null;
  noDevice: boolean;
  error: AppError | null;
  command: ValveCommand | null;
}

const asAppError = (error: unknown) =>
  error instanceof AppError ? error : new AppError('server', 'No se pudo consultar la válvula.');

export const useValve = (placeId: string, repository: ValveRepository = valveRepository) => {
  const [state, setState] = useState<ValveHookState>({
    loaded: false,
    valve: null,
    noDevice: false,
    error: null,
    command: null,
  });
  const latestRequest = useRef(0);
  const trackedId = useRef<string | null>(null);
  const trackTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const mounted = useRef(true);
  const trackRef = useRef<(command: ValveCommand) => void>(() => undefined);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      if (trackTimer.current) clearTimeout(trackTimer.current);
    };
  }, []);

  const fetchValve = useCallback(
    (isActive: () => boolean) => {
      const requestId = ++latestRequest.current;
      const isCurrent = () => isActive() && mounted.current && requestId === latestRequest.current;
      return repository
        .get(placeId)
        .then((valve) => {
          if (!isCurrent()) return;
          setState((s) => ({ ...s, loaded: true, valve, noDevice: false, error: null }));
          // Opened the screen while an order was still waiting (e.g. sent from another phone): follow it
          if (valve.pendingCommand && trackedId.current !== valve.pendingCommand.id) trackRef.current(valve.pendingCommand);
        })
        .catch((error: unknown) => {
          if (!isCurrent()) return;
          const appError = asAppError(error);
          if (appError.code === 'valve.not_found') {
            setState((s) => ({ ...s, loaded: true, valve: null, noDevice: true, error: null }));
          } else {
            setState((s) => ({ ...s, loaded: true, error: appError }));
          }
        });
    },
    [placeId, repository],
  );

  const track = useCallback(
    (command: ValveCommand) => {
      if (trackTimer.current) clearTimeout(trackTimer.current);
      trackedId.current = command.id;
      const giveUpAt = Date.now() + COMMAND_WAIT_MS;
      setState((s) => ({ ...s, command }));

      const giveUp = () => {
        if (!mounted.current || trackedId.current !== command.id) return;
        trackedId.current = null;
        setState((s) => ({ ...s, command: null }));
        fetchValve(() => true);
      };

      const poll = () => {
        repository
          .getCommand(placeId, command.id)
          .then((latest) => {
            if (!mounted.current || trackedId.current !== command.id) return;
            setState((s) => ({ ...s, command: latest }));
            if (isFinished(latest)) {
              fetchValve(() => true); // the confirmed state (HU-019)
            } else if (Date.now() < giveUpAt) {
              trackTimer.current = setTimeout(poll, COMMAND_POLL_MS);
            } else {
              giveUp();
            }
          })
          .catch(() => {
            if (!mounted.current || trackedId.current !== command.id) return;
            if (Date.now() < giveUpAt) trackTimer.current = setTimeout(poll, COMMAND_POLL_MS);
            else giveUp();
          });
      };
      trackTimer.current = setTimeout(poll, COMMAND_POLL_MS);
    },
    [placeId, repository, fetchValve],
  );

  useEffect(() => {
    trackRef.current = track;
  }, [track]);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      const run = () => fetchValve(() => active);
      run();
      const timer = setInterval(run, VALVE_POLL_MS);
      return () => {
        active = false;
        clearInterval(timer);
      };
    }, [fetchValve]),
  );

  const reload = useCallback(() => {
    fetchValve(() => true);
  }, [fetchValve]);

  const requestCloseCode = useCallback((): Promise<CodeSent> => repository.requestCloseCode(), [repository]);

  const close = useCallback(
    async (code: string) => {
      const command = await repository.close(placeId, code);
      track(command);
      fetchValve(() => true); // shows the pending order right away
      return command;
    },
    [placeId, repository, track, fetchValve],
  );

  const open = useCallback(async () => {
    const command = await repository.open(placeId);
    track(command);
    fetchValve(() => true);
    return command;
  }, [placeId, repository, track, fetchValve]);

  const dismissCommand = useCallback(() => {
    trackedId.current = null;
    setState((s) => ({ ...s, command: null }));
  }, []);

  return { ...state, reload, requestCloseCode, close, open, dismissCommand };
};
