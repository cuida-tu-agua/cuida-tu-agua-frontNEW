import { Place } from '../places/Place';

/** What a collaborator may do in a place (HU-042..HU-046). The keys are the ones ms-places stores and returns. */
export type Permission =
  | 'VIEW_CONSUMPTION'
  | 'VIEW_DEVICE_STATUS'
  | 'CONTROL_VALVE'
  | 'VIEW_ALERTS'
  | 'VIEW_BILLS';

/** In the order the owner sees them when choosing. */
export const PERMISSIONS: readonly Permission[] = [
  'VIEW_CONSUMPTION',
  'VIEW_DEVICE_STATUS',
  'CONTROL_VALVE',
  'VIEW_ALERTS',
  'VIEW_BILLS',
];

/** Seeing the water is the reason to share a place, so every collaborator has it and it cannot be turned off. */
export const ALWAYS_GRANTED: Permission = 'VIEW_CONSUMPTION';

export type AccessRole = 'OWNER' | 'COLLABORATOR';

/** What the signed-in person may do in one place (GET /api/places/{id}/access). */
export interface PlaceAccess {
  placeId: string;
  role: AccessRole;
  permissions: Permission[];
}

/** The link the owner copies to share the water of the place without any login (HU-039). */
export interface GuestLink {
  id: string;
  token: string;
  /** Address the app opens with the token: {app}/guest/{token}. */
  url: string;
  createdAt: string;
}

/** What a guest sees of the place (HU-040): no ids, no address. */
export interface GuestPlace {
  name: string;
  cityName: string;
  measurementUnit: Place['measurementUnit'];
}

export type InvitationStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'EXPIRED';

/** An invitation as the owner sees it (HU-042). */
export interface Invitation {
  id: string;
  email: string;
  permissions: Permission[];
  status: InvitationStatus;
  expiresAt: string;
  createdAt: string;
  respondedAt: string | null;
}

/** The invitation was saved; emailSent says whether the mail left (the owner can see the invitation either way). */
export interface SentInvitation {
  invitation: Invitation;
  emailSent: boolean;
}

/** An invitation waiting in the inbox of the invited person (HU-043). */
export interface InboxInvitation {
  id: string;
  placeId: string;
  placeName: string;
  invitedByName: string | null;
  permissions: Permission[];
  expiresAt: string;
}

/** A person who collaborates in a place (HU-043, HU-046). */
export interface Member {
  id: string;
  userId: string;
  name: string | null;
  email: string | null;
  permissions: Permission[];
  createdAt: string;
}

/** A place of someone else where the signed-in person collaborates (HU-045). */
export interface SharedPlace {
  place: Place;
  role: AccessRole;
  permissions: Permission[];
  memberId: string;
}
