import { useCallback, useEffect, useRef, useState } from 'react';
import { adminRepository } from '../../core/di/container';
import { AppError } from '../../domain/common/AppError';
import { AdminUser, DEFAULT_PAGE_SIZE, Page, StatusFilter, fullName } from '../../domain/admin/Admin';
import { AdminRepository } from '../../domain/admin/AdminRepository';
import { toAppError } from '../../infrastructure/http/httpError';

/** Wait this long after the last key before searching, so typing "maria" does not send five requests. */
export const SEARCH_DEBOUNCE_MS = 350;

/**
 * HU-059 / HU-060: the list of users with search, status filter and pages (they start at 0), plus block and unblock.
 * Changing the search or the filter goes back to the first page; blocking updates the row with what the server answers.
 */
export const useAdminUsers = (repository: AdminRepository = adminRepository) => {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<StatusFilter>('ALL');
  const [pageNumber, setPageNumber] = useState(0);
  const [debounced, setDebounced] = useState('');

  const [data, setData] = useState<Page<AdminUser> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<AppError | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const latest = useRef(0);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(search), SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [search]);

  const load = useCallback(async () => {
    const request = ++latest.current;
    setLoading(true);
    try {
      const result = await repository.listUsers({
        search: debounced,
        status: status === 'ALL' ? null : status,
        page: pageNumber,
        size: DEFAULT_PAGE_SIZE,
      });
      if (request !== latest.current) return;
      // The last page can disappear (someone else deleted accounts): step back instead of showing an empty page
      if (result.items.length === 0 && result.totalPages > 0 && pageNumber >= result.totalPages) {
        setPageNumber(result.totalPages - 1);
        return;
      }
      setData(result);
      setError(null);
    } catch (e) {
      if (request === latest.current) setError(toAppError(e));
    } finally {
      if (request === latest.current) setLoading(false);
    }
  }, [repository, debounced, status, pageNumber]);

  useEffect(() => {
    void load();
  }, [load]);

  const replace = (updated: AdminUser) =>
    setData((current) => (current ? { ...current, items: current.items.map((u) => (u.id === updated.id ? updated : u)) } : current));

  const act = async (user: AdminUser, run: () => Promise<AdminUser>, done: string) => {
    setBusyId(user.id);
    setError(null);
    setNotice(null);
    try {
      replace(await run());
      setNotice(done);
      // With a status filter the row no longer belongs to the list: ask again so it moves
      if (status !== 'ALL') void load();
    } catch (e) {
      setError(toAppError(e));
    } finally {
      setBusyId(null);
    }
  };

  const block = (user: AdminUser, reason?: string) =>
    act(user, () => repository.blockUser(user.id, reason), `Bloqueaste a ${fullName(user)}. Sus sesiones se cerraron.`);

  const unblock = (user: AdminUser) =>
    act(user, () => repository.unblockUser(user.id), `${fullName(user)} puede volver a entrar.`);

  return {
    search,
    status,
    page: pageNumber,
    data,
    loading,
    error,
    notice,
    busyId,
    setSearch: (value: string) => {
      setSearch(value);
      setPageNumber(0);
    },
    setStatus: (value: StatusFilter) => {
      setStatus(value);
      setPageNumber(0);
    },
    goTo: (next: number) => setPageNumber(Math.max(0, next)),
    reload: load,
    block,
    unblock,
    dismissNotice: () => setNotice(null),
    dismissError: () => setError(null),
  };
};
