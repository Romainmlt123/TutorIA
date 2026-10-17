import { useEffect, useMemo, useState } from 'react';
import { AccessibilityInfo } from 'react-native';
import { Easing, makeMutable, withTiming, type SharedValue } from 'react-native-reanimated';

import { CELEBRATION, planCelebration, type CelebrationPlan } from '../logic/celebration';
import { progressMessage, progressSince, type MapProgress } from '../logic/mapProgress';
import type { RegionMap } from '../logic/regionMap';

/** Une célébration : la carte qui l'a déclenchée, ce qui a changé, son déroulé et son horloge. */
export type MapCelebration = {
  map: RegionMap;
  progress: MapProgress;
  plan: CelebrationPlan;
  /** Secondes depuis son début, sur le fil de l'interface : de 0 à `plan.end`. */
  clock: SharedValue<number>;
};

/** Un élément de la célébration : son heure sur l'horloge. */
export type CelebrationMoment = { clock: SharedValue<number>; at: number };

type Options = {
  /** Carte de la région ouverte (X2b), null hors d'une région. */
  map: RegionMap | null;
  /** La carte se voit : onglet affiché (pas sous un niveau) et app au premier plan. */
  active: boolean;
  /** Faux avec « Réduire les animations » : tout est montré d'un coup, seule l'annonce reste. */
  animated: boolean;
};

/**
 * Célébration de la carte d'une région au retour d'un niveau. La carte vue par l'élève est retenue
 * par région, tant que l'onglet reste monté (la session de ce compte). Quand les résultats changent,
 * l'écart avec elle est célébré une fois (`progressSince`, `planCelebration`) :
 * - tant que la carte ne se voit pas (sous le niveau qui se termine), elle garde son ancien état :
 *   chaque élément de la célébration lit sa propre horloge, encore à zéro ;
 * - quand elle se voit, l'horloge court sur le fil de l'interface (aucun rendu React par image), le
 *   lecteur d'écran annonce le progrès, et l'avatar attend la fin des étoiles, de la ville, du chemin
 *   et de l'ouverture (`holding`) avant de marcher. `release` le laisse partir tout de suite (un
 *   niveau touché) : rien ne bloque l'élève.
 *
 * Avec « Réduire les animations », la carte montre son nouvel état d'emblée (`shown` est null) et
 * seule l'annonce reste.
 */
export function useMapCelebration({ map, active, animated }: Options) {
  const [seen, setSeen] = useState<ReadonlyMap<string, RegionMap>>(() => new Map());
  const [run, setRun] = useState<MapCelebration | null>(null);
  const [released, setReleased] = useState<MapCelebration | null>(null);
  const last = map ? seen.get(map.regionId) : undefined;
  // Progrès pas encore montré : son horloge, neuve, reste à zéro jusqu'à ce que la carte se voie.
  const pending = useMemo<MapCelebration | null>(() => {
    if (!map) return null;
    const progress = progressSince(last, map);
    if (!progress) return null;
    return { map, progress, plan: planCelebration(progress), clock: makeMutable(0) };
  }, [map, last]);
  // La carte se voit : elle devient la dernière vue, et son progrès est célébré (mise à jour pendant
  // le rendu, sans effet : l'avatar attend dès ce rendu-ci).
  if (active && map && last !== map) {
    setSeen(new Map(seen).set(map.regionId, map));
    if (pending) setRun(pending);
  }

  // L'horloge part (ou saute à la fin, si les animations sont réduites en cours de route).
  useEffect(() => {
    if (!run) return;
    const { clock, plan } = run;
    if (!animated) clock.set(plan.end);
    else clock.set(withTiming(plan.end, { duration: plan.end * 1000, easing: Easing.linear }));
  }, [run, animated]);

  // Le progrès est annoncé une fois l'écran posé : dit pendant le retour, il serait couvert par
  // l'annonce de l'écran.
  useEffect(() => {
    if (!run) return;
    const message = progressMessage(run.progress, run.map);
    if (!message) return;
    const timer = setTimeout(
      () => AccessibilityInfo.announceForAccessibility(message),
      CELEBRATION.start * 1000,
    );
    return () => clearTimeout(timer);
  }, [run]);

  // L'avatar repart à l'heure prévue.
  useEffect(() => {
    if (!run || !animated) return;
    const timer = setTimeout(() => setReleased(run), run.plan.walkAt * 1000);
    return () => clearTimeout(timer);
  }, [run, animated]);

  const current = run && map && run.map.regionId === map.regionId ? run : null;
  return {
    /** Célébration à montrer sur la carte (son ancien état tant qu'elle n'a pas commencé). */
    shown: animated ? (pending ?? current) : null,
    /** L'avatar attend avant de rejoindre son niveau. */
    holding: animated && (pending !== null || (current !== null && released !== current)),
    release: () => {
      if (current) setReleased(current);
    },
  };
}
