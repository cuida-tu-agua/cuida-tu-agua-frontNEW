import { Place } from './Place';

/** Shown when the name of a place cannot be resolved (e.g. the places list did not load). */
export const UNKNOWN_PLACE_NAME = 'Lugar';

/**
 * id → name of each place. An alert only carries the placeId (AlertEvent in the docs), so
 * the notification center uses this map to show which place the alert is about.
 */
export const toPlaceNameMap = (places: Pick<Place, 'id' | 'name'>[]): Record<string, string> => {
  const names: Record<string, string> = {};
  places.forEach((p) => {
    names[p.id] = p.name;
  });
  return names;
};

export const placeNameOf = (names: Record<string, string>, placeId: string): string =>
  names[placeId] ?? UNKNOWN_PLACE_NAME;
