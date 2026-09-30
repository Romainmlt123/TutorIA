import { demoLevelRecords } from '@/data/mock/explorer';

import { islandOf } from '../content';
import { cityAt, buildRegionMap } from './regionMap';

const maths = islandOf('maths')!;
const records = new Map(demoLevelRecords.map((r) => [r.levelId, r]));

describe('carte d’une région (X2b)', () => {
  it('ignore une région inconnue', () => {
    expect(buildRegionMap(maths, 'maths-lune', new Map())).toBeNull();
  });

  it('place un point par niveau de la région, dans l’ordre, en mètres', () => {
    const map = buildRegionMap(maths, 'maths-nombres', new Map())!;
    const levels = maths.regions
      .find((r) => r.id === 'maths-nombres')!
      .cities.flatMap((c) => c.levels);
    expect(map.nodes.map((n) => n.levelId)).toEqual(levels.map((l) => l.id));
    expect(map.nodes[0]!.x).toBeCloseTo(0.36);
    expect(map.nodes[1]!.x - map.nodes[0]!.x).toBeCloseTo(0.82);
    for (const node of map.nodes) expect(Math.abs(node.z)).toBeLessThanOrEqual(0.67);
    const xs = map.nodes.map((n) => n.x);
    expect(xs).toEqual([...xs].sort((a, b) => a - b));
    expect(map.width).toBeGreaterThan(xs.at(-1)!);
  });

  it('range les villes dans l’ordre, avec de la place pour leur monument', () => {
    const map = buildRegionMap(maths, 'maths-nombres', new Map())!;
    expect(map.cities.map((c) => c.id)).toEqual([
      'maths-relatifs',
      'maths-fractions',
      'maths-fractions-produits',
      'maths-puissances',
      'maths-calcul-litteral',
      'maths-equations',
    ]);
    for (let i = 1; i < map.cities.length; i++) {
      expect(map.cities[i]!.from).toBeGreaterThan(map.cities[i - 1]!.monumentX);
    }
  });

  it('annonce ce qui manque pour ouvrir une ville fermée', () => {
    const map = buildRegionMap(maths, 'maths-nombres', new Map())!;
    const equations = map.cities.find((c) => c.id === 'maths-equations')!;
    expect(equations.open).toBe(false);
    expect(equations.missing).toEqual(['Ville du Calcul littéral']);
    expect(equations.status).toBe('locked');
    expect(map.cities.find((c) => c.id === 'maths-relatifs')).toMatchObject({
      open: true,
      status: 'current',
      missing: [],
    });
  });

  it('place le pion sur le niveau joué en dernier, avec ses étoiles', () => {
    const map = buildRegionMap(maths, 'maths-nombres', records)!;
    expect(map.nodes[map.pawnIndex]!.title).toBe('Isoler x');
    const equations = map.cities.find((c) => c.id === 'maths-equations')!;
    expect(equations).toMatchObject({ open: true, levelsDone: 2, levelsTotal: 8, stars: 5 });
  });

  it('retrouve la ville visible au centre de l’écran', () => {
    const map = buildRegionMap(maths, 'maths-nombres', new Map())!;
    const equations = map.cities.find((c) => c.id === 'maths-equations')!;
    expect(cityAt(map, equations.from + 0.2)?.id).toBe('maths-equations');
    expect(cityAt(map, -5)?.id).toBe('maths-relatifs');
  });

  it('couvre les quatre régions, l’îlot compris', () => {
    for (const region of maths.regions) {
      const map = buildRegionMap(maths, region.id, new Map())!;
      expect(map.nodes.length).toBeGreaterThan(0);
      expect(map.cities).toHaveLength(region.cities.length);
    }
  });
});
