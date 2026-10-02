import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { Platform } from 'react-native';

/**
 * Clé de la scène 3D d'un écran, qui change à chaque retour sur cet écran, sur Android seulement.
 *
 * Android retire de la fenêtre l'écran caché (onglet inactif, écran empilé par-dessus) : sa vue 3D
 * (TextureView) perd sa surface et expo-gl détruit son contexte. Au retour, la scène gardée en
 * mémoire dessinerait quelques images dans ce contexte mort (« WeakMap key must be an Object »)
 * avant de passer au nouveau. En changeant de clé, la scène est recréée d'un coup dans le nouveau
 * contexte : c'est le même travail qu'Android impose déjà, sans les images ratées. Sur iOS et le
 * web, le contexte survit : la scène est gardée telle quelle.
 */
export function useSceneKey(): number {
  const [key, setKey] = useState(0);
  const [blurred, setBlurred] = useState(false);
  useFocusEffect(
    useCallback(() => {
      if (blurred && Platform.OS === 'android') setKey((k) => k + 1);
      return () => setBlurred(true);
    }, [blurred]),
  );
  return key;
}
