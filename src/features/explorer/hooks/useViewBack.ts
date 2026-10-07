import { useFocusEffect } from 'expo-router';
import { useCallback } from 'react';
import { BackHandler, Platform } from 'react-native';

/**
 * Retour d'une vue à celle d'au-dessus : bouton retour d'Android et touche Échap sur le web, tant
 * que l'onglet est affiché et qu'il y a une vue au-dessus. Sans cela, le retour quitterait l'onglet.
 */
export function useViewBack(canGoUp: boolean, goUp: () => void): void {
  useFocusEffect(
    useCallback(() => {
      if (!canGoUp) return;
      const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
        goUp();
        return true;
      });
      const onKey = (event: KeyboardEvent) => {
        if (event.key === 'Escape') goUp();
      };
      if (Platform.OS === 'web') window.addEventListener('keydown', onKey);
      return () => {
        subscription.remove();
        if (Platform.OS === 'web') window.removeEventListener('keydown', onKey);
      };
    }, [canGoUp, goUp]),
  );
}
