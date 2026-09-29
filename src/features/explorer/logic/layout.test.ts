import { ISLANDS, pathOf } from '../content';
import { layoutPath, PATH_LAYOUT, zoneAt } from './layout';

const stopsOf = (index: number) =>
  pathOf(ISLANDS[index]!).map((p) => ({
    type: p.level.type,
    cityId: p.city.id,
    regionId: p.region.id,
  }));

describe('positions du chemin', () => {
  it('reprend la maquette : premier point à 36, pas de 82, vague autour de 452', () => {
    const { points } = layoutPath(stopsOf(0));
    expect(points[0]).toMatchObject({ x: 36 });
    expect(points[1]!.x - points[0]!.x).toBe(82);
    expect(points.every((p) => Math.abs(p.y - PATH_LAYOUT.centerY) <= PATH_LAYOUT.amplitude)).toBe(
      true,
    );
  });

  it.each(ISLANDS.map((island, i) => [island.subjectId, i] as const))(
    'ne fait jamais se chevaucher deux points (%s)',
    (_, i) => {
      const { points } = layoutPath(stopsOf(i));
      for (let k = 1; k < points.length; k++) {
        const a = points[k - 1]!;
        const b = points[k]!;
        // 48 px de zone tactile minimum entre deux points, en plus de leurs rayons.
        expect(Math.hypot(b.x - a.x, b.y - a.y)).toBeGreaterThanOrEqual(a.radius + b.radius + 12);
      }
    },
  );

  it('laisse la place d’un monument entre deux villes et garde tout dans la carte', () => {
    const layout = layoutPath(stopsOf(0));
    for (let k = 1; k < layout.cities.length; k++) {
      expect(layout.cities[k]!.from - layout.cities[k - 1]!.to).toBeGreaterThanOrEqual(
        PATH_LAYOUT.step + PATH_LAYOUT.gapBetweenCities,
      );
    }
    const xs = layout.points.map((p) => p.x);
    expect(Math.min(...xs)).toBeGreaterThan(0);
    expect(Math.max(...xs)).toBeLessThan(layout.width);
  });

  it('retrouve la ville visible au centre de l’écran', () => {
    const layout = layoutPath(stopsOf(0));
    const equations = layout.cities.find((z) => z.id === 'maths-equations')!;
    expect(zoneAt(layout.cities, equations.from + 10)?.id).toBe('maths-equations');
    expect(zoneAt(layout.cities, -100)?.id).toBe(layout.cities[0]!.id);
  });
});
