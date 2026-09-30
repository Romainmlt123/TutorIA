import type { SubjectId } from '@/data/types';

import type { Island, LevelType } from '../content';
import { islandSummary, type LevelRecord } from './progression';

/** Îles déjà construites en 3D ; les autres s'affichent « Bientôt » dans le carrousel (X1). */
export const ISLANDS_IN_3D: ReadonlySet<SubjectId> = new Set<SubjectId>(['maths']);

/** Une île du carrousel X1, prête à afficher. */
export type IslandSlide = {
  subjectId: SubjectId;
  available: boolean;
  citiesDone: number;
  citiesTotal: number;
  stars: number;
  /** Part des villes validées, de 0 à 1. */
  progress: number;
  /** Prochain niveau à jouer ; null quand toute l'île est terminée. */
  next: { type: LevelType; title: string } | null;
  /** Au moins un niveau terminé : « Prochaine étape » plutôt que « Commence par ». */
  started: boolean;
};

export function islandSlides(
  islands: readonly Island[],
  records: readonly LevelRecord[],
): IslandSlide[] {
  const byLevel = new Map(records.map((record) => [record.levelId, record]));
  return islands.map((island) => {
    const summary = islandSummary(island, byLevel);
    return {
      subjectId: island.subjectId,
      available: ISLANDS_IN_3D.has(island.subjectId),
      citiesDone: summary.citiesDone,
      citiesTotal: summary.citiesTotal,
      stars: summary.stars,
      progress: summary.citiesTotal > 0 ? summary.citiesDone / summary.citiesTotal : 0,
      next: summary.next
        ? { type: summary.next.level.type, title: summary.next.level.title }
        : null,
      started: summary.started,
    };
  });
}

/** Île suivante ou précédente du carrousel, en boucle. */
export function stepIndex(index: number, step: number, count: number): number {
  return (((index + step) % count) + count) % count;
}
