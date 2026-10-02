import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect, useState } from 'react';

import { logError } from '@/lib/logger';
import { useStudentAccount } from '@/lib/session/SessionProvider';

const keyOf = (accountId: string) => `avatar.offered.v1.${accountId}`;

/**
 * L'éditeur d'avatar est proposé une seule fois, à la première visite d'Explorer : ce souvenir
 * est gardé sur l'appareil, par compte. `pending` est vrai tant qu'il n'a pas été lu.
 */
export function useAvatarOffer() {
  const accountId = useStudentAccount()?.id;
  const [state, setState] = useState<{ accountId: string; offered: boolean } | null>(null);

  useEffect(() => {
    if (!accountId) return;
    let cancelled = false;
    AsyncStorage.getItem(keyOf(accountId))
      .then((value) => {
        if (!cancelled) setState({ accountId, offered: value !== null });
      })
      .catch((error: unknown) => {
        logError('avatar.offer.read', error);
        // Sans souvenir lisible, on ne propose rien : mieux vaut oublier l'offre que la répéter.
        if (!cancelled) setState({ accountId, offered: true });
      });
    return () => {
      cancelled = true;
    };
  }, [accountId]);

  const markOffered = useCallback(() => {
    if (!accountId) return;
    setState({ accountId, offered: true });
    AsyncStorage.setItem(keyOf(accountId), '1').catch((error: unknown) =>
      logError('avatar.offer.write', error),
    );
  }, [accountId]);

  const current = state?.accountId === accountId ? state : null;
  return { pending: current === null, offered: current?.offered ?? false, markOffered };
}
