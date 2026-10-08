import { useCallback, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { placeRepository } from '../../core/di/container';
import { PlaceRepository } from '../../domain/places/PlaceRepository';
import { toPlaceNameMap } from '../../domain/places/placeNames';

/**
 * id → name of the places of the user, to show where an alert happened.
 * If the list cannot be loaded it stays empty and the screens show a generic name instead
 * of failing: the alert is still useful without the name of its place.
 */
export const usePlaceNames = (repository: PlaceRepository = placeRepository): Record<string, string> => {
  const [names, setNames] = useState<Record<string, string>>({});

  useFocusEffect(
    useCallback(() => {
      let active = true;
      repository
        .list()
        .then((places) => {
          if (active) setNames(toPlaceNameMap(places));
        })
        .catch(() => undefined);
      return () => {
        active = false;
      };
    }, [repository]),
  );

  return names;
};
