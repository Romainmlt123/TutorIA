/*
 * Rotation de l'île au doigt (X1) : la caméra tourne autour de l'île (la lumière cuite reste juste).
 * Pendant le glissement, l'angle suit le doigt ; au lâcher, l'île garde son élan puis ralentit.
 * L'état est un objet modifié en place, lu à chaque image par la caméra, sans rendu React.
 */

export type Orbit = {
  /** Angle de la caméra autour de l'île (radians, 0 = de face). */
  azimuth: number;
  /** Vitesse de rotation après le lâcher (radians par seconde). */
  velocity: number;
  dragging: boolean;
  /** Angle au début du glissement. */
  startAzimuth: number;
};

/** Vue de départ : légèrement de trois quarts, comme dans l'atelier. */
export const DEFAULT_AZIMUTH = -0.2;
/** Demi-plage de rotation libre : l'île tourne sans limite. */
export const FREE_RANGE = Infinity;
/** Un glissement de 160 px fait tourner l'île d'un radian (environ 57°). */
export const RADIANS_PER_PIXEL = 1 / 160;
/** Freinage de l'élan : il perd environ 92 % de sa vitesse par seconde. */
const FRICTION = 2.5;
const STOP_SPEED = 0.01;

export function createOrbit(): Orbit {
  return { azimuth: DEFAULT_AZIMUTH, velocity: 0, dragging: false, startAzimuth: DEFAULT_AZIMUTH };
}

export function beginDrag(orbit: Orbit): void {
  orbit.dragging = true;
  orbit.velocity = 0;
  orbit.startAzimuth = orbit.azimuth;
}

function clamp(azimuth: number, range: number): number {
  return Math.min(DEFAULT_AZIMUTH + range, Math.max(DEFAULT_AZIMUTH - range, azimuth));
}

/**
 * Glisser vers la droite fait tourner l'île vers la droite, dans la plage `range` autour de la vue
 * de départ (aucune limite par défaut).
 */
export function drag(orbit: Orbit, translationX: number, range = FREE_RANGE): void {
  orbit.azimuth = clamp(orbit.startAzimuth - translationX * RADIANS_PER_PIXEL, range);
}

/** Au lâcher, l'élan vient de la vitesse du doigt (px/s) ; aucun élan si les animations sont réduites. */
export function release(orbit: Orbit, velocityX: number, inertia: boolean): void {
  orbit.dragging = false;
  orbit.velocity = inertia ? -velocityX * RADIANS_PER_PIXEL : 0;
}

/**
 * Une image : l'île continue sur son élan, qui s'amortit jusqu'à l'arrêt. Dans une plage limitée,
 * elle s'arrête contre la butée, et revient doucement dedans si elle en était sortie (en quittant
 * le carrousel, par exemple).
 */
export function coast(orbit: Orbit, delta: number, range = FREE_RANGE): void {
  if (orbit.dragging) return;
  if (orbit.velocity !== 0) {
    orbit.azimuth += orbit.velocity * delta;
    orbit.velocity *= Math.exp(-FRICTION * delta);
    if (Math.abs(orbit.velocity) < STOP_SPEED) orbit.velocity = 0;
  }
  const inside = clamp(orbit.azimuth, range);
  if (inside === orbit.azimuth) return;
  orbit.velocity = 0;
  orbit.azimuth += (inside - orbit.azimuth) * (1 - Math.exp(-delta * 6));
  if (Math.abs(inside - orbit.azimuth) < 1e-3) orbit.azimuth = inside;
}
