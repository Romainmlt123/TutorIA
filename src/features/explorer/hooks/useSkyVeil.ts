import { useCallback, useRef } from 'react';
import {
  Easing,
  cancelAnimation,
  interpolate,
  makeMutable,
  runOnJS,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';

import { playCue } from '@/lib/feedback';

import { CLOUD_PHASE_MS, READY_CAP_MS } from '../logic/cinematics';

export const CLOUD_PROGRESS = makeMutable(0);
export const DRIFT_PROGRESS = makeMutable(0);

type PassOptions = {
  waitReady?: boolean;
  coverMs?: number;
  openMs?: number;
  onOpened?: () => void;
};

/** Gère la couverture et l'ouverture des nuages au rythme des transitions. */
export function useSkyVeil(animated: boolean) {
  const style = useAnimatedStyle(() => ({
    opacity: interpolate(CLOUD_PROGRESS.value, [0, 0.55, 1, 1.45, 2], [0, 0, 1, 0, 0]),
  }));
  const held = useRef<(() => void) | null>(null);
  const passId = useRef(0);
  const pass = useCallback(
    (change: () => void, options: PassOptions = {}) => {
      const id = ++passId.current;
      const {
        waitReady = false,
        coverMs = CLOUD_PHASE_MS,
        openMs = CLOUD_PHASE_MS,
        onOpened,
      } = options;
      held.current = null;
      if (!animated) {
        CLOUD_PROGRESS.set(0);
        change();
        onOpened?.();
        return;
      }
      playCue('dive');
      CLOUD_PROGRESS.set(0);
      CLOUD_PROGRESS.set(
        withTiming(1, { duration: coverMs, easing: Easing.inOut(Easing.sin) }, (finished) => {
          if (finished) runOnJS(changeThenWait)();
        }),
      );
      function changeThenWait() {
        change();
        let timer: ReturnType<typeof setTimeout> | undefined;
        const open = () => {
          if (passId.current !== id || (waitReady && held.current !== open)) return;
          held.current = null;
          clearTimeout(timer);
          CLOUD_PROGRESS.set(
            withTiming(2, { duration: openMs, easing: Easing.inOut(Easing.sin) }, (finished) => {
              if (!finished) return;
              CLOUD_PROGRESS.set(0);
              if (onOpened) runOnJS(onOpened)();
            }),
          );
        };
        if (waitReady) {
          timer = setTimeout(open, READY_CAP_MS);
          held.current = open;
        } else {
          setTimeout(open, 0);
        }
      }
    },
    [animated],
  );
  const ready = useCallback(() => held.current?.(), []);
  const drift = useCallback(
    (duration: number) => {
      if (!animated) {
        DRIFT_PROGRESS.set(0);
        return;
      }
      DRIFT_PROGRESS.set(0);
      DRIFT_PROGRESS.set(
        withTiming(1, { duration, easing: Easing.linear }, () => DRIFT_PROGRESS.set(0)),
      );
    },
    [animated],
  );
  const finish = useCallback(() => {
    passId.current += 1;
    held.current = null;
    cancelAnimation(CLOUD_PROGRESS);
    cancelAnimation(DRIFT_PROGRESS);
    CLOUD_PROGRESS.set(0);
    DRIFT_PROGRESS.set(0);
  }, []);
  return { style, pass, ready, drift, finish };
}
