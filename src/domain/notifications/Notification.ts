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

export const SEVERITY_LABELS: Record<NotificationSeverity, string> = {
  CRITICAL: 'Críticas',
  WARNING: 'Importantes',
  INFO: 'Informativas',
};

export const SEVERITY_HINTS: Record<NotificationSeverity, string> = {
  CRITICAL: 'Una fuga o la válvula cerrada: necesitan tu atención ya.',
  WARNING: 'Algo que conviene revisar, como un medidor desconectado.',
  INFO: 'Avisos tranquilos: un medidor vinculado o reconectado.',
};

export const CHANNEL_LABELS: Record<NotificationChannel, string> = {
  inApp: 'En la app',
  push: 'Notificación al celular',
  email: 'Correo',
  sms: 'SMS / WhatsApp',
};

export const CHANNELS: NotificationChannel[] = ['inApp', 'push', 'email', 'sms'];

/**
 * Switches the user cannot turn off or on, and why:
 *  - a critical alert always keeps the in-app channel (the backend refuses to turn it off too);
 *  - SMS / WhatsApp is not available yet (HU-028).
 */
export const lockOf = (severity: NotificationSeverity, channel: NotificationChannel): 'always' | 'soon' | null => {
  if (channel === 'sms') return 'soon';
  if (channel === 'inApp' && severity === 'CRITICAL') return 'always';
  return null;
};

/** The preference after the user taps a switch. A locked switch does not change. */
export const toggleChannel = (preference: LevelPreference, channel: NotificationChannel): LevelPreference =>
  lockOf(preference.severity, channel) ? preference : { ...preference, [channel]: !preference[channel] };

/** "99+" so the badge of the bell never grows out of its circle. Empty text = no badge. */
export const badgeText = (count: number): string => (count <= 0 ? '' : count > 99 ? '99+' : String(count));

/** "ahora", "hace 5 min", "hace 3 h", "ayer", "hace 4 días", and the date after a week. */
export const timeAgo = (iso: string, now: Date = new Date()): string => {
  const then = new Date(iso);
  const seconds = Math.floor((now.getTime() - then.getTime()) / 1000);
  if (Number.isNaN(seconds) || seconds < 45) return 'ahora';
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `hace ${minutes} min`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `hace ${hours} h`;
  const days = Math.round(hours / 24);
  if (days === 1) return 'ayer';
  if (days < 7) return `hace ${days} días`;
  return then.toLocaleDateString('es-CO', { day: 'numeric', month: 'short', year: 'numeric' });
};

/** The notification with a read mark, for the optimistic update of the list. */
export const markedRead = (item: AppNotification, now: Date = new Date()): AppNotification =>
  item.isRead ? item : { ...item, isRead: true, readAt: now.toISOString() };

/** Keeps the list free of repeated ids when a page overlaps with what is already shown. */
export const mergePages = (current: AppNotification[], next: AppNotification[]): AppNotification[] => {
  const seen = new Set(current.map((n) => n.id));
  return [...current, ...next.filter((n) => !seen.has(n.id))];
};
