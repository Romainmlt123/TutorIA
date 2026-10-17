import { imageV } from './mapProjection';

/*
 * Animations de la carte pré-rendue d'une région (X2b), sur le fil de l'interface : elles lisent une
 * horloge qui n'avance que 30 fois par seconde (`ambientTick`). Au repos, la carte n'est ainsi
 * redessinée que 30 fois par seconde, même sur un écran à 120 Hz ; seuls le doigt et la marche de
 * l'avatar vont au rythme de l'écran. Ce sont des worklets.
 */

/** Pas de l'horloge des animations : 30 par seconde. */
export const AMBIENT_RATE = 30;

/** Temps écoulé (secondes) arrondi au pas de l'horloge, vers le bas. */
export function ambientTick(elapsed: number): number {
  'worklet';
  return Math.floor(elapsed * AMBIENT_RATE) / AMBIENT_RATE;
}

/** Battement du halo du niveau à jouer, de 1 à 1,6 fois sa lumière : la formule de levelNodes.ts. */
export function haloBeat(t: number): number {
  'worklet';
  return 1 + 0.6 * (0.5 + 0.5 * Math.sin(3.2 * t));
}

/**
 * Opacité d'une seconde lueur posée sur la première : en mode « écran », deux lueurs s'ajoutent à
 * peu près comme la lumière additive de la carte 3D, donc la lumière en plus du battement (0 à 0,6).
 */
export function haloPulseOpacity(t: number): number {
  'worklet';
  return haloBeat(t) - 1;
}

/** Groupes de reflets de l'eau : chacun scintille à son rythme, et tous ses reflets ensemble. */
export const GLINT_GROUPS = 5;
/** Part du cycle d'un groupe où ses reflets brillent ; ils restent éteints le reste du temps. */
const GLINT_LIT = 0.35;
/** Chemin parcouru par un reflet pendant qu'il brille (mètres de la carte). */
export const GLINT_DRIFT = 0.06;
/**
 * Sens des vaguelettes principales de l'eau (premier train d'ondes de stylized3d/water.ts), sur le
 * plan image : vers la droite et vers la caméra, donc vers le bas de l'écran.
 */
const FLOW_LENGTH = Math.hypot(0.45, 0.9);
const FLOW_X = 0.45 / FLOW_LENGTH;
const FLOW_V = imageV(0.9 / FLOW_LENGTH, 0);

/** Éclat (0 à 1), taille relative et glissement (mètres du plan image) d'un groupe de reflets. */
export type GlintState = { opacity: number; scale: number; dx: number; dv: number };

/**
 * Reflets du soleil sur l'eau, groupe par groupe : chaque groupe a sa période (2,2 à 4 s) et son
 * décalage, pour que les reflets ne s'allument jamais tous ensemble. Pendant qu'il brille, un reflet
 * s'allume puis s'éteint en douceur, grossit au plus fort de son éclat et glisse dans le sens des
 * vaguelettes ; éteint, il ne change plus (aucune mise à jour à envoyer).
 */
export function glintAt(t: number, group: number): GlintState {
  'worklet';
  const period = 2.2 + 0.45 * group;
  const cycle = t / period + 0.29 * group;
  const u = cycle - Math.floor(cycle);
  if (u >= GLINT_LIT) return { opacity: 0, scale: 0.5, dx: 0, dv: 0 };
  const s = u / GLINT_LIT;
  const bump = Math.sin(Math.PI * s);
  const along = (s - 0.5) * GLINT_DRIFT;
  return {
    opacity: bump * bump * bump,
    scale: 0.5 + 0.7 * bump,
    dx: along * FLOW_X,
    dv: along * FLOW_V,
  };
}

/**
 * Décalage (mètres) d'un nuage parti de `x`, qui dérive vers la droite à `speed` m/s : sorti de
 * l'intervalle [min, max[ par la droite, il y revient par la gauche (formule des nuages en 3D,
 * stylized3d/Clouds.tsx).
 */
export function cloudShift(t: number, x: number, speed: number, min: number, max: number): number {
  'worklet';
  const span = max - min;
  const along = (x - min + t * speed) % span;
  return min + (along < 0 ? along + span : along) - x;
}
