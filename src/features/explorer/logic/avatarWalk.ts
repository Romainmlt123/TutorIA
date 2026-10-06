import type { PathSample, Vec } from './mapLayout';

/*
 * Trajet de l'avatar sur la carte d'une région (X2b) : quand le pion avance, la figurine marche le
 * long du chemin pavé, d'un point de niveau à l'autre. Les points de niveau sont des échantillons
 * du chemin lissé (u entier = rang du niveau) : le trajet part et arrive exactement sur eux.
 */

export type Route = {
  points: readonly Vec[];
  /** Distance parcourue depuis le départ jusqu'à chaque point (mètres). */
  at: readonly number[];
  length: number;
};

/** Vitesse de marche (m/s), et durée maximale d'un trajet : un long trajet est parcouru plus vite. */
export const WALK_SPEED = 0.8;
export const MAX_WALK_SECONDS = 5;

/** Le chemin d'un niveau à un autre, dans le sens de la marche (en arrière si `to` est avant `from`). */
export function walkRoute(path: readonly PathSample[], from: number, to: number): Route {
  const [low, high] = from <= to ? [from, to] : [to, from];
  const points = path
    .filter((p) => p.u >= low - 1e-6 && p.u <= high + 1e-6)
    .map((p) => ({ x: p.x, z: p.z }));
  if (from > to) points.reverse();
  const at: number[] = [];
  let length = 0;
  points.forEach((p, i) => {
    const previous = points[i - 1];
    if (previous) length += Math.hypot(p.x - previous.x, p.z - previous.z);
    at.push(length);
  });
  return { points, at, length };
}

/** Durée de la marche : à vitesse normale, sans dépasser MAX_WALK_SECONDS. */
export function walkSeconds(route: Route): number {
  return Math.min(route.length / WALK_SPEED, MAX_WALK_SECONDS);
}

/**
 * Position à une distance donnée du départ, et cap de la marche : l'angle autour de la verticale
 * qui tourne vers la direction suivie une figurine regardant +z.
 */
export function pointAlong(route: Route, distance: number): Vec & { heading: number } {
  const { points, at } = route;
  const last = points.length - 1;
  if (last <= 0) return { ...(points[0] ?? { x: 0, z: 0 }), heading: 0 };
  const d = Math.min(Math.max(distance, 0), route.length);
  let i = 1;
  while (i < last && at[i]! < d) i++;
  const a = points[i - 1]!;
  const b = points[i]!;
  const span = at[i]! - at[i - 1]! || 1;
  const t = Math.min(Math.max((d - at[i - 1]!) / span, 0), 1);
  return {
    x: a.x + (b.x - a.x) * t,
    z: a.z + (b.z - a.z) * t,
    heading: Math.atan2(b.x - a.x, b.z - a.z),
  };
}

/** Le plus court chemin angulaire d'un cap à un autre (radians, entre -π et π). */
export function turnToward(from: number, to: number): number {
  return Math.atan2(Math.sin(to - from), Math.cos(to - from));
}
