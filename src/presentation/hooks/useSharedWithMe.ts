import { useCallback, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { sharingRepository } from '../../core/di/container';
import { AppError } from '../../domain/common/AppError';
import { InboxInvitation, SharedPlace } from '../../domain/sharing/Sharing';
import { SharingRepository } from '../../domain/sharing/SharingRepository';
import { toAppError } from '../../infrastructure/http/httpError';

interface SharedState {
  loading: boolean;
  inbox: InboxInvitation[];
  sharedPlaces: SharedPlace[];
  error: AppError | null;
}

/**
 * HU-043, HU-045: what other people shared with the signed-in person: the invitations waiting for an answer and the
 * places where they already collaborate. It loads each time the screen gains focus.
 */
export const useSharedWithMe = (repository: SharingRepository = sharingRepository) => {
  const [state, setState] = useState<SharedState>({ loading: true, inbox: [], sharedPlaces: [], error: null });

  const load = useCallback(
    async (isActive: () => boolean = () => true) => {
      try {
        const [inbox, sharedPlaces] = await Promise.all([repository.listInbox(), repository.listSharedPlaces()]);
        if (isActive()) setState({ loading: false, inbox, sharedPlaces, error: null });
      } catch (error) {
        if (isActive()) setState((s) => ({ ...s, loading: false, error: toAppError(error) }));
      }
    },
    [repository],
  );

  useFocusEffect(
    useCallback(() => {
      let active = true;
      void load(() => active);
      return () => {
        active = false;
      };
    }, [load]),
  );

  /** Throws the AppError (expired, already answered…) so the screen can say why it did not work. */
  const accept = useCallback(
    async (invitationId: string) => {
      const shared = await repository.acceptInvitation(invitationId);
      setState((s) => ({
        ...s,
        inbox: s.inbox.filter((i) => i.id !== invitationId),
        sharedPlaces: [shared, ...s.sharedPlaces.filter((p) => p.memberId !== shared.memberId)],
      }));
      return shared;
    },
    [repository],
  );

  const reject = useCallback(
    async (invitationId: string) => {
      await repository.rejectInvitation(invitationId);
      setState((s) => ({ ...s, inbox: s.inbox.filter((i) => i.id !== invitationId) }));
    },
    [repository],
  );

  /** Drops an invitation the server says is gone (expired, cancelled by the owner). */
  const forget = useCallback((invitationId: string) => {
    setState((s) => ({ ...s, inbox: s.inbox.filter((i) => i.id !== invitationId) }));
  }, []);

  const leave = useCallback(
    async (placeId: string) => {
      await repository.leave(placeId);
      setState((s) => ({ ...s, sharedPlaces: s.sharedPlaces.filter((p) => p.place.id !== placeId) }));
    },
    [repository],
  );

  return { ...state, reload: () => load(), accept, reject, forget, leave };
};
