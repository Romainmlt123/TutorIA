import { layoutCities, MAP_LAYOUT, pathAnchors, smoothPath, sweepBetween } from './mapLayout';

const levels = (n: number) => Array.from({ length: n }, () => 'lecon' as const);
const six = layoutCities([levels(7), levels(7), levels(5), levels(9), levels(9), levels(8)]);
const dist = (a: { x: number; z: number }, b: { x: number; z: number }) =>
  Math.hypot(a.x - b.x, a.z - b.z);

describe('disposition de la carte d’une région (X2b)', () => {
  it('place un point par niveau, autour du centre de chaque ville', () => {
    expect(six.map((c) => c.nodes.length)).toEqual([7, 7, 5, 9, 9, 8]);
    for (const city of six) {
      const radii = city.nodes.map((n) => dist(n, city.center));
      for (const r of radii) expect(r).toBeCloseTo(radii[0]!);
      expect(radii[0]).toBeGreaterThanOrEqual(MAP_LAYOUT.minRadius - 1e-9);
      expect(city.radius).toBeCloseTo(radii[0]! + MAP_LAYOUT.clearing);
    }
  });

  it('range les villes en serpentin, deux par rangée', () => {
    const rows = [0, 2, 4].map((i) => [six[i]!.center, six[i + 1]!.center]);
    expect(rows[0]![0]!.x).toBeLessThan(rows[0]![1]!.x);
    expect(rows[1]![0]!.x).toBeGreaterThan(rows[1]![1]!.x);
    expect(rows[2]![0]!.x).toBeLessThan(rows[2]![1]!.x);
    expect(six[2]!.center.z).toBeGreaterThan(six[0]!.center.z + 3);
    expect(six[4]!.center.z).toBeGreaterThan(six[2]!.center.z + 3);
  });

  it('garde les clairières séparées, et les niveaux voisins à distance de jeu', () => {
    for (const [i, a] of six.entries()) {
      for (const b of six.slice(i + 1))
        expect(dist(a.center, b.center)).toBeGreaterThan(a.radius + b.radius);
      for (const [k, node] of a.nodes.entries()) {
        const next = a.nodes[k + 1];
        if (next) expect(dist(node, next)).toBeGreaterThan(0.6);
      }
    }
  });

  it('relie la dernière marche d’une ville à la première de la suivante', () => {
    for (let i = 0; i < six.length - 1; i++) {
      const gap = dist(six[i]!.nodes.at(-1)!, six[i + 1]!.nodes[0]!);
      expect(gap).toBeGreaterThan(0.8);
      expect(gap).toBeLessThan(3);
    }
  });

  it('place les villes aux emplacements choisis, et entre du côté du détour', () => {
    const placed = layoutCities(
      [levels(7), levels(7)],
      [
        { center: { x: 0, z: 0 }, via: [] },
        { center: { x: 8, z: 0 }, via: [{ x: 8, z: 5 }] },
      ],
    );
    expect(placed[1]!.center).toEqual({ x: 8, z: 0 });
    // Le premier niveau de la seconde ville est du côté du détour (vers +z), pas de la première ville.
    expect(placed[1]!.nodes[0]!.z).toBeGreaterThan(1);
    const anchors = pathAnchors(placed);
    expect(anchors).toHaveLength(15);
    expect(anchors[7]).toMatchObject({ x: 8, z: 5 });
    expect(anchors[7]!.u).toBeGreaterThan(6);
    expect(anchors[7]!.u).toBeLessThan(7);
  });

  it('pose une ville seule au centre de la carte', () => {
    const [only] = layoutCities([levels(7)]);
    expect(only!.center).toEqual({ x: 0, z: 0 });
  });

  it('fait passer l’arc par l’avant quand les deux côtés sont opposés', () => {
    const sweep = sweepBetween(Math.PI, 0);
    expect(Math.abs(sweep)).toBeCloseTo(Math.PI);
    expect(Math.sin(Math.PI + sweep / 2)).toBeGreaterThan(0.99);
  });

  it('prend le grand tour quand le monument est à contourner', () => {
    expect(Math.abs(sweepBetween(Math.PI, Math.PI / 2))).toBeCloseTo((3 * Math.PI) / 2);
  });
});

describe('chemin lissé', () => {
  const points = six.flatMap((c) => c.nodes);
  const path = smoothPath(pathAnchors(six));

  it('passe par chaque point de niveau', () => {
    for (const [i, p] of points.entries()) {
      const sample = path.find((s) => Math.abs(s.u - i) < 1e-9)!;
      expect(dist(sample, p)).toBeLessThan(1e-6);
    }
  });

  it('prolonge le chemin avant le premier point et après le dernier', () => {
    expect(path[0]!.u).toBeLessThan(0);
    expect(path.at(-1)!.u).toBeGreaterThan(points.length - 1);
    expect(dist(path[0]!, points[0]!)).toBeCloseTo(0.5, 1);
  });

  it('ne fait pas de saut entre deux échantillons', () => {
    for (let i = 1; i < path.length; i++) expect(dist(path[i]!, path[i - 1]!)).toBeLessThan(0.25);
  });
});
