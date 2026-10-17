import { useCallback, useRef } from 'react';
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
/** Une scène qui annonce qu'elle est prête (carte pré-rendue) est attendue au plus ce temps (ms). */
const READY_CAP_MS = 800;

/**
 * Fondu au noir qui passe sur l'écran pour cacher un changement de scène (du plongeon vers la
 * carte d'une région, et retour) : il se referme, `change` est appelée une fois l'écran couvert,
 * puis il s'ouvre. Sans animation (« Réduire les animations »), le changement est immédiat.
 *
 * Avec `waitReady`, il ne s'ouvre qu'une fois la nouvelle scène prête (`ready`, appelée par la
 * carte pré-rendue quand ses tuiles à l'écran sont chargées), ou au bout de READY_CAP_MS.
 */
export function useSkyVeil(animated: boolean) {
  const opacity = useSharedValue(0);
  const style = useAnimatedStyle(() => ({ opacity: opacity.value }));
  // Ouverture qui attend `ready` : la dernière demandée, seule à pouvoir encore s'ouvrir.
  const held = useRef<(() => void) | null>(null);
  const pass = useCallback(
    (change: () => void, waitReady = false) => {
      if (!animated) {
        change();
        return;
      }
      const uncover = () => {
        opacity.set(withTiming(0, { duration: UNCOVER_MS }));
      };
      const changeThenUncover = () => {
        change();
        if (!waitReady) {
          // Une image pour que la nouvelle scène soit posée avant d'ouvrir le voile.
          setTimeout(uncover, 120);
          return;
        }
        const open = () => {
          if (held.current !== open) return;
          held.current = null;
          clearTimeout(timer);
          uncover();
        };
        const timer = setTimeout(open, READY_CAP_MS);
        held.current = open;
      };
      opacity.set(
        withTiming(1, { duration: COVER_MS }, (finished) => {
          if (finished) runOnJS(changeThenUncover)();
        }),
      );
    },
    [animated, opacity],
  );
  /** La nouvelle scène est prête : le voile qui l'attend s'ouvre (sans effet sinon). */
  const ready = useCallback(() => held.current?.(), []);
  return { style, pass, ready };
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
