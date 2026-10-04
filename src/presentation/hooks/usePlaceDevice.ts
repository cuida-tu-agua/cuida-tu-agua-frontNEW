import { useCallback, useRef, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { deviceRepository } from '../../core/di/container';
import { AppError } from '../../domain/common/AppError';
import { Device } from '../../domain/devices/Device';
import { DeviceRepository } from '../../domain/devices/DeviceRepository';

/** HU-013: how often the screen asks for the status again while it is visible. */
export const DEVICE_POLL_MS = 30_000;

interface PlaceDeviceState {
  /** false until the first answer arrives (show a spinner). */
  loaded: boolean;
  /** null = the place has no device. */
  device: Device | null;
  error: AppError | null;
  /** When the last successful answer arrived (for "hace X min"). */
  checkedAt: Date | null;
}

const INITIAL_STATE: PlaceDeviceState = { loaded: false, device: null, error: null, checkedAt: null };

const asAppError = (error: unknown) =>
  error instanceof AppError ? error : new AppError('server', 'No se pudo consultar el medidor.');

/**
 * Device of a place + its status. Loads when the screen gains focus (also when coming back from
 * "Vincular dispositivo") and repeats every 30 s while the screen stays visible.
 * State is only set inside promise callbacks, and ignored once the screen lost focus.
 */
export const usePlaceDevice = (placeId: string, repository: DeviceRepository = deviceRepository) => {
  const [state, setState] = useState<PlaceDeviceState>(INITIAL_STATE);

  // Number of the newest request. An older answer that arrives late (e.g. a poll that started
  // before "Desvincular") is ignored, so it cannot put the unlinked device back on screen.
  const latestRequest = useRef(0);

  /**
   * One request. State is only set inside the promise callbacks, only for the newest request,
   * and only while isActive() says the screen still cares about the answer.
   */
  const fetchDevice = useCallback(
    (isActive: () => boolean) => {
      const requestId = ++latestRequest.current;
      const isCurrent = () => isActive() && requestId === latestRequest.current;

      return repository
        .getByPlace(placeId)
        .then((device) => {
          if (isCurrent()) setState({ loaded: true, device, error: null, checkedAt: new Date() });
        })
        .catch((error: unknown) => {
          // Keep the last device on screen; just show the error next to it.
          if (isCurrent()) setState((s) => ({ ...s, loaded: true, error: asAppError(error) }));
        });
    },
    [placeId, repository],
  );

  // On focus: load now and every 30 s. On blur (or unmount): stop and ignore late answers.
  useFocusEffect(
    useCallback(() => {
      let active = true;
      const run = () => fetchDevice(() => active);

      run();
      const timer = setInterval(run, DEVICE_POLL_MS);

      return () => {
        active = false;
        clearInterval(timer);
      };
    }, [fetchDevice]),
  );

  /** Event handler ("Actualizar estado", "Reintentar"): ask again now. */
  const reload = useCallback(() => {
    fetchDevice(() => true);
  }, [fetchDevice]);

  /** HU-014. Throws AppError so the screen can show it in the dialog. */
  const unlink = useCallback(async () => {
    latestRequest.current++; // any poll still in flight is now outdated
    try {
      await repository.unlink(placeId);
    } catch (error) {
      // Already unlinked from another phone: the result the user wanted is already true.
      if (!(error instanceof AppError && error.code === 'device.not_linked')) throw error;
    }
    latestRequest.current++;
    setState((s) => ({ ...s, device: null, error: null }));
  }, [placeId, repository]);

  return { ...state, reload, unlink };
};
