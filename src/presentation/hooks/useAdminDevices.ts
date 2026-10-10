import { useCallback, useEffect, useRef, useState } from 'react';
import { adminDeviceRepository } from '../../core/di/container';
import { AppError } from '../../domain/common/AppError';
import { AdminDevicePage, AdminLinkFilter, AdminStatusFilter } from '../../domain/admin/AdminDevices';
import { AdminDeviceRepository } from '../../domain/admin/AdminDeviceRepository';
import { toAppError } from '../../infrastructure/http/httpError';
import { SEARCH_DEBOUNCE_MS } from './useAdminUsers';

const PAGE_SIZE = 20;

/**
 * Admin panel of meters: the list with search by serial, the two filters (connection and link) and pages (they start at 0).
 * Changing the search or a filter goes back to the first page. The numbers of the top cards come with the page.
 */
export const useAdminDevices = (repository: AdminDeviceRepository = adminDeviceRepository) => {
  const [search, setSearch] = useState('');
  const [debounced, setDebounced] = useState('');
  const [status, setStatus] = useState<AdminStatusFilter>('ALL');
  const [link, setLink] = useState<AdminLinkFilter>('ALL');
  const [pageNumber, setPageNumber] = useState(0);

  const [data, setData] = useState<AdminDevicePage | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<AppError | null>(null);
  const latest = useRef(0);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(search), SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [search]);

  const load = useCallback(async () => {
    const request = ++latest.current;
    setLoading(true);
    try {
      const result = await repository.list({ search: debounced, status, link, page: pageNumber, size: PAGE_SIZE });
      if (request !== latest.current) return;
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
  }, [repository, debounced, status, link, pageNumber]);

  useEffect(() => {
    void load();
  }, [load]);

  return {
    search,
    status,
    link,
    page: pageNumber,
    data,
    loading,
    error,
    setSearch: (value: string) => {
      setSearch(value);
      setPageNumber(0);
    },
    setStatus: (value: AdminStatusFilter) => {
      setStatus(value);
      setPageNumber(0);
    },
    setLink: (value: AdminLinkFilter) => {
      setLink(value);
      setPageNumber(0);
    },
    goTo: (next: number) => setPageNumber(Math.max(0, next)),
    reload: load,
    dismissError: () => setError(null),
  };
};
