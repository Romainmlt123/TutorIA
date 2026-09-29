import { useEffect, useState } from 'react';

import { BAR_COUNT, BAR_REST, barHeights, type BarsMode } from '../logic/voice';

const TICK_MS = 100;
const REST = Array.from({ length: BAR_COUNT }, () => BAR_REST);

/** Hauteurs des 4 barres, recalculées 10 fois par seconde quand quelqu'un parle. */
export function useVoiceBars(mode: BarsMode): number[] {
  const [heights, setHeights] = useState<number[]>(REST);
  useEffect(() => {
    if (mode === 'rest') return;
    const start = Date.now();
    const timer = setInterval(
      () => setHeights(barHeights(mode, (Date.now() - start) / 1000)),
      TICK_MS,
    );
    return () => clearInterval(timer);
  }, [mode]);
  return mode === 'rest' ? REST : heights;
}
