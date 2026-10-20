import i18n from '../../i18n';
import { DeviceStatus } from './Device';

/**
 * HU-013 labels, exactly as the acceptance criteria name them. Getters, so the text follows the language active at the
 * moment it is read (a plain object would freeze the language of the first import).
 */
export const DEVICE_STATUS_LABELS: Record<DeviceStatus, string> = {
  get CONNECTED() {
    return i18n.t('devices.status.CONNECTED');
  },
  get DISCONNECTED() {
    return i18n.t('devices.status.DISCONNECTED');
  },
  get NEVER_REPORTED() {
    return i18n.t('devices.status.NEVER_REPORTED');
  },
};

/** What the user should do for each status (null = nothing to do). */
export const DEVICE_STATUS_HINTS: Record<DeviceStatus, string | null> = {
  CONNECTED: null,
  get DISCONNECTED() {
    return i18n.t('devices.hints.DISCONNECTED');
  },
  get NEVER_REPORTED() {
    return i18n.t('devices.hints.NEVER_REPORTED');
  },
};

/**
 * "2 min ago", "3 h ago", "5 days ago". Pure function: "now" is a parameter so it can be tested.
 */
export const formatLastReport = (iso: string | null, now: Date = new Date()): string => {
  if (!iso) return i18n.t('devices.lastReport.none');

  // max(0): if the phone clock is a bit behind the server, never show "-1 min ago"
  const seconds = Math.max(0, Math.floor((now.getTime() - new Date(iso).getTime()) / 1000));
  if (seconds < 60) return i18n.t('devices.lastReport.lessThanMinute');

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return i18n.t('devices.lastReport.minutes', { count: minutes });

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return i18n.t('devices.lastReport.hours', { count: hours });

  const days = Math.floor(hours / 24);
  return days === 1 ? i18n.t('devices.lastReport.day') : i18n.t('devices.lastReport.days', { count: days });
};
