import { useCallback, useEffect, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { adminDeviceRepository } from '../../core/di/container';
import { AppError } from '../../domain/common/AppError';
import { AdminDeviceDetail, FactoryDevice } from '../../domain/admin/AdminDevices';
import { AdminDeviceRepository } from '../../domain/admin/AdminDeviceRepository';
import { toAppError } from '../../infrastructure/http/httpError';

/**
 * Detail of ONE meter plus the two things an administrator can do to it: new credentials and decommission.
 * The new credentials are returned ONCE: the screen keeps them in `issued` until it is closed, nothing else stores them.
 */
export const useAdminDevice = (id: string, repository: AdminDeviceRepository = adminDeviceRepository) => {
  const [device, setDevice] = useState<AdminDeviceDetail | null>(null);
  const [error, setError] = useState<AppError | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [issued, setIssued] = useState<FactoryDevice | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setDevice(await repository.get(id));
      setError(null);
    } catch (e) {
      setError(toAppError(e));
    } finally {
      setLoading(false);
    }
  }, [id, repository]);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load]),
  );

  // Another meter was opened: forget the credentials of the previous one
  useEffect(() => setIssued(null), [id]);

  const act = async (work: () => Promise<void>) => {
    setBusy(true);
    setError(null);
    try {
      await work();
    } catch (e) {
      setError(toAppError(e));
    } finally {
      setBusy(false);
    }
  };

  const regenerate = () =>
    act(async () => {
      setIssued(await repository.regenerateCredentials(id));
      setDevice(await repository.get(id));
    });

  const decommission = () =>
    act(async () => {
      setDevice(await repository.decommission(id));
    });

  return {
    device,
    error,
    loading,
    busy,
    issued,
    reload: load,
    regenerate,
    decommission,
    closeIssued: () => setIssued(null),
    dismissError: () => setError(null),
  };
};
