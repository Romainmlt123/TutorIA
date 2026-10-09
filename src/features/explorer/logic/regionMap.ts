import type { Island, LevelType } from '../content';
import sites from '../stylized3d/regionSites.json';
import {
  layoutCities,
  nodeRadius,
  pathAnchors,
  smoothPath,
  type CitySite,
  type PathSample,
  type Vec,
} from './mapLayout';
import {
  currentLevel,
  islandPath,
  isCityOpen,
  missingRequirements,
  type CityStatus,
  type LevelState,
  type PlacedLevel,
  type Records,
  type Stars,
} from './progression';

/*
 * Carte d'une région (X2b) : le chemin de ses niveaux en mètres de la scène, ses villes et leur
 * état, et la position du pion. Tout est calculé ici, une seule fois, à partir du contenu et des
 * résultats : la scène 3D, l'interface projetée et la vue en liste lisent cette même carte.
 * Repère : x vers la droite, z vers la caméra, en mètres, vue de haut (voir mapLayout.ts).
 */

export type MapNode = {
  levelId: string;
  cityId: string;
  type: LevelType;
  title: string;
  state: LevelState;
  stars: Stars;
  x: number;
  z: number;
  /** Rayon du point (0,26 m, 0,34 m pour une évaluation). */
  radius: number;
};

export type MapCity = {
  id: string;
  name: string;
  /** Monument de la ville (modèle 3D de la région, ou village générique s'il manque). */
  monument: string;
  status: CityStatus;
  /** Ville ouverte : ses prérequis sont levés, ou elle a déjà été jouée. */
  open: boolean;
  /** Noms des villes à terminer d'abord, quand elle est fermée. */
  missing: readonly string[];
  recall: string | undefined;
  /** Centre de la ville, où se dresse son monument, et rayon de sa clairière (mètres). */
  center: Vec;
  radius: number;
  levelsDone: number;
  levelsTotal: number;
  stars: number;
};

export type RegionMap = {
  regionId: string;
  nodes: readonly MapNode[];
  cities: readonly MapCity[];
  /** Chemin lissé qui passe par tous les points ; `u` repère sa place entre les niveaux. */
  path: readonly PathSample[];
  /** Rectangle des points de niveau et des clairières, en mètres. */
  bounds: { minX: number; maxX: number; minZ: number; maxZ: number };
  /** Rang du niveau du pion (le niveau à jouer), ou du dernier niveau si tout est fait. */
  pawnIndex: number;
};

/** Forme du fichier regionSites.json, écrit par tools/explorer-3d/region_map.py (points [x, z] en mètres). */
type SitesFile = Record<string, { cities: Record<string, { center: number[]; via: number[][] }> }>;

const siteOf = (site: { center: number[]; via: number[][] }): CitySite => ({
  center: { x: site.center[0]!, z: site.center[1]! },
  via: site.via.map(([x, z]) => ({ x: x!, z: z! })),
});

export function buildRegionMap(
  island: Island,
  regionId: string,
  records: Records,
): RegionMap | null {
  const region = island.regions.find((r) => r.id === regionId);
  if (!region) return null;
  const places: PlacedLevel[] = islandPath(island, records).filter((p) => p.region.id === regionId);
  // Les villes de la région dans l'ordre du chemin, chacune avec ses niveaux.
  const order = region.cities.filter((c) => places.some((p) => p.city.id === c.id));
  // Emplacements choisis pour la région (regionSites.json) ; sans eux, les villes se rangent en serpentin.
  const chosen = (sites as SitesFile)[regionId]?.cities;
  const placed =
    chosen && order.every((c) => chosen[c.id])
      ? order.map((c) => siteOf(chosen[c.id]!))
      : undefined;
  const layouts = layoutCities(
    order.map((c) => places.filter((p) => p.city.id === c.id).map((p) => p.level.type)),
    placed,
  );
  const cityLayout = new Map(order.map((c, i) => [c.id, layouts[i]!]));
  const taken = new Map<string, number>();
  const nodes: MapNode[] = places.map((place) => {
    const k = taken.get(place.city.id) ?? 0;
    taken.set(place.city.id, k + 1);
    const at = cityLayout.get(place.city.id)!.nodes[k]!;
    return {
      levelId: place.level.id,
      cityId: place.city.id,
      type: place.level.type,
      title: place.level.title,
      state: place.state,
      stars: place.stars,
      x: at.x,
      z: at.z,
      radius: nodeRadius(place.level.type),
    };
  });
  const cities: MapCity[] = order.flatMap((city) => {
    const own = places.filter((p) => p.city.id === city.id);
    const evaluation = own.find((p) => p.level.type === 'evaluation');
    const record = evaluation ? records.get(evaluation.level.id) : undefined;
    let status: CityStatus = 'locked';
    if (record?.finished) status = (record.bestScore ?? 0) >= 0.7 ? 'done' : 'consolidate';
    else if (own.some((p) => p.state === 'active')) status = 'current';
    return [
      {
        id: city.id,
        name: city.name,
        monument: city.monument,
        status,
        open: isCityOpen(island, city, records),
        missing: missingRequirements(island, city, records).map((c) => c.name),
        recall: city.recall,
        center: cityLayout.get(city.id)!.center,
        radius: cityLayout.get(city.id)!.radius,
        levelsDone: own.filter((p) => p.state === 'completed').length,
        levelsTotal: own.length,
        stars: own.reduce((sum, p) => sum + p.stars, 0),
      },
    ];
  });
  const pawn = currentLevel(places, records);
  const pawnIndex = pawn
    ? places.findIndex((p) => p.level.id === pawn.level.id)
    : Math.max(0, places.length - 1);
  const xs = [
    ...nodes.map((n) => n.x),
    ...cities.flatMap((c) => [c.center.x - c.radius, c.center.x + c.radius]),
  ];
  const zs = [
    ...nodes.map((n) => n.z),
    ...cities.flatMap((c) => [c.center.z - c.radius, c.center.z + c.radius]),
  ];
  return {
    regionId,
    nodes,
    cities,
    path: smoothPath(pathAnchors(layouts)),
    bounds: {
      minX: Math.min(...xs),
      maxX: Math.max(...xs),
      minZ: Math.min(...zs),
      maxZ: Math.max(...zs),
    },
    pawnIndex,
  };
}

/** Ville la plus proche d'un point de la carte : celle de l'en-tête, qui suit le défilement. */
export function cityAt(map: RegionMap, point: Vec): MapCity | undefined {
  let best: MapCity | undefined;
  let bestDistance = Infinity;
  for (const city of map.cities) {
    const d = Math.hypot(city.center.x - point.x, city.center.z - point.z);
    if (d < bestDistance) {
      best = city;
      bestDistance = d;
    }
  }
  return best;
}
