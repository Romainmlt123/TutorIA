import type { City, Island, LevelType } from '../content';
import { layoutPath, PATH_LAYOUT, type PathStop } from './layout';
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
 * Repère : x le long de la bande, z vers la caméra (l'axe de la vague du chemin), en mètres.
 */

/** Mètres de la scène par unité de la maquette (82 unités d'écart entre deux points = 0,82 m). */
export const METERS_PER_UNIT = 0.01;

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
  status: CityStatus;
  /** Ville ouverte : ses prérequis sont levés, ou elle a déjà été jouée. */
  open: boolean;
  /** Noms des villes à terminer d'abord, quand elle est fermée. */
  missing: readonly string[];
  recall: string | undefined;
  /** Étendue de la ville sur la bande (x, mètres) et place de son monument (x). */
  from: number;
  to: number;
  monumentX: number;
  levelsDone: number;
  levelsTotal: number;
  stars: number;
};

export type RegionMap = {
  regionId: string;
  nodes: readonly MapNode[];
  cities: readonly MapCity[];
  /** Longueur de la bande, en mètres. */
  width: number;
  /** Rang du niveau du pion (le niveau à jouer), ou du dernier niveau si tout est fait. */
  pawnIndex: number;
};

const meters = (units: number) => units * METERS_PER_UNIT;

export function buildRegionMap(
  island: Island,
  regionId: string,
  records: Records,
): RegionMap | null {
  const region = island.regions.find((r) => r.id === regionId);
  if (!region) return null;
  const path = islandPath(island, records);
  const places: PlacedLevel[] = path.filter((p) => p.region.id === regionId);
  const stops: PathStop[] = places.map((p) => ({
    type: p.level.type,
    cityId: p.city.id,
    regionId,
  }));
  const layout = layoutPath(stops);
  const nodes: MapNode[] = places.map((place, i) => ({
    levelId: place.level.id,
    cityId: place.city.id,
    type: place.level.type,
    title: place.level.title,
    state: place.state,
    stars: place.stars,
    x: meters(layout.points[i]!.x),
    z: meters(layout.points[i]!.y - PATH_LAYOUT.centerY),
    radius: meters(layout.points[i]!.radius),
  }));
  const cityById = new Map<string, City>(region.cities.map((c) => [c.id, c]));
  const cities: MapCity[] = layout.cities.flatMap((zone) => {
    const city = cityById.get(zone.id);
    if (!city) return [];
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
        status,
        open: isCityOpen(island, city, records),
        missing: missingRequirements(island, city, records).map((c) => c.name),
        recall: city.recall,
        from: meters(zone.from),
        to: meters(zone.to),
        // Le monument se pose après le dernier point de la ville, avant la suivante.
        monumentX: meters(zone.to + PATH_LAYOUT.gapBetweenCities / 2 + PATH_LAYOUT.step / 2),
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
  return {
    regionId,
    nodes,
    cities,
    width: meters(layout.width),
    pawnIndex,
  };
}

/** Ville visible au centre de l'écran quand la caméra est en `x` (l'en-tête suit le défilement). */
export function cityAt(map: RegionMap, x: number): MapCity | undefined {
  let best: MapCity | undefined;
  for (const city of map.cities) {
    if (city.from - 0.5 <= x) best = city;
  }
  return best ?? map.cities[0];
}
