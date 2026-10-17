import { useMemo } from 'react';
import { Easing, useSharedValue, withTiming, type SharedValue } from 'react-native-reanimated';

import { TOUCH_SECONDS } from '../logic/juice';

/** Niveau touché sur la carte (rang dans `map.nodes`, -1 : aucun) et avancée de sa réponse, de 0 à 1. */
export type DiscTouch = { index: SharedValue<number>; progress: SharedValue<number> };

/**
 * Réponse d'un disque de la carte pré-rendue au toucher, sur le fil de l'interface : un niveau ouvert
 * s'enfonce puis rebondit, un niveau fermé tremble à peine (`pressBounce`, `lockedShake`). Les
 * disques lisent ces deux valeurs ; aucun rendu React. Rien avec « Réduire les animations ».
 */
export function useDiscTouch(animated: boolean) {
  const index = useSharedValue(-1);
  const progress = useSharedValue(1);
  const values = useMemo<DiscTouch>(() => ({ index, progress }), [index, progress]);
  const press = (at: number) => {
    if (!animated || at < 0) return;
    index.set(at);
    progress.set(0);
    progress.set(withTiming(1, { duration: TOUCH_SECONDS * 1000, easing: Easing.linear }));
  };
  return { values, press };
}
