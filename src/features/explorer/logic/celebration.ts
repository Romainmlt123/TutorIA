import type { Cue } from '@/lib/feedback';

import type { CityChange, MapProgress } from './mapProgress';

/*
 * Déroulé de la célébration d'une carte pré-rendue au retour d'un niveau (fonctions pures) : à
 * quelle heure, depuis son début, chaque élément s'anime. Une seule horloge, sur le fil de
 * l'interface, fait ensuite tout jouer (useMapCelebration) ; avec « Réduire les animations », elle
 * saute à la fin et tout est montré d'un coup.
 */

/** Durées de la célébration (secondes). */
export const CELEBRATION = {
  /** Le temps que l'écran se pose au retour d'un niveau. */
  start: 0.45,
  /** Rangée d'étoiles grises d'un niveau terminé pour la première fois. */
  row: 0.25,
  /** Écart entre deux étoiles gagnées, et durée de l'apparition d'une étoile. */
  starStep: 0.32,
  starPop: 0.5,
  /** Bandeau d'une ville qui se retourne sur son nouvel état. */
  cityFlip: 0.55,
  /** Pluie de confettis d'une ville validée, et anneau d'encouragement d'une ville à consolider. */
  confetti: 1.9,
  cue: 1.1,
  /** Tronçons du chemin : écart entre deux, durée du dévoilement d'un tronçon, durée totale au plus. */
  segmentStep: 0.3,
  segmentReveal: 0.45,
  pathMax: 1.2,
  /** Niveau qui s'ouvre (cadenas qui s'envole, disque qui rebondit, halo), écart entre deux. */
  unlock: 0.7,
  unlockStep: 0.2,
} as const;

/** Ordre d'apparition des étoiles : de gauche à droite, celle du milieu, la plus haute, en dernier. */
const STAR_ORDER = [0, 2, 1] as const;

/** Rangs des étoiles nouvelles (de `from` à `to - 1`), dans leur ordre d'apparition. */
export function starSlots(from: number, to: number): number[] {
  return STAR_ORDER.filter((slot) => slot >= from && slot < to);
}

export type StarMoments = {
  levelId: string;
  /** Heure où la rangée apparaît (niveau terminé pour la première fois), sinon null : elle est déjà là. */
  row: number | null;
  pops: readonly { slot: number; at: number }[];
};

export type CityMoment = CityChange & { at: number };

export type CelebrationPlan = {
  stars: readonly StarMoments[];
  cities: readonly CityMoment[];
  gaps: readonly { gap: number; at: number }[];
  unlocks: readonly { levelId: string; at: number }[];
  /** L'avatar part vers son niveau à cette heure : après les étoiles, la ville, le chemin et l'ouverture. */
  walkAt: number;
  /** Tout est fini (confettis compris). */
  end: number;
};

/**
 * Déroulé d'une progression : les étoiles d'abord, niveau par niveau, puis les villes (bandeau qui se
 * retourne, confettis ou encouragement), le chemin qui avance tronçon par tronçon, les niveaux qui
 * s'ouvrent, et enfin la marche de l'avatar. Chaque étape attend la fin de la précédente, sauf les
 * confettis et l'anneau d'encouragement, qui continuent pendant la suite.
 */
export function planCelebration(progress: MapProgress): CelebrationPlan {
  const T = CELEBRATION;
  let t = T.start;
  let end = 0;
  const stars = progress.stars.map((gain): StarMoments => {
    const row = gain.firstTime ? t : null;
    if (row !== null) t += T.row;
    const pops = starSlots(gain.from, gain.to).map((slot, i) => ({ slot, at: t + i * T.starStep }));
    if (pops.length > 0) t = pops[pops.length - 1]!.at + T.starPop;
    return { levelId: gain.levelId, row, pops };
  });
  const cities = progress.cities.map((change): CityMoment => {
    const at = t;
    t += T.cityFlip;
    end = Math.max(end, at + (change.to === 'done' ? T.confetti : T.cue));
    return { ...change, at };
  });
  const step = Math.min(T.segmentStep, T.pathMax / Math.max(1, progress.gaps.length));
  const gaps = progress.gaps.map((gap, i) => ({ gap, at: t + i * step }));
  if (gaps.length > 0) t = gaps[gaps.length - 1]!.at + T.segmentReveal;
  const unlocks = progress.unlocked.map((levelId, i) => ({ levelId, at: t + i * T.unlockStep }));
  if (unlocks.length > 0) t = unlocks[unlocks.length - 1]!.at + T.unlock;
  return { stars, cities, gaps, unlocks, walkAt: t, end: Math.max(end, t) };
}

/** Choisit les cues associés au déroulé d'une célébration. */
export function celebrationCues(
  plan: CelebrationPlan,
  animated: boolean,
): { cue: Cue; at: number }[] {
  if (!animated) {
    if (plan.cities.some((city) => city.to === 'done')) return [{ cue: 'cityDone', at: 0 }];
    if (plan.stars.some((stars) => stars.pops.length >= 3)) return [{ cue: 'star3', at: 0 }];
    if (plan.unlocks.length > 0) return [{ cue: 'unlock', at: 0 }];
    if (plan.cities.length > 0) return [{ cue: 'cityCue', at: 0 }];
    return [];
  }
  const cues: { cue: Cue; at: number }[] = [];
  for (const stars of plan.stars) {
    stars.pops.forEach((pop, index) => {
      cues.push({ cue: `star${index + 1}` as Cue, at: pop.at });
    });
  }
  for (const city of plan.cities) {
    cues.push({ cue: city.to === 'done' ? 'cityDone' : 'cityCue', at: city.at });
  }
  for (const unlock of plan.unlocks) cues.push({ cue: 'unlock', at: unlock.at });
  return cues.sort((left, right) => left.at - right.at);
}
