import type { Island } from '@/features/explorer/content/types';
import {
  cityStatus,
  islandPath,
  regionSummary,
  type LevelRecord,
} from '@/features/explorer/logic/progression';

import type { AvatarLook } from './avatarLook';

/*
 * Garde-robe de l'avatar (étape A3) : chaque objet se gagne en progressant dans Explorer, rien ne
 * s'achète. Un objet gagné le reste pour toujours (l'app retient les objets gagnés, en plus de les
 * recalculer) ; un objet pas encore gagné s'affiche avec sa condition, jamais comme un échec.
 */

/** Emplacement d'un objet sur la figurine (champ de `look.outfit`). */
export type Slot = keyof AvatarLook['outfit'];

export type Condition =
  | { kind: 'levels'; count: number }
  | { kind: 'bilans'; count: number }
  | { kind: 'stars'; count: number }
  | { kind: 'cities'; count: number }
  | { kind: 'regions'; count: number }
  | { kind: 'streak'; days: number }
  | { kind: 'perfectCities'; count: number };

export type WardrobeItem = { id: string; slot: Slot; condition: Condition };

/** Les objets à gagner. Les vêtements de base (t-shirt, short, baskets) sont à tous dès le départ. */
export const WARDROBE: readonly WardrobeItem[] = [
  { id: 'casquette', slot: 'hat', condition: { kind: 'bilans', count: 1 } },
  { id: 'lunettes-rondes', slot: 'glasses', condition: { kind: 'stars', count: 10 } },
  { id: 'sac-a-dos', slot: 'back', condition: { kind: 'cities', count: 1 } },
  { id: 'echarpe', slot: 'neck', condition: { kind: 'streak', days: 7 } },
  { id: 'sweat', slot: 'top', condition: { kind: 'stars', count: 25 } },
  { id: 'chapeau-explorateur', slot: 'hat', condition: { kind: 'regions', count: 1 } },
  { id: 'bandana', slot: 'hat', condition: { kind: 'levels', count: 1 } },
  { id: 'bonnet', slot: 'hat', condition: { kind: 'stars', count: 5 } },
  { id: 'pantalon', slot: 'bottom', condition: { kind: 'cities', count: 2 } },
  { id: 'bottes', slot: 'shoes', condition: { kind: 'stars', count: 15 } },
  { id: 'jupe', slot: 'bottom', condition: { kind: 'cities', count: 3 } },
  { id: 'salopette', slot: 'bottom', condition: { kind: 'cities', count: 5 } },
  { id: 'cape', slot: 'back', condition: { kind: 'streak', days: 14 } },
  { id: 'lunettes-soleil', slot: 'glasses', condition: { kind: 'stars', count: 50 } },
  { id: 'couronne', slot: 'hat', condition: { kind: 'perfectCities', count: 1 } },
];

/** Ce qui compte pour gagner des objets. */
export type Progress = {
  /** Niveaux terminés. */
  levels: number;
  /** Bilans tentés (évaluations terminées, validées ou à consolider). */
  bilans: number;
  stars: number;
  /** Villes validées (70 % au bilan) et régions dont toutes les villes le sont. */
  cities: number;
  regions: number;
  /** Villes dont chaque niveau a ses trois étoiles. */
  perfectCities: number;
  /** Plus longue série de jours, depuis l'inscription. */
  streak: number;
};

export const NO_PROGRESS: Progress = {
  levels: 0,
  bilans: 0,
  stars: 0,
  cities: 0,
  regions: 0,
  perfectCities: 0,
  streak: 0,
};

/** La progression de l'élève sur toutes les îles, et sa meilleure série. */
export function progressOf(
  islands: readonly Island[],
  records: readonly LevelRecord[],
  bestStreak: number,
): Progress {
  const byLevel = new Map(records.map((r) => [r.levelId, r]));
  const progress = { ...NO_PROGRESS, streak: bestStreak };
  for (const island of islands) {
    const path = islandPath(island, byLevel);
    for (const place of path) {
      const record = byLevel.get(place.level.id);
      if (!record?.finished) continue;
      progress.levels++;
      progress.stars += record.stars;
      if (place.level.type === 'evaluation') progress.bilans++;
    }
    for (const region of island.regions) {
      progress.cities += region.cities.filter(
        (city) => cityStatus(city, path, byLevel) === 'done',
      ).length;
      progress.perfectCities += region.cities.filter((city) =>
        city.levels.every(
          (level) => byLevel.get(level.id)?.finished && byLevel.get(level.id)?.stars === 3,
        ),
      ).length;
      if (regionSummary(island, region.id, byLevel).status === 'done') progress.regions++;
    }
  }
  return progress;
}

export function meets(condition: Condition, progress: Progress): boolean {
  switch (condition.kind) {
    case 'streak':
      return progress.streak >= condition.days;
    default:
      return progress[condition.kind] >= condition.count;
  }
}

/** Objets dont la condition est remplie aujourd'hui. */
export function earnedNow(progress: Progress): string[] {
  return WARDROBE.filter((item) => meets(item.condition, progress)).map((item) => item.id);
}

/** Les objets de l'élève : ceux déjà gagnés (retenus) et ceux qu'il vient de gagner. */
export function ownedItems(kept: readonly string[], progress: Progress): ReadonlySet<string> {
  return new Set([...kept, ...earnedNow(progress)]);
}

/** Un objet se porte s'il est gagné ; « aucun » et les vêtements de base sont toujours permis. */
export function canWear(item: string, owned: ReadonlySet<string>): boolean {
  return !WARDROBE.some((w) => w.id === item) || owned.has(item);
}

/**
 * L'apparence telle qu'elle peut être portée : un objet qui n'est plus disponible (compte remis à
 * zéro, autre appareil) est retiré, et l'emplacement revient au vêtement de base ou à « aucun ».
 */
export function wearable(look: AvatarLook, owned: ReadonlySet<string>): AvatarLook {
  const fallback: Record<Slot, string> = {
    top: 'tshirt',
    bottom: 'short',
    shoes: 'baskets',
    hat: 'aucun',
    glasses: 'aucun',
    neck: 'aucun',
    back: 'aucun',
  };
  let changed = false;
  const outfit = { ...look.outfit };
  for (const slot of Object.keys(outfit) as Slot[]) {
    if (!canWear(outfit[slot].item, owned)) {
      changed = true;
      (outfit as Record<Slot, { item: string; color: number }>)[slot] = {
        ...outfit[slot],
        item: fallback[slot],
      };
    }
  }
  return changed ? { ...look, outfit } : look;
}
