import { avatarArt } from '@/theme/avatarArt';

import {
  BACKS,
  BOTTOMS,
  BROW_STYLES,
  EYE_STYLES,
  GLASSES,
  HAIR_STYLES,
  HATS,
  NECKWEAR,
  MOUTH_STYLES,
  normalizeLook,
  NOSE_STYLES,
  randomLook,
  SHOES,
  TOPS,
  type AvatarLook,
} from './avatarLook';
import type { Slot } from './wardrobe';

/*
 * L'éditeur « Crée ton avatar » : quatre onglets, chacun une liste de réglages. Chaque réglage lit
 * sa valeur dans l'apparence et rend une nouvelle apparence : l'écran n'a qu'à les afficher.
 */

export const EDITOR_TABS = ['visage', 'cheveux', 'corps', 'tenue'] as const;
export type EditorTab = (typeof EDITOR_TABS)[number];

/** Cadrage de l'aperçu : le visage de près, ou la figurine en pied. */
export type Framing = 'face' | 'body';
export const TAB_FRAMING: Record<EditorTab, Framing> = {
  visage: 'face',
  cheveux: 'face',
  corps: 'body',
  tenue: 'body',
};

export type ShapeControlId = 'eyes' | 'brows' | 'nose' | 'mouth' | 'hair';
export type ColorControlId = 'eyeColor' | 'hairColor' | 'skin';
export type SliderControlId = 'eyeSpacing' | 'eyeHeight' | 'size' | 'build';
export type ToggleControlId = 'cheeks' | 'freckles';

export type EditorControl =
  | {
      /** Un emplacement de la tenue : le vêtement ou l'accessoire porté (s'il est gagné) et sa couleur. */
      kind: 'wear';
      id: Slot;
      items: readonly string[];
      palette: readonly string[];
      value: (look: AvatarLook) => { item: string; color: number };
      setItem: (look: AvatarLook, item: string) => AvatarLook;
      setColor: (look: AvatarLook, rank: number) => AvatarLook;
    }
  | {
      kind: 'shape';
      id: ShapeControlId;
      options: readonly string[];
      value: (look: AvatarLook) => string;
      set: (look: AvatarLook, value: string) => AvatarLook;
    }
  | {
      kind: 'color';
      id: ColorControlId;
      palette: readonly string[];
      value: (look: AvatarLook) => number;
      set: (look: AvatarLook, value: number) => AvatarLook;
    }
  | {
      kind: 'slider';
      id: SliderControlId;
      value: (look: AvatarLook) => number;
      set: (look: AvatarLook, value: number) => AvatarLook;
    }
  | {
      kind: 'toggle';
      id: ToggleControlId;
      value: (look: AvatarLook) => boolean;
      set: (look: AvatarLook, value: boolean) => AvatarLook;
    };

/** Réglage de forme : une valeur inconnue laisse l'apparence telle quelle. */
function shape<T extends string>(
  id: ShapeControlId,
  options: readonly T[],
  value: (look: AvatarLook) => T,
  put: (look: AvatarLook, value: T) => AvatarLook,
): EditorControl {
  return {
    kind: 'shape',
    id,
    options,
    value,
    set: (look, wanted) => {
      const choice = options.find((option) => option === wanted);
      return choice === undefined ? look : put(look, choice);
    },
  };
}

/** Réglage de couleur : un rang hors de la palette laisse l'apparence telle quelle. */
function color(
  id: ColorControlId,
  palette: readonly string[],
  value: (look: AvatarLook) => number,
  put: (look: AvatarLook, value: number) => AvatarLook,
): EditorControl {
  return {
    kind: 'color',
    id,
    palette,
    value,
    set: (look, rank) =>
      Number.isInteger(rank) && rank >= 0 && rank < palette.length ? put(look, rank) : look,
  };
}

/** Nombre de crans d'un curseur : 11 positions, de 0 à 1. */
export const SLIDER_STEPS = 10;

/** Valeur ramenée au cran le plus proche, entre 0 et 1. */
export function snap(value: number): number {
  return Math.round(Math.min(1, Math.max(0, value)) * SLIDER_STEPS) / SLIDER_STEPS;
}

/** Un cran de plus (+1) ou de moins (-1). */
export function nudge(value: number, direction: 1 | -1): number {
  return snap(snap(value) + direction / SLIDER_STEPS);
}

function slider(
  id: SliderControlId,
  value: (look: AvatarLook) => number,
  put: (look: AvatarLook, value: number) => AvatarLook,
): EditorControl {
  return { kind: 'slider', id, value, set: (look, v) => put(look, snap(v)) };
}

/** Réglage d'un emplacement de la tenue : un objet inconnu ou un rang hors palette ne change rien. */
function wear(slot: Slot, items: readonly string[]): EditorControl {
  const palette = avatarArt.cloths;
  const put = (look: AvatarLook, worn: { item: string; color: number }) =>
    normalizeLook({ ...look, outfit: { ...look.outfit, [slot]: worn } });
  return {
    kind: 'wear',
    id: slot,
    items,
    palette,
    value: (look) => look.outfit[slot],
    setItem: (look, item) =>
      items.includes(item) ? put(look, { ...look.outfit[slot], item }) : look,
    setColor: (look, rank) =>
      Number.isInteger(rank) && rank >= 0 && rank < palette.length
        ? put(look, { ...look.outfit[slot], color: rank })
        : look,
  };
}

export const EDITOR_CONTROLS: Record<EditorTab, readonly EditorControl[]> = {
  visage: [
    shape(
      'eyes',
      EYE_STYLES,
      (l) => l.eyes.style,
      (l, style) => ({ ...l, eyes: { ...l.eyes, style } }),
    ),
    color(
      'eyeColor',
      avatarArt.eyes,
      (l) => l.eyes.color,
      (l, c) => ({ ...l, eyes: { ...l.eyes, color: c } }),
    ),
    slider(
      'eyeSpacing',
      (l) => l.eyes.spacing,
      (l, spacing) => ({ ...l, eyes: { ...l.eyes, spacing } }),
    ),
    slider(
      'eyeHeight',
      (l) => l.eyes.height,
      (l, height) => ({ ...l, eyes: { ...l.eyes, height } }),
    ),
    shape(
      'brows',
      BROW_STYLES,
      (l) => l.brows,
      (l, brows) => ({ ...l, brows }),
    ),
    shape(
      'nose',
      NOSE_STYLES,
      (l) => l.nose,
      (l, nose) => ({ ...l, nose }),
    ),
    shape(
      'mouth',
      MOUTH_STYLES,
      (l) => l.mouth,
      (l, mouth) => ({ ...l, mouth }),
    ),
    {
      kind: 'toggle',
      id: 'cheeks',
      value: (l) => l.cheeks,
      set: (l, cheeks) => ({ ...l, cheeks }),
    },
    {
      kind: 'toggle',
      id: 'freckles',
      value: (l) => l.freckles,
      set: (l, freckles) => ({ ...l, freckles }),
    },
  ],
  cheveux: [
    shape(
      'hair',
      HAIR_STYLES,
      (l) => l.hair.style,
      (l, style) => ({ ...l, hair: { ...l.hair, style } }),
    ),
    color(
      'hairColor',
      avatarArt.hairs,
      (l) => l.hair.color,
      (l, c) => ({ ...l, hair: { ...l.hair, color: c } }),
    ),
  ],
  corps: [
    color(
      'skin',
      avatarArt.skins,
      (l) => l.skin,
      (l, skin) => ({ ...l, skin }),
    ),
    slider(
      'size',
      (l) => l.size,
      (l, size) => ({ ...l, size }),
    ),
    slider(
      'build',
      (l) => l.build,
      (l, build) => ({ ...l, build }),
    ),
  ],
  // Un seul modèle par vêtement pour l'instant : la garde-robe (étape A3) ajoutera leurs formes.
  // Les objets de la garde-robe se gagnent (logic/wardrobe.ts) : l'écran grise ceux qui ne le sont pas.
  tenue: [
    wear('top', TOPS),
    wear('bottom', BOTTOMS),
    wear('shoes', SHOES),
    wear('hat', HATS),
    wear('glasses', GLASSES),
    wear('neck', NECKWEAR),
    wear('back', BACKS),
  ],
};

/** Deux apparences identiques, quel que soit l'ordre de leurs champs. */
export function sameLook(a: AvatarLook, b: AvatarLook): boolean {
  return JSON.stringify(normalizeLook(a)) === JSON.stringify(normalizeLook(b));
}

/** Empreinte stable d'un identifiant (FNV-1a sur 32 bits). */
function hashOf(text: string): number {
  let hash = 0x811c9dc5;
  for (let i = 0; i < text.length; i++) {
    hash ^= text.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return hash >>> 0;
}

/**
 * Figurine de départ d'un élève qui n'a pas encore créé son avatar : tirée au hasard, mais toujours
 * la même pour un compte (l'éditeur et la carte montrent la même), et souriante : c'est la
 * première impression, les yeux endormis et la bouche calme restent à choisir.
 */
export function starterLook(accountId: string): AvatarLook {
  const look = randomLook(hashOf(accountId));
  return {
    ...look,
    eyes: { ...look.eyes, style: look.eyes.style === 'endormi' ? 'rond' : look.eyes.style },
    mouth: look.mouth === 'neutre' ? 'sourire' : look.mouth,
  };
}
