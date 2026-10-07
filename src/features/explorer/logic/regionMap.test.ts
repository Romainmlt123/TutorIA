import { demoLevelRecords } from '@/data/mock/explorer';

import { islandOf } from '../content';
import sites from '../stylized3d/regionSites.json';
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
    for (const node of map.nodes) {
      expect(node.x).toBeGreaterThan(map.bounds.minX);
      expect(node.x).toBeLessThan(map.bounds.maxX);
      expect(node.z).toBeGreaterThan(map.bounds.minZ);
      expect(node.z).toBeLessThan(map.bounds.maxZ);
    }
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
    // Les cercles de niveaux de deux villes ne se touchent pas (la clairière a 0,6 m de marge de plus).
    for (const [i, a] of map.cities.entries()) {
      for (const b of map.cities.slice(i + 1)) {
        const d = Math.hypot(a.center.x - b.center.x, a.center.z - b.center.z);
        expect(d).toBeGreaterThan(a.radius - 0.6 + (b.radius - 0.6) + 0.5);
      }
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

  it('retrouve la ville la plus proche du centre de l’écran', () => {
    const map = buildRegionMap(maths, 'maths-nombres', new Map())!;
    const equations = map.cities.find((c) => c.id === 'maths-equations')!;
    expect(cityAt(map, { x: equations.center.x + 0.3, z: equations.center.z - 0.2 })?.id).toBe(
      'maths-equations',
    );
    expect(cityAt(map, { x: -50, z: -50 })?.id).toBe('maths-relatifs');
  });

  it('couvre les quatre régions, l’îlot compris', () => {
    for (const region of maths.regions) {
      const map = buildRegionMap(maths, region.id, new Map())!;
      expect(map.nodes.length).toBeGreaterThan(0);
      expect(map.cities).toHaveLength(region.cities.length);
    }
  });

  it('suit les emplacements de regionSites.json, dans l’ordre du contenu', () => {
    // Un chapitre ajouté, retiré ou déplacé doit relancer tools/explorer-3d/region_map.py (EXPLORER_PLAN=1).
    for (const [regionId, entry] of Object.entries(sites)) {
      const region = maths.regions.find((r) => r.id === regionId)!;
      expect(Object.keys(entry.cities)).toEqual(region.cities.map((c) => c.id));
      const map = buildRegionMap(maths, regionId, new Map())!;
      for (const city of map.cities) {
        const [x, z] = entry.cities[city.id as keyof typeof entry.cities]!.center;
        expect(city.center).toEqual({ x, z });
      }
    }
  });
});
