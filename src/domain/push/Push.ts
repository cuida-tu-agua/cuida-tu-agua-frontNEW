/** HU-026: the phone's Expo push token, registered in ms-notification so the alerts can reach it. */
export type PushPlatform = 'android' | 'ios';

export interface PushRegistration {
  token: string;
  platform: PushPlatform;
}

export interface PushRepository {
  register(registration: PushRegistration): Promise<void>;
  /** Idempotent: removing a token that is not there is not an error. */
  unregister(token: string): Promise<void>;
}

/** Where tapping a push takes the user. The alert always lives in the inbox, so the inbox is the safe landing spot. */
export interface PushTapTarget {
  route: 'Notifications';
  notificationId?: string;
}

/** `data` is what ms-notification attached to the push (notificationId, type, severity, placeId). */
export const pushTapTarget = (data: unknown): PushTapTarget => {
  const notificationId = (data as { notificationId?: unknown } | null | undefined)?.notificationId;
  return { route: 'Notifications', notificationId: typeof notificationId === 'string' ? notificationId : undefined };
};
