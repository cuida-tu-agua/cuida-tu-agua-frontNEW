import { useCallback, useRef, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { adminRepository } from '../../core/di/container';
import { AppError } from '../../domain/common/AppError';
import { PlatformMetrics } from '../../domain/admin/Admin';
import { AdminRepository } from '../../domain/admin/AdminRepository';
import { toAppError } from '../../infrastructure/http/httpError';

/** HU-062: the numbers are calculated on every call, so loading the screen (or pulling to refresh) is enough. */
export const useAdminMetrics = (repository: AdminRepository = adminRepository) => {
  const [metrics, setMetrics] = useState<PlatformMetrics | null>(null);
  const [error, setError] = useState<AppError | null>(null);
  const [loading, setLoading] = useState(true);
  const latest = useRef(0);

  const load = useCallback(async () => {
    const request = ++latest.current;
    setLoading(true);
    try {
      const result = await repository.metrics();
      if (request !== latest.current) return;
      setMetrics(result);
      setError(null);
    } catch (e) {
      if (request === latest.current) setError(toAppError(e));
    } finally {
      if (request === latest.current) setLoading(false);
    }
  }, [repository]);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load]),
  );

  return { metrics, error, loading, reload: load };
};
