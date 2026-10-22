import { useCallback } from 'react';
import { cancelAnimation, Easing, useSharedValue, withTiming } from 'react-native-reanimated';

import { CLOUD_PHASE_MS, DIVE_MS } from '../logic/cinematics';

export function useCinematicWind() {
  const progress = useSharedValue(0);
  const reset = useCallback(() => {
    cancelAnimation(progress);
    progress.set(0);
  }, [progress]);
  const start = useCallback(() => {
    progress.set(0);
    progress.set(withTiming(1, { duration: DIVE_MS + CLOUD_PHASE_MS, easing: Easing.linear }));
  }, [progress]);
  return { progress, reset, start };
}
