/*
 * Déplacement sur la carte d'une région (X2b) : la caméra glisse au-dessus de l'île dans les deux
 * sens. Pendant le glissement le doigt tire le sol ; au lâcher la carte garde son élan puis ralentit,
 * et elle ne sort jamais du rectangle de l'île. L'état est un objet modifié en place, lu à chaque
 * image par la caméra, sans rendu React (comme orbit.ts).
 */

export type Bounds = { minX: number; maxX: number; minZ: number; maxZ: number };

export type MapScroll = {
  /** Point de la carte au centre de l'écran (mètres). */
  x: number;
  z: number;
  /** Vitesse après le lâcher (mètres par seconde). */
  vx: number;
  vz: number;
  dragging: boolean;
  startX: number;
  startZ: number;
  bounds: Bounds;
  /** Point vers lequel la carte glisse d'elle-même (boutons ville précédente et suivante). */
  goal: { x: number; z: number } | null;
};

const FRICTION = 3;
const STOP_SPEED = 0.02;

export function createScroll(): MapScroll {
  return {
    x: 0,
    z: 0,
    vx: 0,
    vz: 0,
    dragging: false,
    startX: 0,
    startZ: 0,
    bounds: { minX: 0, maxX: 0, minZ: 0, maxZ: 0 },
    goal: null,
  };
}

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));
const clampX = (s: MapScroll, x: number) => clamp(x, s.bounds.minX, s.bounds.maxX);
const clampZ = (s: MapScroll, z: number) => clamp(z, s.bounds.minZ, s.bounds.maxZ);

/** Rectangle de la caméra ; une borne inversée (île plus petite que l'écran) devient un point. */
export function setBounds(scroll: MapScroll, bounds: Bounds): void {
  scroll.bounds = {
    minX: bounds.minX,
    maxX: Math.max(bounds.minX, bounds.maxX),
    minZ: bounds.minZ,
    maxZ: Math.max(bounds.minZ, bounds.maxZ),
  };
  scroll.x = clampX(scroll, scroll.x);
  scroll.z = clampZ(scroll, scroll.z);
}

export function jumpTo(scroll: MapScroll, x: number, z: number): void {
  scroll.x = clampX(scroll, x);
  scroll.z = clampZ(scroll, z);
  scroll.vx = 0;
  scroll.vz = 0;
  scroll.goal = null;
}

/** Fait glisser la carte jusqu'au point `(x, z)` (borné), en douceur. */
export function goTo(scroll: MapScroll, x: number, z: number): void {
  scroll.goal = { x: clampX(scroll, x), z: clampZ(scroll, z) };
  scroll.vx = 0;
  scroll.vz = 0;
}

export function beginScroll(scroll: MapScroll): void {
  scroll.dragging = true;
  scroll.vx = 0;
  scroll.vz = 0;
  scroll.goal = null;
  scroll.startX = scroll.x;
  scroll.startZ = scroll.z;
}

/** Au-delà des bords, le sol résiste : on suit le doigt à un tiers. */
function rubber(wanted: number, min: number, max: number): number {
  if (wanted < min) return min + (wanted - min) / 3;
  if (wanted > max) return max + (wanted - max) / 3;
  return wanted;
}

/**
 * Le doigt tire le sol : glisser à gauche avance vers la droite de la carte, glisser vers le haut
 * avance vers la caméra. `pxPerMeterX` et `pxPerMeterZ` : échelle à l'écran selon chaque axe (la
 * vue plongeante raccourcit l'axe z).
 */
export function dragScroll(
  scroll: MapScroll,
  translationX: number,
  translationY: number,
  pxPerMeterX: number,
  pxPerMeterZ: number,
): void {
  const { bounds } = scroll;
  scroll.x = rubber(scroll.startX - translationX / pxPerMeterX, bounds.minX, bounds.maxX);
  scroll.z = rubber(scroll.startZ - translationY / pxPerMeterZ, bounds.minZ, bounds.maxZ);
}

export function releaseScroll(
  scroll: MapScroll,
  velocityX: number,
  velocityY: number,
  pxPerMeterX: number,
  pxPerMeterZ: number,
  inertia: boolean,
): void {
  scroll.dragging = false;
  scroll.vx = inertia ? -velocityX / pxPerMeterX : 0;
  scroll.vz = inertia ? -velocityY / pxPerMeterZ : 0;
}

/** Une image : élan amorti, et retour doux dans le rectangle si le doigt l'a dépassé. */
export function coastScroll(scroll: MapScroll, delta: number, animated = true): void {
  if (scroll.dragging) return;
  const { goal } = scroll;
  if (goal) {
    const k = 1 - Math.exp(-delta * 6);
    scroll.x = animated ? scroll.x + (goal.x - scroll.x) * k : goal.x;
    scroll.z = animated ? scroll.z + (goal.z - scroll.z) * k : goal.z;
    if (Math.abs(goal.x - scroll.x) < 1e-3 && Math.abs(goal.z - scroll.z) < 1e-3) {
      scroll.x = goal.x;
      scroll.z = goal.z;
      scroll.goal = null;
    }
    return;
  }
  if (scroll.vx !== 0 || scroll.vz !== 0) {
    scroll.x += scroll.vx * delta;
    scroll.z += scroll.vz * delta;
    const damping = Math.exp(-FRICTION * delta);
    scroll.vx *= damping;
    scroll.vz *= damping;
    if (Math.hypot(scroll.vx, scroll.vz) < STOP_SPEED) {
      scroll.vx = 0;
      scroll.vz = 0;
    }
  }
  const insideX = clampX(scroll, scroll.x);
  const insideZ = clampZ(scroll, scroll.z);
  if (insideX === scroll.x && insideZ === scroll.z) return;
  // Un bord touché arrête l'élan sur cet axe, puis la carte revient dedans.
  if (insideX !== scroll.x) scroll.vx = 0;
  if (insideZ !== scroll.z) scroll.vz = 0;
  const back = 1 - Math.exp(-delta * 10);
  scroll.x += (insideX - scroll.x) * back;
  scroll.z += (insideZ - scroll.z) * back;
  if (Math.abs(insideX - scroll.x) < 1e-3) scroll.x = insideX;
  if (Math.abs(insideZ - scroll.z) < 1e-3) scroll.z = insideZ;
}
