import Constants from 'expo-constants';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { PushRegistration, pushTapTarget } from '../../domain/push/Push';
import { PushDevice } from './PushDeviceTypes';

const ALERTS_CHANNEL = 'alerts';

// While the app is open the alert also shows as a banner
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

/** The EAS project id ties the token to this app. It exists after `eas init` (see README). */
const projectId = (): string | undefined =>
  (Constants.expoConfig?.extra as { eas?: { projectId?: string } } | undefined)?.eas?.projectId ?? Constants.easConfig?.projectId;

const ensurePermission = async (): Promise<boolean> => {
  const current = await Notifications.getPermissionsAsync();
  if (current.granted) return true;
  if (!current.canAskAgain) return false;
  return (await Notifications.requestPermissionsAsync()).granted;
};

export const pushDevice: PushDevice = {
  async getRegistration(): Promise<PushRegistration | null> {
    // Simulators have no push token; the web never reaches this file
    if (!Device.isDevice) return null;

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync(ALERTS_CHANNEL, {
        name: 'Alertas del agua',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
      });
    }

    if (!(await ensurePermission())) return null;

    const id = projectId();
    if (!id) return null;
    const { data } = await Notifications.getExpoPushTokenAsync({ projectId: id });
    return { token: data, platform: Platform.OS === 'ios' ? 'ios' : 'android' };
  },

  onTap(handler) {
    const subscription = Notifications.addNotificationResponseReceivedListener((response) =>
      handler(pushTapTarget(response.notification.request.content.data)),
    );
    return () => subscription.remove();
  },

  initialTap() {
    const response = Notifications.getLastNotificationResponse();
    return response ? pushTapTarget(response.notification.request.content.data) : null;
  },

  onReceived(handler) {
    const subscription = Notifications.addNotificationReceivedListener(() => handler());
    return () => subscription.remove();
  },
};
