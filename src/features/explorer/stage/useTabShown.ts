import { useIsFocused, useNavigation, useRoute } from 'expo-router';
import { useCallback, useSyncExternalStore } from 'react';

/** Ce qu'il faut de l'état d'un navigateur : ses écrans et celui qu'il montre. */
type NavigatorState = { index: number; routes: readonly { key: string }[] } | undefined;

/** L'écran `key` est celui que son navigateur montre : l'onglet choisi, ou le haut d'une pile. */
export function isShownRoute(state: NavigatorState, key: string): boolean {
  return state?.routes[state.index]?.key === key;
}

/**
 * Vrai tant que l'écran est l'onglet choisi de sa barre, même quand un écran de la pile de la
 * racine le couvre (niveau, avatar) : contrairement au focus, une poussée par-dessus ne le change
 * pas, seul le choix d'un autre onglet le fait.
 */
export function useTabShown(): boolean {
  const navigation = useNavigation();
  const { key } = useRoute();
  // Le focus vient d'un contexte : l'écran se redessine dans le rendu même où l'onglet change, et
  // y lit l'état à jour de sa barre. L'événement `state` n'arrive qu'après l'affichage : il ne sert
  // qu'au changement d'onglet fait sous un écran de la pile de la racine.
  const focused = useIsFocused();
  const subscribe = useCallback(
    (onChange: () => void) => navigation.addListener('state', onChange),
    [navigation],
  );
  const read = () => isShownRoute(navigation.getState(), key);
  return useSyncExternalStore(subscribe, read, read) || focused;
}
