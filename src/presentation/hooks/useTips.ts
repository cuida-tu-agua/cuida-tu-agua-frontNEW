import { useCallback, useRef, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { tipRepository } from '../../core/di/container';
import { AppError } from '../../domain/common/AppError';
import { Tip, TipsSession, withFavorite } from '../../domain/tips/Tip';
import { TipRepository } from '../../domain/tips/TipRepository';
import { toAppError } from '../../infrastructure/http/httpError';

export type TipsView = 'forYou' | 'favorites';

/**
 * HU-065: the tips of the session (at least 3 different ones) and the favorites of the user. The star changes at once and
 * goes back if the server refuses. A favorite removed from the "Favoritos" tab leaves the list right away.
 */
export const useTips = (placeId?: string, repository: TipRepository = tipRepository) => {
  const [view, setView] = useState<TipsView>('forYou');
  const [session, setSession] = useState<TipsSession | null>(null);
  const [favorites, setFavorites] = useState<Tip[] | null>(null);
  const [error, setError] = useState<AppError | null>(null);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const latest = useRef(0);

  const load = useCallback(async () => {
    const request = ++latest.current;
    setLoading(true);
    try {
      const [loadedSession, loadedFavorites] = await Promise.all([repository.session({ placeId }), repository.favorites()]);
      if (request !== latest.current) return;
      setSession(loadedSession);
      setFavorites(loadedFavorites);
      setError(null);
    } catch (e) {
      if (request === latest.current) setError(toAppError(e));
    } finally {
      if (request === latest.current) setLoading(false);
    }
  }, [placeId, repository]);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load]),
  );

  const toggleFavorite = async (tip: Tip) => {
    const next = !tip.isFavorite;
    const before = { session, favorites };
    setBusyId(tip.id);
    setError(null);
    // The star changes at once, in both lists
    setSession((s) => (s ? { ...s, tips: withFavorite(s.tips, tip.id, next) } : s));
    setFavorites((f) => (f ? (next ? [{ ...tip, isFavorite: true }, ...f.filter((t) => t.id !== tip.id)] : f.filter((t) => t.id !== tip.id)) : f));
    try {
      if (next) await repository.mark(tip.id);
      else await repository.unmark(tip.id);
    } catch (e) {
      setSession(before.session);
      setFavorites(before.favorites);
      setError(toAppError(e));
    } finally {
      setBusyId(null);
    }
  };

  return {
    view,
    setView,
    session,
    favorites,
    tips: view === 'forYou' ? (session?.tips ?? []) : (favorites ?? []),
    error,
    loading,
    busyId,
    reload: load,
    toggleFavorite,
    dismissError: () => setError(null),
  };
};
