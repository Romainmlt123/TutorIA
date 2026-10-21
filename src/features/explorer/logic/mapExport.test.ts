import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { ISLANDS, type Island } from '../content';
import { PRERENDERED_MAPS } from '../tiles';
import { buildMapExport, type MapExport } from './mapExport';
import { MAP_ELEVATION } from './shots';

/*
 * Disposition des cartes pré-rendues, lue par Blender (tools/explorer-3d/region_tiles.py) : l'app
 * en est la source. `npm run explorer:layout` (UPDATE_MAP_LAYOUT=1) réécrit les fichiers ; sinon,
 * le test vérifie qu'ils sont à jour et que les tuiles installées ont été rendues pour eux.
 */

const LAYOUTS = join(__dirname, '..', '..', '..', '..', 'tools', 'explorer-3d', 'layouts');
const UPDATE = process.env.UPDATE_MAP_LAYOUT === '1';
const layoutFile = (regionId: string) => join(LAYOUTS, `${regionId}.json`);

/** Les îles, avec un niveau de moins dans la première ville de la région. */
function withoutOneLevel(regionId: string): readonly Island[] {
  return ISLANDS.map((island) => ({
    ...island,
    regions: island.regions.map((region) =>
      region.id !== regionId
        ? region
        : {
            ...region,
            cities: region.cities.map((city, i) =>
              i === 0 ? { ...city, levels: city.levels.slice(0, -1) } : city,
            ),
          },
    ),
  }));
}

describe('export de la disposition d’une carte pré-rendue', () => {
  let nombres: MapExport;
  beforeAll(() => {
    nombres = buildMapExport('maths-nombres');
  });

  it('écrit les clés que lit Blender, dans cet ordre', () => {
    expect(Object.keys(nombres)).toEqual([
      'regionId',
      'cities',
      'nodes',
      'path',
      'bounds',
      'decor',
      'planks',
      'tufts',
      'bladeRule',
      'grade',
      'gradeColors',
      'grassBlades',
      'sun',
      'water',
      'renderedRect',
      'layoutHash',
    ]);
    expect(nombres.nodes).toHaveLength(43);
    expect(nombres.cities.map((c) => c.id)).toContain('maths-relatifs');
  });

  it('arrondit les mesures au cent-millième de mètre', () => {
    const values = [
      ...nombres.path.flat(),
      ...nombres.nodes.flatMap((n) => [n.x, n.z, n.radius]),
      ...nombres.decor.flatMap(([, ...numbers]) => numbers),
      ...nombres.tufts.position,
      ...nombres.renderedRect,
    ];
    expect(values.filter((value) => Math.round(value * 1e5) / 1e5 !== value)).toEqual([]);
  });

  it('tire son empreinte des villes, des niveaux, du chemin, des décors et des touffes', () => {
    const { cities, nodes, path, decor, tufts } = nombres;
    const hash = createHash('sha256')
      .update(JSON.stringify([cities, nodes, path, decor, tufts]))
      .digest('hex');
    expect(nombres.layoutHash).toBe(hash.slice(0, 16));
  });

  it('change d’empreinte quand une ville perd un niveau : les tuiles sont alors refusées', () => {
    const changed = buildMapExport('maths-nombres', withoutOneLevel('maths-nombres'));
    expect(changed.nodes).toHaveLength(42);
    expect(changed.layoutHash).not.toBe(nombres.layoutHash);
    expect(changed.layoutHash).not.toBe(PRERENDERED_MAPS['maths-nombres']?.layoutHash);
  });

  it('refuse une région inconnue', () => {
    expect(() => buildMapExport('maths-lune')).toThrow('maths-lune');
  });
});

describe.each(Object.keys(PRERENDERED_MAPS))('carte pré-rendue %s', (regionId) => {
  let fresh: MapExport;
  beforeAll(() => {
    fresh = buildMapExport(regionId);
  });

  it(
    UPDATE ? 'réécrit sa disposition' : 'a sa disposition à jour (sinon : npm run explorer:layout)',
    () => {
      const text = JSON.stringify(fresh);
      if (UPDATE) {
        mkdirSync(LAYOUTS, { recursive: true });
        writeFileSync(layoutFile(regionId), text);
        return;
      }
      expect(existsSync(layoutFile(regionId))).toBe(true);
      const written = readFileSync(layoutFile(regionId), 'utf8');
      const saved = JSON.parse(written) as Record<string, unknown>;
      expect(Object.keys(saved)).toEqual(Object.keys(fresh));
      const stale = (Object.keys(fresh) as (keyof MapExport)[]).filter(
        (key) => JSON.stringify(saved[key]) !== JSON.stringify(fresh[key]),
      );
      expect(stale).toEqual([]);
      expect(written === text).toBe(true);
    },
  );

  it('a des tuiles rendues pour cette disposition (sinon : refaire le rendu)', () => {
    const tiles = PRERENDERED_MAPS[regionId]!;
    expect(tiles.regionId).toBe(regionId);
    expect(tiles.elevation).toBe(MAP_ELEVATION);
    expect(tiles.layoutHash).toBe(fresh.layoutHash);
  });
});
