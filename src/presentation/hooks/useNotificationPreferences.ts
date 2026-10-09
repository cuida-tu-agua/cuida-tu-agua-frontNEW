import { useCallback, useEffect, useRef, useState } from 'react';
import { notificationRepository } from '../../core/di/container';
import { AppError } from '../../domain/common/AppError';
import {
  LevelPreference,
  NotificationChannel,
  SEVERITY_ORDER,
  toggleChannel,
} from '../../domain/notifications/Notification';
import { NotificationRepository } from '../../domain/notifications/NotificationRepository';
import { toAppError } from '../../infrastructure/http/httpError';

/**
 * HU-034: the channels per urgency level. Each switch is saved the moment it is tapped (no "Save" button):
 * the screen changes at once and goes back to the previous value if the server refuses.
 */
export const useNotificationPreferences = (repository: NotificationRepository = notificationRepository) => {
  const [levels, setLevels] = useState<LevelPreference[] | null>(null); // null = first load
  const [error, setError] = useState<AppError | null>(null);
  const [saving, setSaving] = useState<string | null>(null); // "SEVERITY.channel" being saved
  const current = useRef<LevelPreference[]>([]);

  const apply = (next: LevelPreference[]) => {
    current.current = next;
    setLevels(next);
  };

  const load = useCallback(async () => {
    try {
      const loaded = await repository.getPreferences();
      apply([...loaded].sort((a, b) => SEVERITY_ORDER.indexOf(a.severity) - SEVERITY_ORDER.indexOf(b.severity)));
      setError(null);
    } catch (e) {
      setError(toAppError(e));
    }
  }, [repository]);

  useEffect(() => {
    void load();
  }, [load]);

  const toggle = useCallback(
    async (severity: LevelPreference['severity'], channel: NotificationChannel) => {
      const before = current.current;
      const level = before.find((l) => l.severity === severity);
      if (!level) return;
      const changed = toggleChannel(level, channel);
      if (changed === level) return; // locked switch
      apply(before.map((l) => (l.severity === severity ? changed : l)));
      setSaving(`${severity}.${channel}`);
      setError(null);
      try {
        await repository.updatePreference(changed);
      } catch (e) {
        apply(before); // undo
        setError(toAppError(e));
      } finally {
        setSaving(null);
      }
    },
    [repository],
  );

  return { levels, error, saving, toggle, reload: load, dismissError: () => setError(null) };
};
