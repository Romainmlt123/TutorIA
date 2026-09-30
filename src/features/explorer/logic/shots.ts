import type { ExplorerView } from './explorerView';
import { FREE_RANGE } from './orbit';
import type { IslandFrame } from './stageFrame';

/*
 * Cadrage de la caméra par vue : élévation (degrés), largeur de l'île (fraction de la largeur de
 * l'écran), hauteur de la visée à l'écran et hauteur du point visé dans la scène (mètres).
 * La caméra glisse en douceur d'un cadrage à l'autre (IslandStage).
 */

export type Shot = {
  elevation: number;
  fill: number;
  aimY: number;
  /** Point visé dans la scène : hauteur, et décalage horizontal par rapport à l'île (mètres). */
  lookY: number;
  lookX: number;
  lookZ: number;
  /** Demi-plage de rotation au doigt autour de la vue de départ (radians) ; Infinity : libre. */
  azimuthRange: number;
};

/** Vue d'ensemble du plateau : plus haute, l'île entière et les panneaux de région visibles. */
export const REGIONS_SHOT: Shot = {
  elevation: 55,
  fill: 0.76,
  aimY: 0.44,
  lookY: 0,
  lookX: 0,
  lookZ: 0,
  azimuthRange: 0.61,
};

/** Part du chemin que la caméra parcourt vers la région choisie. */
const DRIFT = 0.3;

/** Carrousel : cadré dans la zone libre mesurée par l'écran (voir stageFrame). */
export function carouselShot(frame: IslandFrame): Shot {
  return {
    elevation: 24,
    fill: frame.fill,
    aimY: frame.aimY,
    lookY: -0.9,
    lookX: 0,
    lookZ: 0,
    azimuthRange: FREE_RANGE,
  };
}

/** Vue d'ensemble, avec la caméra qui dérive vers la région choisie (point du plateau, x et z). */
export function regionsShot(focus: readonly [number, number] | null): Shot {
  if (!focus) return REGIONS_SHOT;
  return { ...REGIONS_SHOT, lookX: focus[0] * DRIFT, lookZ: focus[1] * DRIFT };
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
      return REGIONS_SHOT;
  }
}

/** Avance un cadrage vers son but : glissement exponentiel, ou saut si les animations sont réduites. */
export function easeShot(current: Shot, target: Shot, delta: number, animated: boolean): Shot {
  if (!animated) return target;
  const k = 1 - Math.exp(-delta * 5);
  return {
    elevation: current.elevation + (target.elevation - current.elevation) * k,
    fill: current.fill + (target.fill - current.fill) * k,
    aimY: current.aimY + (target.aimY - current.aimY) * k,
    lookY: current.lookY + (target.lookY - current.lookY) * k,
    lookX: current.lookX + (target.lookX - current.lookX) * k,
    lookZ: current.lookZ + (target.lookZ - current.lookZ) * k,
    azimuthRange: target.azimuthRange,
  };
}
