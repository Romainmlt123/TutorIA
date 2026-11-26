import { seeded } from '../hd2d/pixels';
import { CELEBRATION } from './celebration';

/*
 * Courbes des animations de progression de la carte pré-rendue (étoiles, chemin, niveau qui
 * s'ouvre, bandeau des villes, confettis) et du toucher d'un niveau. Ce sont des worklets : chaque
 * style animé les appelle sur le fil de l'interface avec le temps écoulé depuis l'heure de son
 * élément (`s`, en secondes) ou l'avancée d'un toucher (`t`, de 0 à 1). Elles commencent et finissent
 * sur un état stable : avant leur heure, l'ancien état de la carte ; après, le nouveau.
 */

function clamp01(x: number): number {
  'worklet';
  return Math.min(1, Math.max(0, x));
}

function easeOut(x: number): number {
  'worklet';
  const u = 1 - x;
  return 1 - u * u * u;
}

/** De 0 à 1 en dépassant 1 avant de s'y poser, comme un ressort (pic de 1 + 4c³ / 27(c + 1)²). */
export function backOut(x: number, c: number): number {
  'worklet';
  const u = x - 1;
  return 1 + (c + 1) * u * u * u + c * u * u;
}

/** Échelle d'une étoile gagnée : absente avant son heure, elle jaillit jusqu'à 1,25 puis se pose. */
export function starPopScale(s: number): number {
  'worklet';
  if (s <= 0) return 0;
  return backOut(clamp01(s / CELEBRATION.starPop), 3);
}

/** Étincelles d'une étoile : un peu après elle, pendant moins d'une demi-seconde. */
const SPARKLE = { delay: 0.1, life: 0.45 };

/** Anneau d'étincelles autour d'une étoile qui apparaît : il s'élargit en s'éteignant, une seule fois. */
export function sparkleAt(s: number): { opacity: number; scale: number } {
  'worklet';
  const p = (s - SPARKLE.delay) / SPARKLE.life;
  if (p <= 0 || p >= 1) return { opacity: 0, scale: 0.4 };
  return { opacity: 1 - p * p, scale: 0.4 + 0.8 * easeOut(p) };
}

/** Rangée d'étoiles grises d'un niveau terminé pour la première fois : fondu et léger grossissement. */
export function rowAppear(s: number): { opacity: number; scale: number } {
  'worklet';
  const p = clamp01(s / CELEBRATION.row);
  return { opacity: p, scale: 0.6 + 0.4 * easeOut(p) };
}

/** Part dévoilée d'un tronçon du chemin, de 0 à 1 (départ et arrivée en douceur). */
export function segmentReveal(s: number): number {
  'worklet';
  const p = clamp01(s / CELEBRATION.segmentReveal);
  return p * p * (3 - 2 * p);
}

/** Hauteur dont le cadenas s'envole (dp). */
const LOCK_LIFT = 16;

export type UnlockState = {
  /**
   * Opacité du disque de couleur, posé sous le disque gris du verrou : absent avant l'ouverture
   * (leurs ombres de contact ne s'additionnent pas), il apparaît pendant que le gris s'efface.
   */
  color: number;
  /** Opacité du disque gris du verrou. */
  shell: number;
  /** Le cadenas monte (dp, vers le haut) et s'efface. */
  lockLift: number;
  lockOpacity: number;
  /** Échelle du disque : il rebondit. */
  disc: number;
  /** Échelle de l'icône du type de niveau, qui apparaît après le cadenas. */
  icon: number;
  /** Opacité du halo des niveaux ouverts. */
  halo: number;
};

/** Niveau qui s'ouvre : l'ancien état (fermé) avant son heure, le nouveau après `CELEBRATION.unlock`. */
export function unlockAt(s: number): UnlockState {
  'worklet';
  if (s <= 0) return { color: 0, shell: 1, lockLift: 0, lockOpacity: 1, disc: 1, icon: 0, halo: 0 };
  const bounce = clamp01(s / 0.5);
  const fade = 1 - bounce;
  return {
    color: clamp01(s / 0.08),
    shell: 1 - clamp01((s - 0.05) / 0.25),
    lockLift: -LOCK_LIFT * easeOut(clamp01(s / 0.4)),
    lockOpacity: 1 - clamp01((s - 0.1) / 0.3),
    disc: 1 + 0.16 * Math.sin(3 * Math.PI * bounce) * fade * fade,
    icon: s < 0.15 ? 0 : backOut(clamp01((s - 0.15) / 0.4), 3),
    halo: clamp01((s - 0.15) / 0.45),
  };
}

/** Échelle d'une face cachée du bandeau : presque nulle, jamais nulle (transformation inversible). */
export const FLIP_HIDDEN = 0.01;
/** Durée de la première moitié du retournement (s) : l'ancien état s'aplatit. */
const FLIP_HALF = 0.15;

/**
 * Bandeau d'une ville qui se retourne : l'ancien état (`front`, posé devant) s'aplatit, puis le
 * nouveau (`back`) se déplie en rebondissant. Échelles verticales de chaque face.
 */
export function bannerFlipAt(s: number): { front: number; back: number } {
  'worklet';
  if (s < 0) return { front: 1, back: 1 };
  if (s < FLIP_HALF) {
    const p = s / FLIP_HALF;
    return { front: Math.max(FLIP_HIDDEN, 1 - p * p), back: FLIP_HIDDEN };
  }
  const p = clamp01((s - FLIP_HALF) / (CELEBRATION.cityFlip - FLIP_HALF));
  return { front: FLIP_HIDDEN, back: Math.max(FLIP_HIDDEN, backOut(p, 2)) };
}

/**
 * Encouragement d'une ville à consolider : un anneau chaud et doux qui s'élargit autour du bandeau et
 * s'efface, une seule fois (jamais de clignotement).
 */
export function cueRingAt(s: number): { opacity: number; scale: number } {
  'worklet';
  const p = s / CELEBRATION.cue;
  if (p <= 0 || p >= 1) return { opacity: 0, scale: 1 };
  return { opacity: 0.6 * Math.min(1, p * 5) * (1 - p), scale: 1 + 0.35 * easeOut(p) };
}

/** Un confetti, tiré une fois pour toutes. */
export type ConfettiPiece = {
  /** Vitesses de départ (dp/s ; vers le haut quand `vy` est négatif). */
  vx: number;
  vy: number;
  /** Rotation (degrés/s), battement de sa face (radians/s) et départ de ce battement. */
  spin: number;
  flutter: number;
  phase: number;
  /** Départ (s) après celui de la pluie, taille (dp) et rang de sa couleur dans la palette. */
  delay: number;
  width: number;
  height: number;
  color: number;
};

/** Freinage de l'air (1/s) et vitesse de chute qu'il laisse (dp/s) : les confettis retombent en voletant. */
const DRAG = 3;
const FALL = 90;
/** Balancement de gauche à droite pendant la chute (dp). */
const SWAY = 6;

/** Les confettis d'une pluie, de `colors` couleurs : toujours les mêmes pour une même graine. */
export function confettiPieces(count: number, colors: number, seed: number): ConfettiPiece[] {
  const random = seeded(seed);
  return Array.from({ length: count }, (_, i) => ({
    vx: (random() - 0.5) * 2 * 260,
    vy: -(320 + random() * 260),
    spin: (random() - 0.5) * 2 * 540,
    flutter: 6 + random() * 8,
    phase: random() * 2 * Math.PI,
    delay: random() * 0.15,
    width: 5 + random() * 3,
    height: 8 + random() * 4,
    color: i % colors,
  }));
}

export type ConfettiState = { x: number; y: number; rotate: number; flip: number; opacity: number };

/**
 * Un confetti `s` secondes après le début de la pluie : il jaillit, freiné par l'air, puis retombe
 * lentement en se balançant, en tournant et en battant de sa face, et s'efface à la fin de la pluie.
 * Position (dp) depuis le centre du bandeau.
 */
export function confettiAt(s: number, piece: ConfettiPiece): ConfettiState {
  'worklet';
  const t = s - piece.delay;
  const life = CELEBRATION.confetti - piece.delay;
  if (t <= 0 || t >= life) return { x: 0, y: 0, rotate: 0, flip: 1, opacity: 0 };
  const slowed = (1 - Math.exp(-DRAG * t)) / DRAG;
  return {
    x: piece.vx * slowed + SWAY * Math.sin(piece.flutter * 0.5 * t + piece.phase),
    y: FALL * t + (piece.vy - FALL) * slowed,
    rotate: piece.spin * t,
    flip: 0.3 + 0.7 * Math.abs(Math.cos(piece.flutter * t + piece.phase)),
    opacity: Math.min(1, (life - t) / 0.45),
  };
}

/** Durée du rebond ou du tremblement d'un niveau touché (s). */
export const TOUCH_SECONDS = 0.32;
/** Part du rebond où le disque s'enfonce, avant de remonter. */
const DIP = 0.3;
/** Le disque touché s'est enfoncé (s) : l'avatar part alors vers son niveau. */
export const PRESS_DIP_SECONDS = TOUCH_SECONDS * DIP;

/** Niveau ouvert touché : il s'enfonce à 0,94, puis revient à sa taille en la dépassant à peine. */
export function pressBounce(t: number): number {
  'worklet';
  if (t <= 0 || t >= 1) return 1;
  if (t < DIP) return 1 - 0.06 * easeOut(t / DIP);
  return 0.94 + 0.06 * backOut((t - DIP) / (1 - DIP), 2.4);
}

/** Amplitude du tremblement d'un niveau fermé (dp). */
export const SHAKE_DP = 4;

/** Niveau fermé touché : un petit tremblement de côté (dp), qui s'amortit. */
export function lockedShake(t: number): number {
  'worklet';
  if (t <= 0 || t >= 1) return 0;
  return SHAKE_DP * Math.sin(6 * Math.PI * t) * (1 - t);
}
