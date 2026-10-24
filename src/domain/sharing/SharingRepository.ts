import {
  GuestLink,
  InboxInvitation,
  Invitation,
  Member,
  Permission,
  PlaceAccess,
  SentInvitation,
  SharedPlace,
} from './Sharing';

export interface SharingRepository {
  /** What the signed-in person may do in the place; fails with not_found when they have no access at all. */
  getAccess(placeId: string): Promise<PlaceAccess>;
  /** A collaborator leaves the place by themselves. */
  leave(placeId: string): Promise<void>;

  /** The active guest link, or null when the place has none (HU-039). */
  getGuestLink(placeId: string): Promise<GuestLink | null>;
  /** Creates the link or returns the active one; `regenerate` replaces it and the old link stops working. */
  createGuestLink(placeId: string, regenerate?: boolean): Promise<GuestLink>;
  deactivateGuestLink(placeId: string): Promise<void>;

  listInvitations(placeId: string): Promise<Invitation[]>;
  invite(placeId: string, email: string, permissions: Permission[]): Promise<SentInvitation>;
  cancelInvitation(placeId: string, invitationId: string): Promise<void>;

  listMembers(placeId: string): Promise<Member[]>;
  changePermissions(placeId: string, memberId: string, permissions: Permission[]): Promise<Member>;
  revokeMember(placeId: string, memberId: string): Promise<void>;

  /** The places of other people where the signed-in person collaborates (HU-045). */
  listSharedPlaces(): Promise<SharedPlace[]>;
  /** Invitations waiting for the signed-in person (HU-043). */
  listInbox(): Promise<InboxInvitation[]>;
  acceptInvitation(invitationId: string): Promise<SharedPlace>;
  rejectInvitation(invitationId: string): Promise<void>;
}
