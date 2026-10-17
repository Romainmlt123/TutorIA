import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { islandOf } from '../content';
import { hiddenLevels, type MonumentBox } from './occluders';
import { buildRegionMap, type MapCity, type MapNode } from './regionMap';

const ROOT = join(__dirname, '..', '..', '..', '..');

type Vec3 = [number, number, number];
type Gltf = {
  nodes: { name: string; mesh?: number; translation?: Vec3; rotation?: number[]; scale?: Vec3 }[];
  meshes: { primitives: { attributes: { POSITION: number } }[] }[];
  accessors: { min: Vec3; max: Vec3; normalized?: boolean; componentType: number }[];
};

/** Plus grande valeur des entiers normalisés (octet, octet non signé, court, court non signé). */
const NORMALIZED: Readonly<Record<number, number>> = {
  5120: 127,
  5121: 255,
  5122: 32767,
  5123: 65535,
};

/**
 * Boîtes des monuments autour du centre de leur ville, lues dans la partie JSON du modèle de la
 * région : bornes des sommets quantifiés (KHR_mesh_quantization), puis échelle et translation du nœud.
 */
function monumentBoxes(file: string): Record<string, MonumentBox> {
  const data = readFileSync(join(ROOT, file));
  const json = JSON.parse(data.toString('utf8', 20, 20 + data.readUInt32LE(12))) as Gltf;
  const boxes: Record<string, MonumentBox> = {};
  for (const node of json.nodes) {
    if (node.mesh === undefined) continue;
    if (node.rotation) throw new Error(`${node.name} : rotation non prise en charge`);
    const t = node.translation ?? [0, 0, 0];
    const s = node.scale ?? [1, 1, 1];
    const min: Vec3 = [Infinity, Infinity, Infinity];
    const max: Vec3 = [-Infinity, -Infinity, -Infinity];
    for (const primitive of json.meshes[node.mesh]!.primitives) {
      const accessor = json.accessors[primitive.attributes.POSITION]!;
      const unit = accessor.normalized ? NORMALIZED[accessor.componentType]! : 1;
      for (let i = 0; i < 3; i++) {
        min[i] = Math.min(min[i]!, t[i]! + (s[i]! * accessor.min[i]!) / unit);
        max[i] = Math.max(max[i]!, t[i]! + (s[i]! * accessor.max[i]!) / unit);
      }
    }
    boxes[node.name] = { min, max };
  }
  return boxes;
}

const node = (levelId: string, x: number, z: number) => ({ levelId, x, z }) as MapNode;
const city = (monument: string, x: number, z: number) =>
  ({ monument, center: { x, z } }) as MapCity;
const mapOf = (nodes: MapNode[], cities: MapCity[]) => ({ nodes, cities });

/** Une tour de 0,6 m de côté et de 1,8 m de haut. */
const TOWER: MonumentBox = { min: [-0.3, 0, -0.3], max: [0.3, 1.8, 0.3] };

describe('monuments qui cacheraient l’avatar sur la carte pré-rendue', () => {
  it('signale un niveau juste derrière un monument haut', () => {
    const map = mapOf([node('derriere', 0, -1)], [city('tour', 0, 0)]);
    expect(hiddenLevels(map, { tour: TOWER })).toEqual([
      {
        levelId: 'derriere',
        monument: 'tour',
        width: expect.any(Number),
        height: expect.any(Number),
      },
    ]);
  });

  it('laisse les niveaux devant le monument, à côté, ou assez loin derrière', () => {
    const map = mapOf(
      [
        node('devant', 0, 1),
        node('a-cote', 1.5, -0.5),
        node('loin', 0, -4),
        // Le haut de la tour ne touche que le bout des pieds (2 cm du plan image).
        node('orteils', 0, -1.83),
      ],
      [city('tour', 0, 0)],
    );
    expect(hiddenLevels(map, { tour: TOWER })).toEqual([]);
  });

  it('ignore une ville dont le monument n’a pas de modèle (village générique, bas)', () => {
    const map = mapOf([node('derriere', 0, -1)], [city('village', 0, 0)]);
    expect(hiddenLevels(map, { tour: TOWER })).toEqual([]);
  });

  it('ne trouve, dans Nombres, que le bilan des Puissances derrière sa tour', () => {
    const map = buildRegionMap(islandOf('maths')!, 'maths-nombres', new Map())!;
    const boxes = monumentBoxes('assets/explorer/models/strip-nombres.glb');
    // Tour des Puissances : 0,62 m de côté, 1,75 m de haut (mesuré avec gltf-transform).
    expect(boxes['tour-puissances']!.max[1]).toBeCloseTo(1.75, 2);
    expect(map.cities.every((c) => boxes[c.monument])).toBe(true);
    // Défaut connu de la disposition, à corriger avant la prochaine cuisson des tuiles : le disque
    // est posé juste derrière la tour, dont le haut couvrirait les jambes de l'avatar. Une fois le
    // niveau déplacé, cette liste doit être vide.
    expect(hiddenLevels(map, boxes).map((h) => `${h.levelId} (${h.monument})`)).toEqual([
      'maths-puissances.bilan (tour-puissances)',
    ]);
  });
});
