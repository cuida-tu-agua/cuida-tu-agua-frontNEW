import { LinkingOptions } from '@react-navigation/native';
import { Platform } from 'react-native';

/**
 * Web: every screen has an address, so the URL shows where the person is and a refresh opens the same screen.
 * Screens that need data from the flow that opened them (the e-mail to verify, the code to reset) have no address:
 * a refresh there goes to the start of the flow instead of breaking.
 */
export const linking: LinkingOptions<ReactNavigation.RootParamList> = {
  enabled: Platform.OS === 'web',
  prefixes: [],
  config: {
    screens: {
      Login: 'login',
      Register: 'register',
      ForgotPassword: 'forgot-password',

      Guest: 'guest/:token',

      Places: 'places',
      CreatePlace: 'places/new',
      EditPlace: 'places/:placeId/edit',
      PlaceDashboard: 'places/:placeId/dashboard',
      PlaceDevice: 'places/:placeId/device',
      LinkDevice: 'places/:placeId/device/link',
      DeviceWifiSetup: 'places/:placeId/device/wifi',
      ValveHistory: 'places/:placeId/valve',
      PlaceTariff: 'places/:placeId/tariff',
      PlaceSharing: 'places/:placeId/sharing',
      Invitations: 'invitations',
      Tips: 'tips',
      Notifications: 'notifications',
      NotificationPreferences: 'notifications/preferences',
      Profile: 'profile',
      ChangePassword: 'profile/password',
      DeleteAccount: 'profile/delete',

      AdminTips: 'admin/tips',
      AdminMessages: 'admin/messages',
      AdminMetrics: 'admin/metrics',
      AdminUsers: 'admin/users',
      AdminDevices: 'admin/devices',
      AdminDeviceCreate: 'admin/devices/new',
      AdminDeviceDetail: 'admin/devices/:deviceId',
    },
  },
};
