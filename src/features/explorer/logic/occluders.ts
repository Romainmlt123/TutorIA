import { FEET, MAP_SCALE } from '../stylized3d/avatarChoreo';
import { imageV } from './mapProjection';
import type { RegionMap } from './regionMap';

/*
 * Ordre de profondeur sur une carte pré-rendue (X2b) : le sol, les décors et les monuments sont
 * cuits dans un seul plan d'images, et la vue 3D de l'avatar est posée par-dessus. Un monument plus
 * proche de la caméra que l'avatar, dont l'image recouvre la sienne, devrait le cacher : la carte
 * n'a pas de découpe de premier plan pour cela, l'avatar passerait devant. `hiddenLevels` signale
 * les niveaux où cela arriverait, à déplacer dans la disposition avant la cuisson des tuiles.
 */

type Vec3 = readonly [number, number, number];

/** Boîte d'un monument autour du centre de sa ville (mètres). */
export type MonumentBox = { min: Vec3; max: Vec3 };

/**
 * La figurine debout sur un niveau, en mètres : demi-largeur, demi-profondeur et sommet (chapeau et
 * bras levés du salut compris, MapAvatar).
 */
const FIGURE = { halfWidth: 0.25, halfDepth: 0.15, top: FEET + 1.2 * MAP_SCALE } as const;
/**
 * Recouvrement négligé (mètres du plan image, environ 5 dp à l'écran) : deux coins de boîtes qui se
 * touchent (le bord haut d'un monument et le bout des pieds), pas un monument qui cache l'avatar.
 */
const TOLERANCE = 0.05;

export type HiddenLevel = {
  levelId: string;
  monument: string;
  /** Recouvrement des deux images (mètres du plan image). */
  width: number;
  height: number;
};

/** Longueur commune de deux intervalles (négative s'ils sont disjoints). */
const overlap = (a0: number, a1: number, b0: number, b1: number) =>
  Math.min(a1, b1) - Math.max(a0, b0);

/**
 * Niveaux où un monument (`boxes`, par nom) cacherait une partie de l'avatar debout : il est plus
 * près de la caméra que lui, et leurs images se recouvrent de plus de TOLERANCE dans chaque sens.
 * Une ville sans boîte (village générique, bas) est ignorée.
 */
export function hiddenLevels(
  map: Pick<RegionMap, 'nodes' | 'cities'>,
  boxes: Readonly<Record<string, MonumentBox>>,
): HiddenLevel[] {
  const hidden: HiddenLevel[] = [];
  for (const node of map.nodes) {
    for (const city of map.cities) {
      const box = boxes[city.monument];
      if (!box || city.center.z + box.max[2] <= node.z) continue;
      const width = overlap(
        node.x - FIGURE.halfWidth,
        node.x + FIGURE.halfWidth,
        city.center.x + box.min[0],
        city.center.x + box.max[0],
      );
      const height = overlap(
        imageV(node.z - FIGURE.halfDepth, FIGURE.top),
        imageV(node.z + FIGURE.halfDepth, 0),
        imageV(city.center.z + box.min[2], box.max[1]),
        imageV(city.center.z + box.max[2], box.min[1]),
      );
      if (width > TOLERANCE && height > TOLERANCE) {
        hidden.push({ levelId: node.levelId, monument: city.monument, width, height });
      }
    }
  }
  return hidden;
}
