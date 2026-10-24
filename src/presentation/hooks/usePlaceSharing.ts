import { useCallback, useEffect, useState } from 'react';
import { sharingRepository } from '../../core/di/container';
import { AppError } from '../../domain/common/AppError';
import { GuestLink, Invitation, Member, Permission, SentInvitation } from '../../domain/sharing/Sharing';
import { pendingInvitations } from '../../domain/sharing/sharingRules';
import { SharingRepository } from '../../domain/sharing/SharingRepository';
import { toAppError } from '../../infrastructure/http/httpError';

interface SharingState {
  loading: boolean;
  guestLink: GuestLink | null;
  invitations: Invitation[];
  members: Member[];
  error: AppError | null;
}

const EMPTY: SharingState = { loading: true, guestLink: null, invitations: [], members: [], error: null };

/**
 * Everything the owner manages about sharing one place (HU-039, HU-042, HU-043, HU-046): the guest link, the pending
 * invitations and the collaborators. The actions throw the AppError so the screen can show it where it happened.
 */
export const usePlaceSharing = (placeId: string, repository: SharingRepository = sharingRepository) => {
  const [state, setState] = useState<SharingState>(EMPTY);

  const load = useCallback(
    async (isActive: () => boolean = () => true) => {
      try {
        const [guestLink, invitations, members] = await Promise.all([
          repository.getGuestLink(placeId),
          repository.listInvitations(placeId),
          repository.listMembers(placeId),
        ]);
        if (isActive()) setState({ loading: false, guestLink, invitations: pendingInvitations(invitations), members, error: null });
      } catch (error) {
        if (isActive()) setState((s) => ({ ...s, loading: false, error: toAppError(error) }));
      }
    },
    [placeId, repository],
  );

  useEffect(() => {
    let active = true;
    setState(EMPTY);
    void load(() => active);
    return () => {
      active = false;
    };
  }, [load]);

  const createGuestLink = useCallback(
    async (regenerate = false) => {
      const guestLink = await repository.createGuestLink(placeId, regenerate);
      setState((s) => ({ ...s, guestLink }));
      return guestLink;
    },
    [placeId, repository],
  );

  const deactivateGuestLink = useCallback(async () => {
    await repository.deactivateGuestLink(placeId);
    setState((s) => ({ ...s, guestLink: null }));
  }, [placeId, repository]);

  const invite = useCallback(
    async (email: string, permissions: Permission[]): Promise<SentInvitation> => {
      const sent = await repository.invite(placeId, email, permissions);
      setState((s) => ({ ...s, invitations: [sent.invitation, ...s.invitations.filter((i) => i.id !== sent.invitation.id)] }));
      return sent;
    },
    [placeId, repository],
  );

  const cancelInvitation = useCallback(
    async (invitationId: string) => {
      await repository.cancelInvitation(placeId, invitationId);
      setState((s) => ({ ...s, invitations: s.invitations.filter((i) => i.id !== invitationId) }));
    },
    [placeId, repository],
  );

  const changePermissions = useCallback(
    async (memberId: string, permissions: Permission[]) => {
      const updated = await repository.changePermissions(placeId, memberId, permissions);
      setState((s) => ({ ...s, members: s.members.map((m) => (m.id === memberId ? updated : m)) }));
    },
    [placeId, repository],
  );

  const revokeMember = useCallback(
    async (memberId: string) => {
      await repository.revokeMember(placeId, memberId);
      setState((s) => ({ ...s, members: s.members.filter((m) => m.id !== memberId) }));
    },
    [placeId, repository],
  );

  return {
    ...state,
    reload: () => load(),
    createGuestLink,
    deactivateGuestLink,
    invite,
    cancelInvitation,
    changePermissions,
    revokeMember,
  };
};
