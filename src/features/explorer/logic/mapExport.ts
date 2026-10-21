import { createHash } from 'node:crypto';

import { explorerArt } from '@/theme/explorerArt';

import { ISLANDS, type Island, type LevelType } from '../content';
import { SUN_DIRECTION } from '../stylized3d/sun';
import { renderedRectOf } from './mapProjection';
import { buildRegionMap, type RegionMap } from './regionMap';
import { seedOf } from './regionSeed';
import {
  BAKED_DECOR,
  BLADE_RULE,
  clearingDressing,
  placedDecor,
  tuftBlades,
} from './terrainLayout';

/*
 * Disposition d'une carte de région pour son pré-rendu dans Blender (tools/explorer-3d/
 * region_tiles.py) : villes, niveaux, chemin, décors et touffes d'herbe tels que l'app les calcule
 * (comme RegionWorld), avec l'étalonnage et les couleurs du thème. Son empreinte `layoutHash` est
 * recopiée dans les tuiles rendues : des tuiles d'une autre disposition sont refusées
 * (mapExport.test.ts). Outil de développement, lancé par Jest (`npm run explorer:layout`) : jamais
 * importé par l'app (node:crypto).
 */

export type MapExport = {
  regionId: string;
  cities: { id: string; x: number; z: number; radius: number; monument: string }[];
  nodes: {
    x: number;
    z: number;
    radius: number;
    type: LevelType;
    cityId: string;
    levelId: string;
  }[];
  /** Échantillons du chemin lissé : [x, z, u]. */
  path: [number, number, number][];
  bounds: RegionMap['bounds'];
  /** Décors posés : [sorte, x, z, angle, échelle]. */
  decor: [string, number, number, number, number][];
  planks: typeof explorerArt.map.planks;
  /** Brins des touffes d'herbe des clairières : triangles (x, y, z) et leurs UV. */
  tufts: { position: number[]; uv: number[] };
  bladeRule: typeof BLADE_RULE;
  grade: typeof explorerArt.post.natural;
  gradeColors: typeof explorerArt.grade;
  grassBlades: typeof explorerArt.grassBlades;
  sun: typeof SUN_DIRECTION;
  water: typeof explorerArt.water3d;
  /** Rectangle du plan image à rendre, [xMin, xMax, vMin, vMax] en mètres (mapProjection). */
  renderedRect: [number, number, number, number];
  layoutHash: string;
};

/** Arrondi au cent-millième de mètre : la disposition ne dépend pas des derniers bits du calcul. */
const round = (value: number) => Math.round(value * 1e5) / 1e5;

/** Empreinte de la disposition : ce qui change le sol, le chemin ou les décors rendus. */
function layoutHashOf(parts: Pick<MapExport, 'cities' | 'nodes' | 'path' | 'decor' | 'tufts'>) {
  const { cities, nodes, path, decor, tufts } = parts;
  return createHash('sha256')
    .update(JSON.stringify([cities, nodes, path, decor, tufts]))
    .digest('hex')
    .slice(0, 16);
}

export function buildMapExport(regionId: string, islands: readonly Island[] = ISLANDS): MapExport {
  const island = islands.find((i) => i.regions.some((r) => r.id === regionId));
  const map = island ? buildRegionMap(island, regionId, new Map()) : null;
  if (!map) throw new Error(`Région inconnue : ${regionId}`);
  // Mêmes graines que la carte 3D d'une région cuite (RegionWorld) : mêmes décors, mêmes touffes.
  const seed = seedOf(regionId);
  const clearings = clearingDressing(map, seed + 3);
  const decor = [...placedDecor(map, BAKED_DECOR[regionId] ?? []), ...clearings.decor];
  const blades = tuftBlades(clearings.tufts, seed + 2);
  const parts = {
    cities: map.cities.map((c) => ({
      id: c.id,
      x: round(c.center.x),
      z: round(c.center.z),
      radius: round(c.radius),
      monument: c.monument,
    })),
    nodes: map.nodes.map((n) => ({
      x: round(n.x),
      z: round(n.z),
      radius: round(n.radius),
      type: n.type,
      cityId: n.cityId,
      levelId: n.levelId,
    })),
    path: map.path.map((p): [number, number, number] => [round(p.x), round(p.z), round(p.u)]),
    decor: decor.map((d): [string, number, number, number, number] => [
      d.kind,
      round(d.x),
      round(d.z),
      round(d.yaw),
      round(d.scale),
    ]),
    // Les brins sont des flottants 32 bits dans le maillage de la carte 3D (stripKit) : mêmes valeurs ici.
    tufts: {
      position: blades.position.map((v) => round(Math.fround(v))),
      uv: blades.uv.map((v) => round(Math.fround(v))),
    },
  };
  const [xMin, xMax, vMin, vMax] = renderedRectOf(map.nodes);
  // L'ordre des clés est celui du fichier lu par Blender.
  return {
    regionId,
    cities: parts.cities,
    nodes: parts.nodes,
    path: parts.path,
    bounds: map.bounds,
    decor: parts.decor,
    planks: explorerArt.map.planks,
    tufts: parts.tufts,
    bladeRule: BLADE_RULE,
    grade: explorerArt.post.natural,
    gradeColors: explorerArt.grade,
    grassBlades: explorerArt.grassBlades,
    sun: SUN_DIRECTION,
    water: explorerArt.water3d,
    renderedRect: [round(xMin), round(xMax), round(vMin), round(vMax)],
    layoutHash: layoutHashOf(parts),
  };
}
