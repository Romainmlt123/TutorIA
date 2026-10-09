import type { SubjectId } from '@/data/types';

import { maths4e2020 } from './maths-4e-2020';
import {
  anglais4e2020,
  francais4e2020,
  histoireGeo4e2020,
  physiqueChimie4e2020,
  svt4e2020,
} from './samples-4e-2020';
import type { City, Island, Level, Region } from './types';

export type { City, Island, Level, LevelType, Programme, Region } from './types';

/** Îles de la 4e, dans l'ordre du carrousel (maquette X1). */
export const ISLANDS: readonly Island[] = [
  maths4e2020,
  francais4e2020,
  histoireGeo4e2020,
  physiqueChimie4e2020,
  svt4e2020,
  anglais4e2020,
];

export function islandOf(subjectId: SubjectId): Island | undefined {
  return ISLANDS.find((island) => island.subjectId === subjectId);
}

/** Niveau replacé dans son île, sa région et sa ville, avec sa position sur le chemin. */
export type LevelPlace = {
  island: Island;
  region: Region;
  city: City;
  level: Level;
  /** Rang du niveau sur le chemin de l'île (0 = premier). */
  index: number;
};

/** Tous les niveaux d'une île, dans l'ordre du chemin. */
export function pathOf(island: Island): readonly LevelPlace[] {
  const places: LevelPlace[] = [];
  for (const region of island.regions) {
    for (const city of region.cities) {
      for (const level of city.levels) {
        places.push({ island, region, city, level, index: places.length });
      }
    }
  }
  return places;
}

const byId = new Map<string, LevelPlace>(
  ISLANDS.flatMap((island) => pathOf(island)).map((place) => [place.level.id, place]),
);

export function levelById(levelId: string): LevelPlace | undefined {
  return byId.get(levelId);
}

export function cityById(
  cityId: string,
): { island: Island; region: Region; city: City } | undefined {
  for (const island of ISLANDS) {
    for (const region of island.regions) {
      const city = region.cities.find((c) => c.id === cityId);
      if (city) return { island, region, city };
    }
  }
  return undefined;
}
