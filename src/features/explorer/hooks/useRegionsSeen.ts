import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect, useState } from 'react';

import { logError } from '@/lib/logger';

const KEY = 'explorer.regionsSeen.v1';

/**
 * Régions déjà visitées, mémorisées sur l'appareil : la brume d'une région se lève à sa première
 * visite. Une région jouée n'a plus de brume non plus (voir regionSummary), donc un nouveau
 * téléphone retrouve l'essentiel sans rien stocker en base.
 */
export function useRegionsSeen() {
  const [seen, setSeen] = useState<ReadonlySet<string>>(new Set());

  useEffect(() => {
    let cancelled = false;
    AsyncStorage.getItem(KEY)
      .then((raw) => {
        if (cancelled || !raw) return;
        const ids: unknown = JSON.parse(raw);
        if (Array.isArray(ids)) setSeen(new Set(ids.filter((id) => typeof id === 'string')));
      })
      .catch((error: unknown) => logError('explorer.regionsSeen.read', error));
    return () => {
      cancelled = true;
    };
  }, []);

  const markSeen = useCallback((regionId: string) => {
    setSeen((previous) => {
      if (previous.has(regionId)) return previous;
      const next = new Set(previous).add(regionId);
      AsyncStorage.setItem(KEY, JSON.stringify([...next])).catch((error: unknown) =>
        logError('explorer.regionsSeen.write', error),
      );
      return next;
    });
  }, []);

  return { seen, markSeen };
}
