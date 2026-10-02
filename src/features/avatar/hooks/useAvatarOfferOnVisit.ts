import { useRouter } from 'expo-router';
import { useEffect } from 'react';

import { useAvatarLook } from './useAvatarLook';
import { useAvatarOffer } from './useAvatarOffer';

/**
 * Première visite d'Explorer sans avatar : l'éditeur s'ouvre une fois, avec « Plus tard ».
 * `visible` est vrai quand l'élève voit l'écran d'accueil d'Explorer (les îles).
 */
export function useAvatarOfferOnVisit(visible: boolean): void {
  const router = useRouter();
  const saved = useAvatarLook();
  const { pending, offered, markOffered } = useAvatarOffer();
  const due = visible && saved.isSuccess && saved.data === null && !pending && !offered;
  useEffect(() => {
    if (!due) return;
    markOffered();
    router.push({ pathname: '/avatar', params: { premiere: '1' } });
  }, [due, markOffered, router]);
}
