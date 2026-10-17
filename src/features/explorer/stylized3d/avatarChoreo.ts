import type { AvatarAnimation } from '@/features/avatar/avatar3d/Avatar3D';

import {
  MAX_WALK_SECONDS,
  nearestNode,
  pointAlong,
  QUICK_WALK_SECONDS,
  turnToward,
  walkRoute,
  walkSeconds,
  type Route,
} from '../logic/avatarWalk';
import type { RegionMap } from '../logic/regionMap';

/*
 * Chorégraphie de l'avatar de l'élève sur la carte d'une région, partagée par la carte 3D
 * (MapAvatar) et la carte pré-rendue (useAvatarWalk et MapAvatarCanvas) : il salue quand on entre
 * dans la région et attend sur son niveau (celui à jouer, ou celui que l'élève a touché). Quand ce
 * niveau change, il marche le long du chemin jusqu'à lui puis saute en arrivant. Avec « Réduire les
 * animations », il est posé, immobile, sur son niveau. Fonctions pures sur un état modifiable, sans
 * three.js : chaque image les appelle avec l'heure (secondes) et la durée de l'image.
 */

/**
 * Taille de la figurine sur la carte (1 m à l'échelle 1) : vue de haut, plus petite, elle ne
 * montrerait que ses cheveux. Elle reste moins haute que les monuments (environ 1,2 m).
 */
export const MAP_SCALE = 0.9;
/** Hauteur des pieds : sur les points de niveau, au-dessus du chemin pavé. */
export const FEET = 0.1;
/** Durées des animations jouées une fois (tools/avatar-3d/avatar.py) : salut et saut. */
export const WAVE_SECONDS = 1.6;
export const JUMP_SECONDS = 1.2;
/** La marche est jouée plus vite que nature : la figurine avance vite sur la carte. */
export const WALK_PLAYBACK = 1.7;

/**
 * Dernier niveau où l'avatar s'est arrêté, par région, le temps de la session : au retour sur la
 * carte (après un niveau joué, ou quand la scène est recréée), il marche depuis là. Il n'est noté
 * qu'à l'arrivée : une marche interrompue (scène recréée) reprend du départ.
 */
export const SEEN_LEVEL = new Map<string, string>();

type Phase = 'wave' | 'walk' | 'jump' | 'idle';

export type Choreo = {
  regionId: string | null;
  levelId: string | null;
  /** Niveau atteint, à annoncer (la fiche du niveau touché s'ouvre alors). */
  arrived: string | null;
  phase: Phase;
  /** Heure (s) du début de la phase. */
  since: number;
  route: Route | null;
  duration: number;
  /** Position au sol (mètres) et cap de la figurine (radians, 0 : face à l'élève). */
  x: number;
  z: number;
  yaw: number;
};

const ANIMATION: Record<Phase, AvatarAnimation> = {
  wave: 'salut',
  walk: 'marche',
  jump: 'saut',
  idle: 'attente',
};

export function createChoreo(): Choreo {
  return {
    regionId: null,
    levelId: null,
    arrived: null,
    phase: 'idle',
    since: 0,
    route: null,
    duration: 0,
    x: 0,
    z: 0,
    yaw: 0,
  };
}

/**
 * Le niveau de l'avatar devient celui de rang `to` (ou la carte vient de s'ouvrir) : marche depuis
 * son niveau, salut, ou simple arrêt.
 */
export function planChoreo(
  c: Choreo,
  map: RegionMap,
  to: number,
  now: number,
  animated: boolean,
  quick: boolean,
): void {
  const target = map.nodes[to]!;
  const opening = c.levelId === null;
  // En pleine marche, il repart du point de niveau le plus proche de là où il est.
  const from =
    c.phase === 'walk'
      ? nearestNode(map.nodes, { x: c.x, z: c.z })
      : map.nodes.findIndex((n) => n.levelId === (c.levelId ?? SEEN_LEVEL.get(map.regionId)));
  c.regionId = map.regionId;
  c.levelId = target.levelId;
  c.since = now;
  if (animated && from >= 0 && from !== to) {
    c.route = walkRoute(map.path, from, to);
    c.duration = walkSeconds(c.route, quick ? QUICK_WALK_SECONDS : MAX_WALK_SECONDS);
    c.phase = 'walk';
    const start = pointAlong(c.route, 0);
    c.x = start.x;
    c.z = start.z;
    return;
  }
  SEEN_LEVEL.set(map.regionId, target.levelId);
  c.arrived = target.levelId;
  c.route = null;
  c.x = target.x;
  c.z = target.z;
  c.phase = animated && opening ? 'wave' : 'idle';
}

/**
 * Une image (heure `now`, durée `delta`, en secondes) : la chorégraphie avance (marche, saut,
 * salut), la position et le cap suivent. Rend l'animation à jouer.
 */
export function advanceChoreo(
  c: Choreo,
  now: number,
  delta: number,
  animated: boolean,
): AvatarAnimation {
  const elapsed = now - c.since;
  let heading = 0;
  if (c.phase === 'walk' && c.route) {
    const progress = c.duration > 0 ? Math.min(elapsed / c.duration, 1) : 1;
    const at = pointAlong(c.route, progress * c.route.length);
    c.x = at.x;
    c.z = at.z;
    heading = at.heading;
    if (progress >= 1) {
      c.phase = 'jump';
      c.since = now;
      if (c.regionId && c.levelId) SEEN_LEVEL.set(c.regionId, c.levelId);
      c.arrived = c.levelId;
    }
  } else if (c.phase === 'jump' && elapsed >= JUMP_SECONDS) {
    c.phase = 'idle';
  } else if (c.phase === 'wave' && elapsed >= WAVE_SECONDS) {
    c.phase = 'idle';
  }
  // En marchant, la figurine regarde où elle va ; arrêtée, elle se tourne vers l'élève (+z).
  const k = animated ? 1 - Math.exp(-delta * (c.phase === 'walk' ? 12 : 5)) : 1;
  c.yaw += turnToward(c.yaw, heading) * k;
  return ANIMATION[c.phase];
}

/** Une image de la carte 3D : prévoit la marche si le niveau `to` a changé, puis avance. */
export function tick(
  c: Choreo,
  map: RegionMap,
  to: number,
  quick: boolean,
  now: number,
  delta: number,
  animated: boolean,
): AvatarAnimation {
  if (c.levelId !== map.nodes[to]?.levelId) planChoreo(c, map, to, now, animated, quick);
  return advanceChoreo(c, now, delta, animated);
}

/** Niveau atteint depuis la dernière image, une seule fois. */
export function takeArrival(c: Choreo): string | null {
  const arrived = c.arrived;
  c.arrived = null;
  return arrived;
}
