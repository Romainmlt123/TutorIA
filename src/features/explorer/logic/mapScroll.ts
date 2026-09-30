/*
 * Défilement de la carte d'une région (X2b) : la caméra glisse le long de la bande. Pendant le
 * glissement le doigt tire la carte ; au lâcher elle garde son élan puis ralentit, et elle ne dépasse
 * jamais les bouts de la bande. L'état est un objet modifié en place, lu à chaque image par la
 * caméra, sans rendu React (comme orbit.ts).
 */

export type MapScroll = {
  /** Position de la caméra le long de la bande (mètres). */
  x: number;
  /** Vitesse après le lâcher (mètres par seconde). */
  velocity: number;
  dragging: boolean;
  startX: number;
  /** Bornes de la caméra : la bande moins une demi-largeur d'écran de chaque côté, au besoin. */
  min: number;
  max: number;
  /** Position vers laquelle la carte glisse d'elle-même (boutons ville précédente et suivante). */
  goal: number | null;
};

const FRICTION = 3;
const STOP_SPEED = 0.02;

export function createScroll(): MapScroll {
  return { x: 0, velocity: 0, dragging: false, startX: 0, min: 0, max: 0, goal: null };
}

export function setBounds(scroll: MapScroll, min: number, max: number): void {
  scroll.min = min;
  scroll.max = Math.max(min, max);
  scroll.x = Math.min(scroll.max, Math.max(scroll.min, scroll.x));
}

export function jumpTo(scroll: MapScroll, x: number): void {
  scroll.x = Math.min(scroll.max, Math.max(scroll.min, x));
  scroll.velocity = 0;
  scroll.goal = null;
}

/** Fait glisser la carte jusqu'à `x` (bornée), en douceur. */
export function goTo(scroll: MapScroll, x: number): void {
  scroll.goal = Math.min(scroll.max, Math.max(scroll.min, x));
  scroll.velocity = 0;
}

export function beginScroll(scroll: MapScroll): void {
  scroll.dragging = true;
  scroll.velocity = 0;
  scroll.goal = null;
  scroll.startX = scroll.x;
}

/** Glisser vers la gauche avance dans la carte : le doigt tire le sol. `pxPerMeter` : échelle à l'écran. */
export function dragScroll(scroll: MapScroll, translationX: number, pxPerMeter: number): void {
  const wanted = scroll.startX - translationX / pxPerMeter;
  // Au-delà des bouts, le sol résiste : on suit le doigt à un tiers.
  if (wanted < scroll.min) scroll.x = scroll.min + (wanted - scroll.min) / 3;
  else if (wanted > scroll.max) scroll.x = scroll.max + (wanted - scroll.max) / 3;
  else scroll.x = wanted;
}

export function releaseScroll(
  scroll: MapScroll,
  velocityX: number,
  pxPerMeter: number,
  inertia: boolean,
): void {
  scroll.dragging = false;
  scroll.velocity = inertia ? -velocityX / pxPerMeter : 0;
}

/** Une image : élan amorti, et retour doux dans les bornes si le doigt les a dépassées. */
export function coastScroll(scroll: MapScroll, delta: number, animated = true): void {
  if (scroll.dragging) return;
  if (scroll.goal !== null) {
    scroll.x = animated
      ? scroll.x + (scroll.goal - scroll.x) * (1 - Math.exp(-delta * 6))
      : scroll.goal;
    if (Math.abs(scroll.goal - scroll.x) < 1e-3) {
      scroll.x = scroll.goal;
      scroll.goal = null;
    }
    return;
  }
  if (scroll.velocity !== 0) {
    scroll.x += scroll.velocity * delta;
    scroll.velocity *= Math.exp(-FRICTION * delta);
    if (Math.abs(scroll.velocity) < STOP_SPEED) scroll.velocity = 0;
  }
  const inside = Math.min(scroll.max, Math.max(scroll.min, scroll.x));
  if (inside === scroll.x) return;
  scroll.velocity = 0;
  scroll.x += (inside - scroll.x) * (1 - Math.exp(-delta * 10));
  if (Math.abs(inside - scroll.x) < 1e-3) scroll.x = inside;
}
