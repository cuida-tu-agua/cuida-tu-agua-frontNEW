/** HU-040: the guest page works without a session, so both navigators know it. */
export interface GuestParams {
  token: string;
}

/** The legal page: a document slug ("privacidad", "terminos"...) or nothing for the list. Public, like the guest page. */
export type LegalParams = { doc?: string } | undefined;

export type LoginNotice = 'verified' | 'password_reset';

export type AuthStackParamList = {
  Guest: GuestParams;
  Legal: LegalParams;
  Login: { email?: string; notice?: LoginNotice } | undefined;
  Register: undefined;
  VerifyEmail: {
    email: string;
    maskedEmail?: string;
    expiresAt?: string;
    justRegistered?: boolean;
    cooldownSeconds?: number;
  };
  ForgotPassword: { identifier?: string } | undefined;
  ResetPassword: { identifier: string; maskedEmail?: string; expiresAt?: string; cooldownSeconds?: number };
};

export type MainStackParamList = {
  Guest: GuestParams;
  Legal: LegalParams;
  Places: { notice?: string } | undefined;
  CreatePlace: undefined;
  EditPlace: { placeId: string };
  PlaceDevice: { placeId: string; placeName: string };
  LinkDevice: { placeId: string; placeName: string };
  DeviceWifiSetup: { placeId: string; placeName: string; next?: 'link' };
  PlaceDashboard: { placeId: string; placeName: string };
  ValveHistory: { placeId: string; placeName: string };
  PlaceTariff: { placeId: string; placeName: string };
  PlaceSharing: { placeId: string; placeName: string };
  Invitations: undefined;
  Tips: { placeId?: string } | undefined;
  AdminTips: undefined;
  AdminMessages: undefined;
  AdminMetrics: undefined;
  AdminUsers: undefined;
  AdminDevices: undefined;
  AdminDeviceDetail: { deviceId: string; serialNumber?: string };
  AdminDeviceCreate: undefined;
  Notifications: undefined;
  NotificationPreferences: undefined;
  Profile: undefined;
  ChangePassword: undefined;
  DeleteAccount: undefined;
};

declare global {
  namespace ReactNavigation {
    interface RootParamList extends MainStackParamList, AuthStackParamList {}
  }
}
