import type { IconName } from '@/components/Icon';
import type { Progress } from '@/features/avatar/logic/wardrobe';

/*
 * Trophées du profil (v2.8) : 24 trophées calculés à partir de la progression déjà enregistrée
 * (série record, niveau de joueur, Explorer, notions acquises). Ils ne se perdent jamais : chaque
 * chiffre qui les fait gagner ne peut que grandir.
 */

/** Couleur de la médaille : une teinte de la palette par famille de trophées. */
export type TrophyTone = 'orange' | 'blue' | 'green' | 'red' | 'violet' | 'cyan';

/** Ce qui fait gagner les trophées. */
export type TrophyFacts = Progress & {
  /** Niveau de joueur, tiré de l'XP. */
  playerLevel: number;
  /** Régions d'Explorer validées (toutes leurs villes). */
  regionsDone: ReadonlySet<string>;
  /** Chapitres acquis (maîtrise de 80 % ou plus). */
  notions: number;
};

type Condition =
  | {
      kind: 'streak' | 'playerLevel' | 'levels' | 'cities' | 'stars' | 'perfectCities' | 'notions';
      count: number;
    }
  | { kind: 'region'; regionId: string };

export type Trophy = { id: string; tone: TrophyTone; icon: IconName; condition: Condition };

/** Les 24 trophées, dans l'ordre où ils se montrent (validés par Romain le 08/10). */
export const TROPHIES: readonly Trophy[] = [
  { id: 'serie-3', tone: 'orange', icon: 'flamme', condition: { kind: 'streak', count: 3 } },
  { id: 'serie-7', tone: 'orange', icon: 'flamme', condition: { kind: 'streak', count: 7 } },
  { id: 'serie-14', tone: 'orange', icon: 'flamme', condition: { kind: 'streak', count: 14 } },
  { id: 'serie-30', tone: 'orange', icon: 'flamme', condition: { kind: 'streak', count: 30 } },
  { id: 'niveau-2', tone: 'blue', icon: 'fusee', condition: { kind: 'playerLevel', count: 2 } },
  { id: 'niveau-5', tone: 'blue', icon: 'fusee', condition: { kind: 'playerLevel', count: 5 } },
  { id: 'niveau-10', tone: 'blue', icon: 'fusee', condition: { kind: 'playerLevel', count: 10 } },
  { id: 'niveaux-1', tone: 'green', icon: 'boussole', condition: { kind: 'levels', count: 1 } },
  { id: 'niveaux-10', tone: 'green', icon: 'boussole', condition: { kind: 'levels', count: 10 } },
  { id: 'niveaux-25', tone: 'green', icon: 'boussole', condition: { kind: 'levels', count: 25 } },
  { id: 'evaluation-1', tone: 'red', icon: 'couronne', condition: { kind: 'cities', count: 1 } },
  { id: 'evaluations-5', tone: 'red', icon: 'couronne', condition: { kind: 'cities', count: 5 } },
  { id: 'etoiles-10', tone: 'violet', icon: 'etoile', condition: { kind: 'stars', count: 10 } },
  { id: 'etoiles-25', tone: 'violet', icon: 'etoile', condition: { kind: 'stars', count: 25 } },
  { id: 'etoiles-50', tone: 'violet', icon: 'etoile', condition: { kind: 'stars', count: 50 } },
  { id: 'etoiles-100', tone: 'violet', icon: 'etoile', condition: { kind: 'stars', count: 100 } },
  {
    id: 'region-nombres',
    tone: 'green',
    icon: 'carte',
    condition: { kind: 'region', regionId: 'maths-nombres' },
  },
  {
    id: 'region-donnees',
    tone: 'green',
    icon: 'carte',
    condition: { kind: 'region', regionId: 'maths-donnees' },
  },
  {
    id: 'region-espace',
    tone: 'green',
    icon: 'carte',
    condition: { kind: 'region', regionId: 'maths-espace' },
  },
  {
    id: 'region-algo',
    tone: 'green',
    icon: 'carte',
    condition: { kind: 'region', regionId: 'maths-algo' },
  },
  {
    id: 'ville-parfaite',
    tone: 'cyan',
    icon: 'couronne',
    condition: { kind: 'perfectCities', count: 1 },
  },
  { id: 'notions-1', tone: 'cyan', icon: 'coche', condition: { kind: 'notions', count: 1 } },
  { id: 'notions-5', tone: 'cyan', icon: 'coche', condition: { kind: 'notions', count: 5 } },
  { id: 'notions-10', tone: 'cyan', icon: 'coche', condition: { kind: 'notions', count: 10 } },
];

export function hasTrophy(trophy: Trophy, facts: TrophyFacts): boolean {
  const { condition } = trophy;
  if (condition.kind === 'region') return facts.regionsDone.has(condition.regionId);
  return facts[condition.kind] >= condition.count;
}

/**
 * L'étagère du profil : les trophées gagnés d'abord, puis le prochain à gagner (le premier de la
 * liste qui ne l'est pas encore), et le compte « n sur 24 ».
 */
export function trophyShelf(facts: TrophyFacts): {
  earned: Trophy[];
  next: Trophy | null;
  total: number;
} {
  const earned = TROPHIES.filter((t) => hasTrophy(t, facts));
  const next = TROPHIES.find((t) => !hasTrophy(t, facts)) ?? null;
  return { earned, next, total: TROPHIES.length };
}
