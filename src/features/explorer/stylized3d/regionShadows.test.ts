import shadowsByRegion from './regionShadows.json';
import layout from './regions.json';
import { TERRAIN_SCALES } from './terrainScales';

type Point = readonly [number, number];
const BOUNDARY_EPSILON = 0.03;
const GRID_STEP = 0.05;
const edge = (angle: number) =>
  3.2 *
  (1 +
    0.06 * Math.sin(5 * angle + 0.7) +
    0.04 * Math.sin(8 * angle + 2.1) +
    0.03 * Math.sin(2 * angle + 4.4));

function localPolygon(polygon: readonly (readonly number[])[], scale: number): Point[] {
  return polygon.map(([x, z]) => [x! / scale, z! / scale] as const);
}

function inside(polygon: readonly Point[], x: number, z: number): boolean {
  let result = false;
  polygon.forEach(([ax, az], index) => {
    const [bx, bz] = polygon[(index + 1) % polygon.length]!;
    if (az > z !== bz > z && x < ax + ((z - az) * (bx - ax)) / (bz - az)) result = !result;
  });
  return result;
}

function distanceToSegment(point: Point, start: Point, end: Point): number {
  const dx = end[0] - start[0];
  const dz = end[1] - start[1];
  const length = dx * dx + dz * dz;
  const progress =
    length === 0
      ? 0
      : Math.max(
          0,
          Math.min(1, ((point[0] - start[0]) * dx + (point[1] - start[1]) * dz) / length),
        );
  return Math.hypot(point[0] - start[0] - progress * dx, point[1] - start[1] - progress * dz);
}

function boundaryDistance(polygon: readonly Point[], point: Point): number {
  return polygon.reduce(
    (closest, start, index) =>
      Math.min(closest, distanceToSegment(point, start, polygon[(index + 1) % polygon.length]!)),
    Number.POSITIVE_INFINITY,
  );
}

describe('contours des régions voisines', () => {
  it('fournit le contour terrestre radial et les silhouettes de chaque carte pré-rendue', () => {
    expect(Object.keys(shadowsByRegion)).toEqual(Object.keys(TERRAIN_SCALES));
    for (const [mapId, entry] of Object.entries(shadowsByRegion)) {
      const land = localPolygon(entry.land, entry.scale);
      expect(land).toHaveLength(360);
      for (const [index, [x, z]] of land.entries()) {
        const angle = (index / land.length) * Math.PI * 2;
        expect(Math.hypot(x, z)).toBeCloseTo(edge(angle) * 0.985, 5);
      }
      expect(entry.shadows.map((shadow) => shadow.id).sort()).toEqual(
        [
          ...layout.regions.filter((region) => region.id !== mapId).map((region) => region.id),
          layout.islet.region,
        ].sort(),
      );

      const neighborPolygons = entry.shadows
        .filter((shadow) => shadow.id !== 'maths-algo')
        .map((shadow) => localPolygon(shadow.polygon, entry.scale));
      for (const polygon of neighborPolygons) {
        expect(polygon.length).toBeGreaterThan(2);
        for (const point of polygon) {
          expect(
            inside(land, point[0], point[1]) || boundaryDistance(land, point) <= BOUNDARY_EPSILON,
          ).toBe(true);
        }
      }

      const islet = entry.shadows.find((shadow) => shadow.id === 'maths-algo')!;
      const isletPolygon = localPolygon(islet.polygon, entry.scale);
      expect(isletPolygon).toHaveLength(64);
      expect(
        boundaryDistance(land, [islet.focus[0]! / entry.scale, islet.focus[1]! / entry.scale]),
      ).toBeGreaterThan(0.5);
    }
  });

  it('ne laisse aucun vide entre le terrain de Nombres et ses régions voisines', () => {
    for (const [mapId, entry] of Object.entries(shadowsByRegion)) {
      const own = layout.regions.find((region) => region.id === mapId)!;
      const ownPolygon = own.polygon.map(([x, z]) => [x!, z!] as const);
      const land = localPolygon(entry.land, entry.scale);
      const neighbors = entry.shadows
        .filter((shadow) => shadow.id !== 'maths-algo')
        .map((shadow) => localPolygon(shadow.polygon, entry.scale));
      const x0 = Math.min(...land.map(([x]) => x));
      const x1 = Math.max(...land.map(([x]) => x));
      const z0 = Math.min(...land.map(([, z]) => z));
      const z1 = Math.max(...land.map(([, z]) => z));
      const boundaries = [land, ownPolygon, ...neighbors];
      const uncovered: Point[] = [];
      let checked = 0;

      for (let z = z0 + GRID_STEP / 2; z < z1; z += GRID_STEP) {
        for (let x = x0 + GRID_STEP / 2; x < x1; x += GRID_STEP) {
          const point = [x, z] as const;
          if (!inside(land, x, z) || inside(ownPolygon, x, z)) continue;
          if (boundaries.some((polygon) => boundaryDistance(polygon, point) < BOUNDARY_EPSILON)) {
            continue;
          }
          checked += 1;
          if (!neighbors.some((polygon) => inside(polygon, x, z))) uncovered.push(point);
        }
      }

      expect(checked).toBeGreaterThan(100);
      expect(uncovered.slice(0, 5)).toEqual([]);
    }
  });

  it('ne laisse pas les polygones d’Espace et de Données se recouvrir', () => {
    for (const entry of Object.values(shadowsByRegion)) {
      const data = localPolygon(
        entry.shadows.find((shadow) => shadow.id === 'maths-donnees')!.polygon,
        entry.scale,
      );
      const space = localPolygon(
        entry.shadows.find((shadow) => shadow.id === 'maths-espace')!.polygon,
        entry.scale,
      );
      const x0 = Math.max(Math.min(...data.map(([x]) => x)), Math.min(...space.map(([x]) => x)));
      const x1 = Math.min(Math.max(...data.map(([x]) => x)), Math.max(...space.map(([x]) => x)));
      const z0 = Math.max(
        Math.min(...data.map(([, z]) => z)),
        Math.min(...space.map(([, z]) => z)),
      );
      const z1 = Math.min(
        Math.max(...data.map(([, z]) => z)),
        Math.max(...space.map(([, z]) => z)),
      );
      let overlapBeyondBoundary = false;
      for (let z = z0; z < z1 && !overlapBeyondBoundary; z += 0.01) {
        for (let x = x0; x < x1; x += 0.01) {
          if (inside(data, x, z) && inside(space, x, z)) {
            const point = [x, z] as const;
            if (
              boundaryDistance(data, point) >= BOUNDARY_EPSILON &&
              boundaryDistance(space, point) >= BOUNDARY_EPSILON
            ) {
              overlapBeyondBoundary = true;
              break;
            }
          }
        }
      }
      expect(overlapBeyondBoundary).toBe(false);
    }
  });
});
