import type { ExplorerView } from './explorerView';
import { FREE_RANGE } from './orbit';
import type { IslandFrame } from './stageFrame';

/*
 * Cadrage de la caméra par vue : élévation (degrés), largeur de l'île (fraction de la largeur de
 * l'écran), hauteur de la visée à l'écran et hauteur du point visé dans la scène (mètres).
 * La caméra glisse en douceur d'un cadrage à l'autre (IslandStage).
 */

export type Shot = {
  /** Champ de vision vertical (degrés) : large sur l'île, très étroit sur la carte d'une région. */
  fov: number;
  elevation: number;
  fill: number;
  aimY: number;
  /** Point visé dans la scène : hauteur, et décalage horizontal par rapport à l'île (mètres). */
  lookY: number;
  lookX: number;
  lookZ: number;
  /** Demi-plage de rotation au doigt autour de la vue de départ (radians) ; Infinity : libre. */
  azimuthRange: number;
  /** Azimut imposé (radians), ou null pour celui du doigt. La carte d'une région est toujours de face. */
  azimuth: number | null;
};

/** Vue d'ensemble du plateau : plus haute, l'île entière et les panneaux de région visibles. */
/** Champ de vision des vues de l'île. */
export const ISLAND_FOV = 26;

export const REGIONS_SHOT: Shot = {
  fov: ISLAND_FOV,
  elevation: 55,
  fill: 0.76,
  aimY: 0.44,
  lookY: 0,
  lookX: 0,
  lookZ: 0,
  azimuthRange: 0.61,
  azimuth: null,
};

/** Largeur de carte vue à l'écran sur la carte d'une région (mètres : une ville tient presque à l'écran). */
export const MAP_VISIBLE_WIDTH = 4;
/** Élévation de la caméra sur la carte d'une région. */
export const MAP_ELEVATION = 52;

/**
 * Carte d'une région : vue plongeante à 52°, avec un champ de vision très étroit (la caméra est
 * loin) : presque sans perspective, la carte se lit comme un plateau de jeu et les boutons posés
 * dessus suivent le sol à la lettre. La caméra glisse au-dessus de l'île sans jamais tourner.
 */
export const REGION_SHOT: Shot = {
  fov: 4,
  elevation: MAP_ELEVATION,
  fill: 7.4 / MAP_VISIBLE_WIDTH,
  aimY: 0.45,
  lookY: 0,
  lookX: 0,
  lookZ: 0,
  azimuthRange: 0,
  azimuth: 0,
};

/** Part du chemin que la caméra parcourt vers la région choisie. */
const DRIFT = 0.3;

/** Carrousel : cadré dans la zone libre mesurée par l'écran (voir stageFrame). */
export function carouselShot(frame: IslandFrame): Shot {
  return {
    fov: ISLAND_FOV,
    elevation: 24,
    fill: frame.fill,
    aimY: frame.aimY,
    lookY: -0.9,
    lookX: 0,
    lookZ: 0,
    azimuthRange: FREE_RANGE,
    azimuth: null,
  };
}

/** Vue d'ensemble, avec la caméra qui dérive vers la région choisie (point du plateau, x et z). */
export function regionsShot(focus: readonly [number, number] | null): Shot {
  if (!focus) return REGIONS_SHOT;
  return { ...REGIONS_SHOT, lookX: focus[0] * DRIFT, lookZ: focus[1] * DRIFT };
}

/**
 * Plongeon vers une région, quand l'élève la valide : la caméra descend et s'approche de son point
 * de visée, à peu près à la hauteur de la carte de la région. Le fondu au noir prend le relais.
 */
export function diveShot(focus: readonly [number, number]): Shot {
  return {
    ...REGIONS_SHOT,
    elevation: 40,
    fill: 2.3,
    aimY: 0.44,
    lookX: focus[0],
    lookZ: focus[1],
  };
}

export function shotFor(
  view: ExplorerView,
  frame: IslandFrame,
  focus: readonly [number, number] | null = null,
): Shot {
  switch (view.kind) {
    case 'carousel':
      return carouselShot(frame);
    case 'regions':
      return regionsShot(focus);
    case 'region':
      return REGION_SHOT;
  }
}

/** Avance un cadrage vers son but : glissement exponentiel, ou saut si les animations sont réduites. */
export function easeShot(current: Shot, target: Shot, delta: number, animated: boolean): Shot {
  if (!animated) return target;
  const k = 1 - Math.exp(-delta * 5);
  return {
    fov: current.fov + (target.fov - current.fov) * k,
    elevation: current.elevation + (target.elevation - current.elevation) * k,
    fill: current.fill + (target.fill - current.fill) * k,
    aimY: current.aimY + (target.aimY - current.aimY) * k,
    lookY: current.lookY + (target.lookY - current.lookY) * k,
    lookX: current.lookX + (target.lookX - current.lookX) * k,
    lookZ: current.lookZ + (target.lookZ - current.lookZ) * k,
    azimuthRange: target.azimuthRange,
    azimuth: target.azimuth,
  };
}
