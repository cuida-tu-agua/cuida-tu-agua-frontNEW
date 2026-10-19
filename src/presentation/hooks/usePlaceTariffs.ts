import { useCallback, useEffect, useRef, useState } from 'react';
import { placeRepository, tariffRepository } from '../../core/di/container';
import { AppError } from '../../domain/common/AppError';
import { Place } from '../../domain/places/Place';
import { PlaceRepository } from '../../domain/places/PlaceRepository';
import { ManualTariffInput, PlaceTariffs, TariffCatalog } from '../../domain/tariffs/Tariff';
import { TariffRepository } from '../../domain/tariffs/TariffRepository';
import { toAppError } from '../../infrastructure/http/httpError';

/**
 * HU-054 / HU-066 / HU-069: the tariff of a place. Loads the place (for its city), the tariff in force with its history
 * and the preloaded tariffs of that city. Saving a tariff reloads the history, so what the screen shows is what the
 * server keeps.
 */
export const usePlaceTariffs = (
  placeId: string,
  repository: TariffRepository = tariffRepository,
  places: PlaceRepository = placeRepository,
) => {
  const [place, setPlace] = useState<Place | null>(null);
  const [tariffs, setTariffs] = useState<PlaceTariffs | null>(null);
  const [catalog, setCatalog] = useState<TariffCatalog | null>(null);
  const [error, setError] = useState<AppError | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const latest = useRef(0);

  const load = useCallback(async () => {
    const request = ++latest.current;
    setLoading(true);
    try {
      const loadedPlace = await places.getById(placeId);
      const [loadedTariffs, loadedCatalog] = await Promise.all([
        repository.get(placeId),
        // A city without catalog is not an error of this screen: the user can still type their tariff
        repository.catalog(loadedPlace.cityId).catch(() => null),
      ]);
      if (request !== latest.current) return;
      setPlace(loadedPlace);
      setTariffs(loadedTariffs);
      setCatalog(loadedCatalog);
      setError(null);
    } catch (e) {
      if (request === latest.current) setError(toAppError(e));
    } finally {
      if (request === latest.current) setLoading(false);
    }
  }, [placeId, repository, places]);

  useEffect(() => {
    void load();
  }, [load]);

  const run = async (action: () => Promise<unknown>, done: string): Promise<boolean> => {
    setSaving(true);
    setError(null);
    setNotice(null);
    try {
      await action();
      setTariffs(await repository.get(placeId));
      setNotice(done);
      return true;
    } catch (e) {
      setError(toAppError(e));
      return false;
    } finally {
      setSaving(false);
    }
  };

  return {
    place,
    tariffs,
    catalog,
    error,
    loading,
    saving,
    notice,
    reload: load,
    saveManual: (input: ManualTariffInput) => run(() => repository.setManual(placeId, input), 'Guardamos tu tarifa.'),
    chooseStratum: (stratum: number) =>
      run(() => repository.setCatalog(placeId, stratum), `Usaremos la tarifa de tu ciudad para el estrato ${stratum}.`),
    dismissNotice: () => setNotice(null),
    dismissError: () => setError(null),
  };
};
