import { useCallback, useEffect } from 'react';
import {
  runOnJS,
  useFrameCallback,
  useSharedValue,
  type FrameInfo,
  type SharedValue,
} from 'react-native-reanimated';

import { mapPerfOf, publishMapPerf } from '@/lib/three/perfStats';

import { ambientTick } from '../logic/mapAmbient';

/** Relevé du compteur de performance : deux fois par seconde (développement seulement). */
const PROBE_EVERY_S = 0.5;

/** Relevé d'une fenêtre, calculé et publié hors du fil de l'interface. */
function publishWindow(ticks: number, deltas: number[]) {
  publishMapPerf(mapPerfOf(ticks, deltas));
}

/**
 * Horloge des animations d'une carte pré-rendue (secondes), sur le fil de l'interface : elle
 * n'avance que 30 fois par seconde (`ambientTick`), et seulement quand `running` (onglet affiché, app
 * au premier plan, animations non réduites). Sinon elle reste figée, et les animations avec elle.
 *
 * Avec `probe` (compteur de performance allumé), une sonde suit chaque image du fil de l'interface,
 * que l'horloge tourne ou non, et publie deux fois par seconde (`publishMapPerf`) le rythme de
 * l'horloge (0 quand elle est figée) et celui des images : leur p95, leur pire durée et celles en
 * retard. Sur Android, un rendu trop lourd (ombres floues, tuiles) retarde le fil de l'interface et
 * se voit ici ; sur iOS, le serveur de rendu est à part : il se mesure dans Instruments.
 */
export function useMapClock(running: boolean, probe = false): SharedValue<number> {
  // Temps écoulé carte animée, puis sa valeur au pas de l'horloge : seule la seconde réveille les styles.
  const elapsed = useSharedValue(0);
  const clock = useSharedValue(0);
  // Sonde : pas de l'horloge, durées des images (ms) et temps écoulé depuis le dernier relevé.
  const probeTicks = useSharedValue(0);
  const probeFrames = useSharedValue<number[]>([]);
  const probeSeconds = useSharedValue(0);
  const tick = useCallback(
    (frame: FrameInfo) => {
      'worklet';
      elapsed.set(elapsed.get() + (frame.timeSincePreviousFrame ?? 0) / 1000);
      const next = ambientTick(elapsed.get());
      if (next === clock.get()) return;
      clock.set(next);
      if (probe) probeTicks.set(probeTicks.get() + 1);
    },
    [elapsed, clock, probe, probeTicks],
  );
  const pace = useCallback(
    (frame: FrameInfo) => {
      'worklet';
      const ms = frame.timeSincePreviousFrame;
      if (ms === null) return;
      probeFrames.set([...probeFrames.get(), ms]);
      probeSeconds.set(probeSeconds.get() + ms / 1000);
      if (probeSeconds.get() < PROBE_EVERY_S) return;
      runOnJS(publishWindow)(probeTicks.get(), probeFrames.get());
      probeTicks.set(0);
      probeFrames.set([]);
      probeSeconds.set(0);
    },
    [probeTicks, probeFrames, probeSeconds],
  );
  const ticker = useFrameCallback(tick, false);
  const pacer = useFrameCallback(pace, false);
  useEffect(() => {
    ticker.setActive(running);
  }, [ticker, running]);
  useEffect(() => {
    if (!probe) return undefined;
    probeTicks.set(0);
    probeFrames.set([]);
    probeSeconds.set(0);
    pacer.setActive(true);
    // Plus de carte mesurée : le compteur n'affiche plus sa ligne.
    return () => {
      pacer.setActive(false);
      publishMapPerf(null);
    };
  }, [pacer, probe, probeTicks, probeFrames, probeSeconds]);
  return clock;
}
