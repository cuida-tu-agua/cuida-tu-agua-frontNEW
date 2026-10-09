import { useEffect } from 'react';
import { notifyUnreadChanged } from '../../core/notifications/unreadSignal';
import { pushService } from '../../core/di/container';
import { pushDevice } from '../../core/push/pushDevice';
import { PushTapTarget } from '../../domain/push/Push';
import { navigationRef } from '../navigation/navigationRef';

const OPEN_RETRIES = 10;
const OPEN_RETRY_MS = 300;

/** Opens the inbox. At a cold start the navigator may need a moment to be ready, so it retries briefly. */
const openTarget = (target: PushTapTarget, attempt = 0): void => {
  if (navigationRef.isReady()) {
    navigationRef.navigate(target.route);
    return;
  }
  if (attempt < OPEN_RETRIES) setTimeout(() => openTarget(target, attempt + 1), OPEN_RETRY_MS);
};

/**
 * HU-026, signed-in only (it is mounted by the signed-in navigator and renders nothing):
 *  - registers this phone's push token (asks the permission the first time);
 *  - a push that arrives while the app is open refreshes the unread badge;
 *  - tapping a push (app open, in background or closed) opens the notification center.
 * On the web all of this is a no-op.
 */
export const PushBridge: React.FC = () => {
  useEffect(() => {
    void pushService.enable();

    const initial = pushDevice.initialTap();
    if (initial) openTarget(initial);

    const stopTap = pushDevice.onTap((target) => openTarget(target));
    const stopReceived = pushDevice.onReceived(notifyUnreadChanged);
    return () => {
      stopTap();
      stopReceived();
    };
  }, []);

  return null;
};
