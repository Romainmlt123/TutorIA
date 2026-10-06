import { demoLevelRecords } from '@/data/mock/explorer';
import { ISLANDS, islandOf } from '@/features/explorer/content';
import type { LevelRecord } from '@/features/explorer/logic/progression';
import { fr } from '@/i18n/fr';

import { BACKS, DEFAULT_LOOK, GLASSES, HATS, NECKWEAR, TOPS } from './avatarLook';
import {
  canWear,
  earnedNow,
  meets,
  NO_PROGRESS,
  ownedItems,
  progressOf,
  WARDROBE,
  wearable,
} from './wardrobe';

const maths = islandOf('maths')!;
const finished = (levelId: string, stars: 0 | 1 | 2 | 3 = 3, bestScore = 1): LevelRecord => ({
  levelId,
  finished: true,
  bestScore,
  stars,
  attempts: 1,
});

describe('garde-robe de l’avatar', () => {
  it('ne propose que des objets que la figurine sait porter, chacun avec son texte', () => {
    const slots = { top: TOPS, hat: HATS, glasses: GLASSES, neck: NECKWEAR, back: BACKS } as const;
    for (const item of WARDROBE) {
      const allowed: readonly string[] = slots[item.slot as keyof typeof slots];
      expect(allowed).toContain(item.id);
      expect(fr.avatar.items[item.id as keyof typeof fr.avatar.items]).toBeTruthy();
    }
    expect(new Set(WARDROBE.map((w) => w.id)).size).toBe(WARDROBE.length);
  });

  it('compte les niveaux, les étoiles, les bilans, les villes et les régions', () => {
    const progress = progressOf(ISLANDS, demoLevelRecords, 4);
    expect(progress).toEqual({ ...NO_PROGRESS, levels: 2, stars: 5, streak: 4 });
    const city = maths.regions[0]!.cities[0]!;
    const all = city.levels.map((level) => finished(level.id));
    const done = progressOf(ISLANDS, all, 0);
    expect(done.bilans).toBe(1);
    expect(done.cities).toBe(1);
    expect(done.levels).toBe(city.levels.length);
  });

  it('compte un bilan raté pour la casquette, mais pas pour la ville validée', () => {
    const city = maths.regions[0]!.cities[0]!;
    const levels = city.levels.map((level, i) =>
      i === city.levels.length - 1 ? finished(level.id, 1, 0.5) : finished(level.id),
    );
    const progress = progressOf(ISLANDS, levels, 0);
    expect(progress.bilans).toBe(1);
    expect(progress.cities).toBe(0);
    expect(earnedNow(progress)).toContain('casquette');
    expect(earnedNow(progress)).not.toContain('sac-a-dos');
  });

  it('valide une région quand toutes ses villes le sont', () => {
    const region = maths.regions[0]!;
    const all = region.cities.flatMap((c) => c.levels.map((level) => finished(level.id)));
    expect(progressOf(ISLANDS, all, 0).regions).toBe(1);
  });

  it('fait gagner chaque objet à son seuil', () => {
    expect(meets({ kind: 'stars', count: 10 }, { ...NO_PROGRESS, stars: 9 })).toBe(false);
    expect(meets({ kind: 'stars', count: 10 }, { ...NO_PROGRESS, stars: 10 })).toBe(true);
    expect(meets({ kind: 'streak', days: 7 }, { ...NO_PROGRESS, streak: 7 })).toBe(true);
    expect(earnedNow(NO_PROGRESS)).toEqual([]);
  });

  it('garde pour toujours un objet gagné, même si la condition n’est plus remplie', () => {
    const owned = ownedItems(['echarpe'], NO_PROGRESS);
    expect(owned.has('echarpe')).toBe(true);
    expect(ownedItems([], { ...NO_PROGRESS, stars: 30 }).has('sweat')).toBe(true);
  });

  it('laisse toujours porter les vêtements de base et « aucun », pas un objet non gagné', () => {
    const none = new Set<string>();
    expect(canWear('tshirt', none)).toBe(true);
    expect(canWear('aucun', none)).toBe(true);
    expect(canWear('casquette', none)).toBe(false);
    const look = {
      ...DEFAULT_LOOK,
      outfit: {
        ...DEFAULT_LOOK.outfit,
        top: { item: 'sweat' as const, color: 3 },
        hat: { item: 'casquette' as const, color: 2 },
      },
    };
    const fixed = wearable(look, new Set(['casquette']));
    expect(fixed.outfit.hat.item).toBe('casquette');
    expect(fixed.outfit.top).toEqual({ item: 'tshirt', color: 3 });
    expect(wearable(DEFAULT_LOOK, none)).toBe(DEFAULT_LOOK);
  });
});
