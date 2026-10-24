import { AxiosInstance } from 'axios';
import { SHARING_ENDPOINTS } from '../../config/api';
import {
  GuestLink,
  InboxInvitation,
  Invitation,
  Member,
  Permission,
  PlaceAccess,
  SentInvitation,
  SharedPlace,
} from '../../domain/sharing/Sharing';
import { SharingRepository } from '../../domain/sharing/SharingRepository';
import { toAppError } from '../http/httpError';

/** Adapter: SharingRepository over HTTP (ms-places :3002). */
export class HttpSharingRepository implements SharingRepository {
  private readonly http: AxiosInstance;

  constructor(http: AxiosInstance) {
    this.http = http;
  }

  async getAccess(placeId: string): Promise<PlaceAccess> {
    try {
      const { data } = await this.http.get<PlaceAccess>(SHARING_ENDPOINTS.ACCESS(placeId));
      return data;
    } catch (error) {
      throw toAppError(error);
    }
  }

  async leave(placeId: string): Promise<void> {
    try {
      await this.http.delete(SHARING_ENDPOINTS.MEMBERSHIP(placeId));
    } catch (error) {
      throw toAppError(error);
    }
  }

  async getGuestLink(placeId: string): Promise<GuestLink | null> {
    try {
      const { data } = await this.http.get<GuestLink>(SHARING_ENDPOINTS.GUEST_LINK(placeId));
      return data;
    } catch (error) {
      const appError = toAppError(error);
      if (appError.kind === 'not_found') return null; // no link yet is a normal state, not a failure
      throw appError;
    }
  }

  async createGuestLink(placeId: string, regenerate = false): Promise<GuestLink> {
    try {
      const { data } = await this.http.post<GuestLink>(
        SHARING_ENDPOINTS.GUEST_LINK(placeId),
        undefined,
        regenerate ? { params: { regenerate: true } } : undefined,
      );
      return data;
    } catch (error) {
      throw toAppError(error);
    }
  }

  async deactivateGuestLink(placeId: string): Promise<void> {
    try {
      await this.http.delete(SHARING_ENDPOINTS.GUEST_LINK(placeId));
    } catch (error) {
      throw toAppError(error);
    }
  }

  async listInvitations(placeId: string): Promise<Invitation[]> {
    try {
      const { data } = await this.http.get<Invitation[]>(SHARING_ENDPOINTS.INVITATIONS(placeId));
      return data;
    } catch (error) {
      throw toAppError(error);
    }
  }

  async invite(placeId: string, email: string, permissions: Permission[]): Promise<SentInvitation> {
    try {
      const { data } = await this.http.post<SentInvitation>(SHARING_ENDPOINTS.INVITATIONS(placeId), { email, permissions });
      return data;
    } catch (error) {
      throw toAppError(error);
    }
  }

  async cancelInvitation(placeId: string, invitationId: string): Promise<void> {
    try {
      await this.http.delete(SHARING_ENDPOINTS.INVITATION(placeId, invitationId));
    } catch (error) {
      throw toAppError(error);
    }
  }

  async listMembers(placeId: string): Promise<Member[]> {
    try {
      const { data } = await this.http.get<Member[]>(SHARING_ENDPOINTS.MEMBERS(placeId));
      return data;
    } catch (error) {
      throw toAppError(error);
    }
  }

  async changePermissions(placeId: string, memberId: string, permissions: Permission[]): Promise<Member> {
    try {
      const { data } = await this.http.put<Member>(SHARING_ENDPOINTS.MEMBER_PERMISSIONS(placeId, memberId), { permissions });
      return data;
    } catch (error) {
      throw toAppError(error);
    }
  }

  async revokeMember(placeId: string, memberId: string): Promise<void> {
    try {
      await this.http.delete(SHARING_ENDPOINTS.MEMBER(placeId, memberId));
    } catch (error) {
      throw toAppError(error);
    }
  }

  async listSharedPlaces(): Promise<SharedPlace[]> {
    try {
      const { data } = await this.http.get<SharedPlace[]>(SHARING_ENDPOINTS.SHARED_PLACES);
      return data;
    } catch (error) {
      throw toAppError(error);
    }
  }

  async listInbox(): Promise<InboxInvitation[]> {
    try {
      const { data } = await this.http.get<InboxInvitation[]>(SHARING_ENDPOINTS.INBOX);
      return data;
    } catch (error) {
      throw toAppError(error);
    }
  }

  async acceptInvitation(invitationId: string): Promise<SharedPlace> {
    try {
      const { data } = await this.http.post<SharedPlace>(SHARING_ENDPOINTS.ACCEPT(invitationId));
      return data;
    } catch (error) {
      throw toAppError(error);
    }
  }

  async rejectInvitation(invitationId: string): Promise<void> {
    try {
      await this.http.post(SHARING_ENDPOINTS.REJECT(invitationId));
    } catch (error) {
      throw toAppError(error);
    }
  }
}
