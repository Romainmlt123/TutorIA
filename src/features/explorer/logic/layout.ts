import type { LevelType } from '../content';

/*
 * Positions calculées du chemin d'une île, en unités de carte (1 unité = 1 px de la maquette à 390 px).
 * Elles sont partagées par la scène 3D, l'interface projetée et la vue en liste : jamais saisies à la main.
 * Formule de la maquette (WorldMap) : x = début + rang × pas + écarts, y = centre + amplitude × sin(rang).
 */

export const PATH_LAYOUT = {
  start: 36,
  step: 82,
  centerY: 452,
  amplitude: 66,
  /** Écart ajouté avant une évaluation, plus grande que les autres points. */
  gapBeforeEvaluation: 8,
  /** Écart entre deux villes, pour leur monument et leur bannière. */
  gapBetweenCities: 98,
  /** Écart entre deux régions (changement de biome, pont). */
  gapBetweenRegions: 140,
  /** Marge après le dernier point. */
  end: 120,
} as const;

/** Rayon d'un point (52 px, et 68 px pour une évaluation). */
export function nodeRadius(type: LevelType): number {
  return type === 'evaluation' ? 34 : 26;
}

export type PathStop = { type: LevelType; cityId: string; regionId: string };

export type PathPoint = { x: number; y: number; radius: number };

export type Zone = { id: string; from: number; to: number };

export type PathLayout = {
  points: readonly PathPoint[];
  cities: readonly Zone[];
  regions: readonly Zone[];
  width: number;
};

function extendZone(zones: Zone[], id: string, x: number) {
  const last = zones[zones.length - 1];
  if (last?.id === id) last.to = x;
  else zones.push({ id, from: x, to: x });
}

export function layoutPath(stops: readonly PathStop[]): PathLayout {
  const L = PATH_LAYOUT;
  const points: PathPoint[] = [];
  const cities: Zone[] = [];
  const regions: Zone[] = [];
  let offset = 0;
  stops.forEach((stop, i) => {
    const previous = stops[i - 1];
    if (previous && previous.regionId !== stop.regionId) offset += L.gapBetweenRegions;
    else if (previous && previous.cityId !== stop.cityId) offset += L.gapBetweenCities;
    if (stop.type === 'evaluation') offset += L.gapBeforeEvaluation;
    const x = L.start + i * L.step + offset;
    const y = L.centerY + L.amplitude * Math.sin(i * 1.05 + 0.2);
    points.push({ x, y, radius: nodeRadius(stop.type) });
    extendZone(cities, stop.cityId, x);
    extendZone(regions, stop.regionId, x);
  });
  const last = points[points.length - 1];
  return { points, cities, regions, width: (last?.x ?? 0) + L.end };
}

/** Zone (ville ou région) visible au centre de l'écran, pour l'en-tête qui suit le défilement. */
export function zoneAt(zones: readonly Zone[], x: number): Zone | undefined {
  let best: Zone | undefined;
  for (const zone of zones) {
    if (zone.from <= x) best = zone;
  }
  return best ?? zones[0];
}
