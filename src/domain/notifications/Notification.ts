import i18n from '../../i18n';
import { formatDate } from '../../i18n/format';
/** What ms-notification sends. Values are the SNAKE_CASE_UPPER strings of its JSON. */
export type NotificationSeverity = 'INFO' | 'WARNING' | 'CRITICAL';

export type NotificationType =
  | 'DEVICE_LINKED'
  | 'DEVICE_UNLINKED'
  | 'VALVE_CHANGED'
  | 'DEVICE_OFFLINE'
  | 'SYSTEM_ANNOUNCEMENT';

export interface AppNotification {
  id: string;
  type: NotificationType;
  severity: NotificationSeverity;
  title: string;
  body: string;
  placeId: string | null;
  createdAt: string; // ISO 8601, UTC
  isRead: boolean;
  readAt: string | null;
}

export type NotificationChannel = 'inApp' | 'push' | 'email' | 'sms';

/** The four switches of one urgency level (HU-034). */
export interface LevelPreference {
  severity: NotificationSeverity;
  inApp: boolean;
  push: boolean;
  email: boolean;
  sms: boolean;
}

export interface NotificationPage {
  items: AppNotification[];
  /** true when there may be older ones: ask again with `before` = createdAt of the last item. */
  hasMore: boolean;
}

export const PAGE_SIZE = 20;

export const SEVERITY_ORDER: NotificationSeverity[] = ['CRITICAL', 'WARNING', 'INFO'];

/** Getters: the text follows the language active when it is read. */
export const SEVERITY_LABELS: Record<NotificationSeverity, string> = {
  get CRITICAL() {
    return i18n.t('notifications.severity.CRITICAL');
  },
  get WARNING() {
    return i18n.t('notifications.severity.WARNING');
  },
  get INFO() {
    return i18n.t('notifications.severity.INFO');
  },
};

export const SEVERITY_HINTS: Record<NotificationSeverity, string> = {
  get CRITICAL() {
    return i18n.t('notifications.severityHint.CRITICAL');
  },
  get WARNING() {
    return i18n.t('notifications.severityHint.WARNING');
  },
  get INFO() {
    return i18n.t('notifications.severityHint.INFO');
  },
};

export const CHANNEL_LABELS: Record<NotificationChannel, string> = {
  get inApp() {
    return i18n.t('notifications.channel.inApp');
  },
  get push() {
    return i18n.t('notifications.channel.push');
  },
  get email() {
    return i18n.t('notifications.channel.email');
  },
  get sms() {
    return i18n.t('notifications.channel.sms');
  },
};

export const CHANNELS: NotificationChannel[] = ['inApp', 'push', 'email', 'sms'];

/** HU-028: SMS / WhatsApp is only for critical alerts, so the other levels do not even show that switch. */
export const channelsFor = (severity: NotificationSeverity): NotificationChannel[] =>
  severity === 'CRITICAL' ? CHANNELS : CHANNELS.filter((channel) => channel !== 'sms');

/**
 * Switches the user cannot turn off or on, and why:
 *  - a critical alert always keeps the in-app channel (the backend refuses to turn it off too);
 *  - SMS / WhatsApp needs a verified phone first (HU-028); it does not exist below critical (see channelsFor).
 */
export const lockOf = (
  severity: NotificationSeverity,
  channel: NotificationChannel,
  phoneVerified = false,
): 'always' | 'needsPhone' | 'criticalOnly' | null => {
  if (channel === 'sms') return severity !== 'CRITICAL' ? 'criticalOnly' : phoneVerified ? null : 'needsPhone';
  if (channel === 'inApp' && severity === 'CRITICAL') return 'always';
  return null;
};

/** The preference after the user taps a switch. A locked switch does not change. */
export const toggleChannel = (preference: LevelPreference, channel: NotificationChannel, phoneVerified = false): LevelPreference =>
  lockOf(preference.severity, channel, phoneVerified) ? preference : { ...preference, [channel]: !preference[channel] };

/** "99+" so the badge of the bell never grows out of its circle. Empty text = no badge. */
export const badgeText = (count: number): string => (count <= 0 ? '' : count > 99 ? '99+' : String(count));

/** "now", "5 min ago", "3 h ago", "yesterday", "4 days ago", and the date after a week (in the active language). */
export const timeAgo = (iso: string, now: Date = new Date()): string => {
  const then = new Date(iso);
  const seconds = Math.floor((now.getTime() - then.getTime()) / 1000);
  if (Number.isNaN(seconds) || seconds < 45) return i18n.t('notifications.timeAgo.now');
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return i18n.t('notifications.timeAgo.minutes', { count: minutes });
  const hours = Math.round(minutes / 60);
  if (hours < 24) return i18n.t('notifications.timeAgo.hours', { count: hours });
  const days = Math.round(hours / 24);
  if (days === 1) return i18n.t('notifications.timeAgo.yesterday');
  if (days < 7) return i18n.t('notifications.timeAgo.days', { count: days });
  return formatDate(then);
};

/** The notification with a read mark, for the optimistic update of the list. */
export const markedRead = (item: AppNotification, now: Date = new Date()): AppNotification =>
  item.isRead ? item : { ...item, isRead: true, readAt: now.toISOString() };

/** Keeps the list free of repeated ids when a page overlaps with what is already shown. */
export const mergePages = (current: AppNotification[], next: AppNotification[]): AppNotification[] => {
  const seen = new Set(current.map((n) => n.id));
  return [...current, ...next.filter((n) => !seen.has(n.id))];
};
