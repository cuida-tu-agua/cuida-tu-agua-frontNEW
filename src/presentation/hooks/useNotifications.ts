import { useCallback, useRef, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { notificationRepository } from '../../core/di/container';
import { notifyUnreadChanged } from '../../core/notifications/unreadSignal';
import { AppError } from '../../domain/common/AppError';
import { AppNotification, markedRead, mergePages } from '../../domain/notifications/Notification';
import { NotificationRepository } from '../../domain/notifications/NotificationRepository';
import { toAppError } from '../../infrastructure/http/httpError';

interface InboxState {
  /** false until the first answer arrives (show a spinner). */
  loaded: boolean;
  items: AppNotification[];
  hasMore: boolean;
  loadingMore: boolean;
  refreshing: boolean;
  error: AppError | null;
}

const INITIAL: InboxState = { loaded: false, items: [], hasMore: false, loadingMore: false, refreshing: false, error: null };

/**
 * The inbox (HU-025): newest first, 20 at a time. It reloads when the screen gains focus, so coming back from the
 * panel shows what arrived meanwhile. Reading is optimistic: the mark appears at once and is undone if the server refuses.
 */
export const useNotifications = (repository: NotificationRepository = notificationRepository) => {
  const [state, setState] = useState<InboxState>(INITIAL);
  const latest = useRef(0);
  const itemsRef = useRef<AppNotification[]>([]);

  const set = (patch: Partial<InboxState>) =>
    setState((current) => {
      const next = { ...current, ...patch };
      itemsRef.current = next.items;
      return next;
    });

  const load = useCallback(
    async (mode: 'first' | 'refresh') => {
      const request = ++latest.current;
      if (mode === 'refresh') set({ refreshing: true });
      try {
        const page = await repository.list();
        if (request !== latest.current) return;
        set({ loaded: true, items: page.items, hasMore: page.hasMore, error: null, refreshing: false });
      } catch (error) {
        if (request !== latest.current) return;
        set({ loaded: true, error: toAppError(error), refreshing: false });
      }
    },
    [repository],
  );

  useFocusEffect(
    useCallback(() => {
      void load('first');
    }, [load]),
  );

  const loadMore = useCallback(async () => {
    const last = itemsRef.current[itemsRef.current.length - 1];
    if (!last || state.loadingMore || !state.hasMore) return;
    set({ loadingMore: true });
    try {
      const page = await repository.list({ before: last.createdAt });
      set({ items: mergePages(itemsRef.current, page.items), hasMore: page.hasMore, loadingMore: false });
    } catch (error) {
      set({ loadingMore: false, error: toAppError(error) });
    }
  }, [repository, state.hasMore, state.loadingMore]);

  const markRead = useCallback(
    async (id: string) => {
      const before = itemsRef.current;
      if (!before.some((n) => n.id === id && !n.isRead)) return;
      set({ items: before.map((n) => (n.id === id ? markedRead(n) : n)) });
      try {
        await repository.markRead(id);
        notifyUnreadChanged();
      } catch (error) {
        set({ items: before, error: toAppError(error) }); // undo
      }
    },
    [repository],
  );

  const markAllRead = useCallback(async () => {
    const before = itemsRef.current;
    if (!before.some((n) => !n.isRead)) return;
    set({ items: before.map((n) => markedRead(n)) });
    try {
      await repository.markAllRead();
      notifyUnreadChanged();
    } catch (error) {
      set({ items: before, error: toAppError(error) });
    }
  }, [repository]);

  return {
    ...state,
    unread: state.items.filter((n) => !n.isRead).length,
    refresh: () => load('refresh'),
    reload: () => load('first'),
    loadMore,
    markRead,
    markAllRead,
    dismissError: () => set({ error: null }),
  };
};
