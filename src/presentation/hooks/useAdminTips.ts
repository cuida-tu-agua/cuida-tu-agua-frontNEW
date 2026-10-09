import { useCallback, useEffect, useRef, useState } from 'react';
import { adminTipRepository } from '../../core/di/container';
import { AppError } from '../../domain/common/AppError';
import { AdminTip, TipCategory, TipInput } from '../../domain/tips/Tip';
import { AdminTipRepository } from '../../domain/tips/TipRepository';
import { toAppError } from '../../infrastructure/http/httpError';

/**
 * HU-063 / HU-064: the tips for the administrator, inactive ones included. Every change shows at once in the list with
 * what the server answers; "deactivate" never removes a tip, it only hides it from the users.
 */
export const useAdminTips = (repository: AdminTipRepository = adminTipRepository) => {
  const [category, setCategory] = useState<TipCategory | null>(null);
  const [includeInactive, setIncludeInactive] = useState(true);
  const [tips, setTips] = useState<AdminTip[] | null>(null);
  const [error, setError] = useState<AppError | null>(null);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const latest = useRef(0);

  const load = useCallback(async () => {
    const request = ++latest.current;
    setLoading(true);
    try {
      const loaded = await repository.list(category, includeInactive);
      if (request !== latest.current) return;
      setTips(loaded);
      setError(null);
    } catch (e) {
      if (request === latest.current) setError(toAppError(e));
    } finally {
      if (request === latest.current) setLoading(false);
    }
  }, [repository, category, includeInactive]);

  useEffect(() => {
    void load();
  }, [load]);

  const run = async (id: string | null, action: () => Promise<unknown>, done: string): Promise<boolean> => {
    setBusyId(id);
    setError(null);
    setNotice(null);
    try {
      await action();
      setNotice(done);
      await load();
      return true;
    } catch (e) {
      setError(toAppError(e));
      return false;
    } finally {
      setBusyId(null);
    }
  };

  return {
    tips,
    category,
    includeInactive,
    error,
    loading,
    busyId,
    notice,
    setCategory,
    setIncludeInactive,
    reload: load,
    create: (input: TipInput) => run(null, () => repository.create(input), 'Publicamos el consejo: ya lo ven todos los usuarios.'),
    edit: (id: string, input: TipInput) => run(id, () => repository.edit(id, input), 'Guardamos los cambios.'),
    setActive: (tip: AdminTip, active: boolean) =>
      run(
        tip.id,
        () => repository.setActive(tip.id, active),
        active ? 'El consejo vuelve a mostrarse a los usuarios.' : 'El consejo ya no se muestra a los usuarios (no se borró).',
      ),
    dismissNotice: () => setNotice(null),
    dismissError: () => setError(null),
  };
};
