import { useCallback, useEffect, useRef, useState } from 'react';
import { notificationRepository } from '../../core/di/container';
import { onUnreadChanged } from '../../core/notifications/unreadSignal';
import { NotificationRepository } from '../../domain/notifications/NotificationRepository';

/** How often the bell asks for the number while the app is open. */
export const UNREAD_POLL_MS = 60_000;

/**
 * The number on the bell (HU-025). It asks when it appears, every minute, and whenever the inbox says it changed.
 * A failure keeps the last number: a bell that blinks to zero when the network drops would be worse than a stale one.
 */
export const useUnreadCount = (repository: NotificationRepository = notificationRepository) => {
  const [count, setCount] = useState(0);
  const latest = useRef(0);

  const reload = useCallback(() => {
    const request = ++latest.current;
    return repository
      .unreadCount()
      .then((value) => {
        if (request === latest.current) setCount(value);
      })
      .catch(() => undefined);
  }, [repository]);

  useEffect(() => {
    void reload();
    const timer = setInterval(reload, UNREAD_POLL_MS);
    const unsubscribe = onUnreadChanged(() => void reload());
    return () => {
      clearInterval(timer);
      unsubscribe();
    };
  }, [reload]);

  return { count, reload };
};
