import { useCallback } from 'react';
import { StyleSheet } from 'react-native';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { explorerArt } from '@/theme/explorerArt';

const COVER_MS = 500;
const UNCOVER_MS = 380;

/**
 * Fondu au noir qui passe sur l'écran pour cacher un changement de scène (du plongeon vers la
 * carte d'une région, et retour) : il se referme, `change` est appelée une fois l'écran couvert,
 * puis il s'ouvre. Sans animation (« Réduire les animations »), le changement est immédiat.
 */
export function useSkyVeil(animated: boolean) {
  const opacity = useSharedValue(0);
  const style = useAnimatedStyle(() => ({ opacity: opacity.value }));
  const pass = useCallback(
    (change: () => void) => {
      if (!animated) {
        change();
        return;
      }
      const uncover = () => {
        opacity.set(withTiming(0, { duration: UNCOVER_MS }));
      };
      const changeThenUncover = () => {
        change();
        // Une image pour que la nouvelle scène soit posée avant d'ouvrir le voile.
        setTimeout(uncover, 120);
      };
      opacity.set(
        withTiming(1, { duration: COVER_MS }, (finished) => {
          if (finished) runOnJS(changeThenUncover)();
        }),
      );
    },
    [animated, opacity],
  );
  return { style, pass };
}

/** Le voile lui-même : un aplat noir, sans réaction au toucher. */
export function SkyVeil({ style }: { style: ReturnType<typeof useSkyVeil>['style'] }) {
  return <Animated.View pointerEvents="none" style={[styles.veil, style]} />;
}

const styles = StyleSheet.create({
  veil: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: explorerArt.hud.blackVeil,
  },
});
