export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  /** HU-028: the phone was proved with a code; critical alerts reach it by phoneChannel. */
  phoneVerified?: boolean;
  phoneChannel?: 'SMS' | 'WHATSAPP' | null;
  avatarUrl: string | null; // relative to ms-iam, e.g. "/api/avatars/abc.jpg"
  emailVerified: boolean;
  roles: string[];
  createdAt: string; // ISO 8601, UTC
}

export interface SignInMethods {
  password: boolean;
  google: boolean;
}

export interface UpdateProfileInput {
  firstName: string;
  lastName: string;
  phone: string | null; // null or "" removes it
}

export interface AvatarFile {
  uri: string;
  mimeType: 'image/jpeg' | 'image/png';
  fileName: string;
}
