import { useFocusEffect } from 'expo-router';
import { useCallback, useState, useSyncExternalStore } from 'react';
import { AppState } from 'react-native';

function subscribeAppState(onChange: () => void) {
  const subscription = AppState.addEventListener('change', onChange);
  return () => subscription.remove();
}

const isAppActive = () => AppState.currentState === 'active';

/**
 * La scène 3D ne calcule d'images que si son onglet est affiché et l'app au premier plan : un
 * onglet caché reste monté, et sans cette pause il chaufferait le téléphone et viderait la batterie.
 */
export function useSceneActive(): boolean {
  const appActive = useSyncExternalStore(subscribeAppState, isAppActive, () => true);
  const [focused, setFocused] = useState(false);
  useFocusEffect(
    useCallback(() => {
      setFocused(true);
      return () => setFocused(false);
    }, []),
  );
  return focused && appActive;
}
