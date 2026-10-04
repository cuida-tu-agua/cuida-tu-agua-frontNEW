export type LoginNotice = 'verified' | 'password_reset';

export type AuthStackParamList = {
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
  Places: { notice?: string } | undefined;
  CreatePlace: undefined;
  EditPlace: { placeId: string };
  PlaceDevice: { placeId: string; placeName: string };
  LinkDevice: { placeId: string; placeName: string };
  Profile: undefined;
  ChangePassword: undefined;
  DeleteAccount: undefined;
};

declare global {
  namespace ReactNavigation {
    interface RootParamList extends MainStackParamList, AuthStackParamList {}
  }
}
