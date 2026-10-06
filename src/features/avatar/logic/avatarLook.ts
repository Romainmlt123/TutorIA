import { avatarArt } from '@/theme/avatarArt';

/*
 * Apparence de l'avatar d'un élève, façon Mii : peau, coiffure, visage (dessiné par l'app sur la
 * tête de la figurine), taille et tenue. Les couleurs sont des rangs dans les palettes de
 * `avatarArt`, les formes des noms stables : c'est ce qui est enregistré, il ne faut jamais en
 * renommer une. Aucune donnée personnelle : l'élève compose sa figurine à la main, sans photo.
 */

export const HAIR_STYLES = [
  'court',
  'epis',
  'carre',
  'long',
  'queue',
  'chignons',
  'boucles',
  'rase',
] as const;
export const EYE_STYLES = ['rond', 'grand', 'amande', 'rieur', 'endormi', 'petit'] as const;
export const BROW_STYLES = ['aucun', 'fin', 'epais', 'arque', 'decide'] as const;
export const MOUTH_STYLES = ['sourire', 'rire', 'petit', 'coin', 'dents', 'neutre'] as const;
export const NOSE_STYLES = ['aucun', 'point', 'arc', 'rond'] as const;
export const TOPS = ['tshirt', 'sweat'] as const;
export const BOTTOMS = ['short'] as const;
export const SHOES = ['baskets'] as const;
/** Accessoires de la garde-robe : « aucun » quand l'emplacement est vide. */
export const HATS = ['aucun', 'casquette', 'chapeau-explorateur'] as const;
export const GLASSES = ['aucun', 'lunettes-rondes'] as const;
export const NECKWEAR = ['aucun', 'echarpe'] as const;
export const BACKS = ['aucun', 'sac-a-dos'] as const;

export type HairStyle = (typeof HAIR_STYLES)[number];
export type EyeStyle = (typeof EYE_STYLES)[number];
export type BrowStyle = (typeof BROW_STYLES)[number];
export type MouthStyle = (typeof MOUTH_STYLES)[number];
export type NoseStyle = (typeof NOSE_STYLES)[number];

/** Un vêtement porté et sa couleur (rang dans `avatarArt.cloths`). */
export type Worn<Item extends string> = { item: Item; color: number };

export type AvatarLook = {
  skin: number;
  hair: { style: HairStyle; color: number };
  eyes: {
    style: EyeStyle;
    color: number;
    /** Écart et hauteur des yeux, de 0 à 1. */
    spacing: number;
    height: number;
  };
  brows: BrowStyle;
  mouth: MouthStyle;
  nose: NoseStyle;
  cheeks: boolean;
  freckles: boolean;
  /** Taille de la figurine, de 0 (petite) à 1 (grande). */
  size: number;
  /** Carrure, de 0 (fine) à 1 (large). */
  build: number;
  outfit: {
    top: Worn<(typeof TOPS)[number]>;
    bottom: Worn<(typeof BOTTOMS)[number]>;
    shoes: Worn<(typeof SHOES)[number]>;
    hat: Worn<(typeof HATS)[number]>;
    glasses: Worn<(typeof GLASSES)[number]>;
    neck: Worn<(typeof NECKWEAR)[number]>;
    back: Worn<(typeof BACKS)[number]>;
  };
};

export const DEFAULT_LOOK: AvatarLook = {
  skin: 2,
  hair: { style: 'court', color: 2 },
  eyes: { style: 'rond', color: 0, spacing: 0.5, height: 0.5 },
  brows: 'fin',
  mouth: 'sourire',
  nose: 'point',
  cheeks: true,
  freckles: false,
  size: 0.5,
  build: 0.5,
  outfit: {
    top: { item: 'tshirt', color: 0 },
    bottom: { item: 'short', color: 8 },
    shoes: { item: 'baskets', color: 0 },
    hat: { item: 'aucun', color: 12 },
    glasses: { item: 'aucun', color: 11 },
    neck: { item: 'aucun', color: 1 },
    back: { item: 'aucun', color: 7 },
  },
};

type Fields = Record<string, unknown>;

const isRecord = (value: unknown): value is Fields =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

function oneOf<T extends string>(choices: readonly T[], value: unknown, fallback: T): T {
  return typeof value === 'string' && (choices as readonly string[]).includes(value)
    ? (value as T)
    : fallback;
}

function rank(length: number, value: unknown, fallback: number): number {
  return Number.isInteger(value) && (value as number) >= 0 && (value as number) < length
    ? (value as number)
    : fallback;
}

function unit(value: unknown, fallback: number): number {
  return typeof value === 'number' && Number.isFinite(value)
    ? Math.min(1, Math.max(0, value))
    : fallback;
}

function flag(value: unknown, fallback: boolean): boolean {
  return typeof value === 'boolean' ? value : fallback;
}

function worn<Item extends string>(
  items: readonly Item[],
  value: unknown,
  fallback: Worn<Item>,
): Worn<Item> {
  const v = isRecord(value) ? value : {};
  return {
    item: oneOf(items, v.item, fallback.item),
    color: rank(avatarArt.cloths.length, v.color, fallback.color),
  };
}

/**
 * Apparence lue depuis un enregistrement (base, appareil) : chaque champ inconnu, absent ou hors
 * limites reprend sa valeur par défaut. Une apparence enregistrée par une version plus récente de
 * l'app (une coiffure qu'on ne connaît pas encore) s'affiche donc toujours.
 */
export function normalizeLook(raw: unknown): AvatarLook {
  const d = DEFAULT_LOOK;
  const r = isRecord(raw) ? raw : {};
  const hair = isRecord(r.hair) ? r.hair : {};
  const eyes = isRecord(r.eyes) ? r.eyes : {};
  const outfit = isRecord(r.outfit) ? r.outfit : {};
  return {
    skin: rank(avatarArt.skins.length, r.skin, d.skin),
    hair: {
      style: oneOf(HAIR_STYLES, hair.style, d.hair.style),
      color: rank(avatarArt.hairs.length, hair.color, d.hair.color),
    },
    eyes: {
      style: oneOf(EYE_STYLES, eyes.style, d.eyes.style),
      color: rank(avatarArt.eyes.length, eyes.color, d.eyes.color),
      spacing: unit(eyes.spacing, d.eyes.spacing),
      height: unit(eyes.height, d.eyes.height),
    },
    brows: oneOf(BROW_STYLES, r.brows, d.brows),
    mouth: oneOf(MOUTH_STYLES, r.mouth, d.mouth),
    nose: oneOf(NOSE_STYLES, r.nose, d.nose),
    cheeks: flag(r.cheeks, d.cheeks),
    freckles: flag(r.freckles, d.freckles),
    size: unit(r.size, d.size),
    build: unit(r.build, d.build),
    outfit: {
      top: worn(TOPS, outfit.top, d.outfit.top),
      bottom: worn(BOTTOMS, outfit.bottom, d.outfit.bottom),
      shoes: worn(SHOES, outfit.shoes, d.outfit.shoes),
      hat: worn(HATS, outfit.hat, d.outfit.hat),
      glasses: worn(GLASSES, outfit.glasses, d.outfit.glasses),
      neck: worn(NECKWEAR, outfit.neck, d.outfit.neck),
      back: worn(BACKS, outfit.back, d.outfit.back),
    },
  };
}

/** Générateur pseudo-aléatoire reproductible (mulberry32). */
function seeded(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Une apparence tirée au hasard, toujours la même pour une graine : idées de départ, essais. */
export function randomLook(seed: number): AvatarLook {
  const random = seeded(seed);
  const pick = <T>(list: readonly T[]): T => list[Math.floor(random() * list.length)]!;
  const index = (length: number) => Math.floor(random() * length);
  return {
    skin: index(avatarArt.skins.length),
    hair: { style: pick(HAIR_STYLES), color: index(avatarArt.hairs.length - 4) },
    eyes: {
      style: pick(EYE_STYLES),
      color: index(avatarArt.eyes.length),
      spacing: 0.3 + random() * 0.4,
      height: 0.3 + random() * 0.4,
    },
    brows: pick(BROW_STYLES.slice(1)),
    mouth: pick(MOUTH_STYLES),
    nose: pick(NOSE_STYLES),
    cheeks: random() < 0.6,
    freckles: random() < 0.25,
    size: random(),
    build: 0.2 + random() * 0.6,
    outfit: {
      top: { item: 'tshirt', color: index(8) },
      bottom: { item: 'short', color: 8 + index(2) },
      shoes: { item: 'baskets', color: index(avatarArt.cloths.length) },
      // Les accessoires se gagnent : un tirage au hasard n'en porte aucun.
      hat: DEFAULT_LOOK.outfit.hat,
      glasses: DEFAULT_LOOK.outfit.glasses,
      neck: DEFAULT_LOOK.outfit.neck,
      back: DEFAULT_LOOK.outfit.back,
    },
  };
}
