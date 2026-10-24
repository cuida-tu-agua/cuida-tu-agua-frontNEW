import { useEffect, useState } from 'react';
import { sharingRepository } from '../../core/di/container';
import { AppError } from '../../domain/common/AppError';
import { PlaceAccess } from '../../domain/sharing/Sharing';
import { SharingRepository } from '../../domain/sharing/SharingRepository';
import { toAppError } from '../../infrastructure/http/httpError';

interface AccessState {
  /** The place the answer is about, so an answer for another place is never taken as this one's. */
  placeId: string | null;
  access: PlaceAccess | null;
  error: AppError | null;
}

/**
 * HU-044..HU-046: what the signed-in person may do in a place. The screens hide what is not allowed, but the servers
 * decide anyway. While it loads (or if it fails) `access` is null and nothing sensitive is shown.
 */
export const usePlaceAccess = (placeId: string, repository: SharingRepository = sharingRepository) => {
  const [state, setState] = useState<AccessState>({ placeId: null, access: null, error: null });

  useEffect(() => {
    let active = true;
    repository
      .getAccess(placeId)
      .then((access) => active && setState({ placeId, access, error: null }))
      .catch((error: unknown) => active && setState({ placeId, access: null, error: toAppError(error) }));
    return () => {
      active = false;
    };
  }, [placeId, repository]);

  const loaded = state.placeId === placeId;
  return { loaded, access: loaded ? state.access : null, error: loaded ? state.error : null };
};
