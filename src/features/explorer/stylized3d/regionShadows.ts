import generatedShadows from './regionShadows.json';

export type RegionPoint = readonly [number, number];
export type RegionShadow = {
  id: string;
  focus: RegionPoint;
  polygon: readonly RegionPoint[];
};
export type RegionShadowSet = {
  scale: number;
  land: readonly RegionPoint[];
  shadows: readonly RegionShadow[];
};

function isRegionId(id: string): id is keyof typeof generatedShadows {
  return Object.prototype.hasOwnProperty.call(generatedShadows, id);
}

function point(coordinates: readonly number[]): RegionPoint {
  const x = coordinates[0];
  const z = coordinates[1];
  if (
    coordinates.length !== 2 ||
    x === undefined ||
    z === undefined ||
    !Number.isFinite(x) ||
    !Number.isFinite(z)
  ) {
    throw new Error('Coordonnée invalide dans les ombres générées des régions.');
  }
  return [x, z];
}

function parseSet(data: (typeof generatedShadows)[keyof typeof generatedShadows]): RegionShadowSet {
  return {
    scale: data.scale,
    land: data.land.map(point),
    shadows: data.shadows.map((shadow) => ({
      id: shadow.id,
      focus: point(shadow.focus),
      polygon: shadow.polygon.map(point),
    })),
  };
}

const parsedShadows = new Map<keyof typeof generatedShadows, RegionShadowSet>();
for (const [id, data] of Object.entries(generatedShadows)) {
  if (!isRegionId(id)) throw new Error(`Identifiant de région inconnu dans les ombres : ${id}`);
  parsedShadows.set(id, parseSet(data));
}

export function regionShadowSet(id: string): RegionShadowSet | null {
  return isRegionId(id) ? (parsedShadows.get(id) ?? null) : null;
}
