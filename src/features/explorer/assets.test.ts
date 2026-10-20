import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

import { MODEL_FOLDERS, MODEL_RULES, nodeRule, ruleKey, type ModelRule } from './logic/modelRules';

/*
 * Budgets des modèles 3D versionnés (îles, régions, avatar), lus dans les fichiers eux-mêmes : la
 * partie JSON du GLB et les premiers octets des images. Un modèle recuit dans Blender passe par
 * `npm run explorer:clean` ; les règles sont dans logic/modelRules.ts.
 */

const ROOT = join(__dirname, '..', '..', '..');

/** Seule extension permise : la quantification. Ni Draco, ni Meshopt, ni KTX2, ni WebP. */
const ALLOWED_EXTENSIONS = ['KHR_mesh_quantization'];

/** Les seules images qu'expo-gl sait décoder sur téléphone, et leurs premiers octets. */
const IMAGE_SIGNATURES: Readonly<Record<string, readonly number[]>> = {
  'image/jpeg': [0xff, 0xd8, 0xff],
  'image/png': [0x89, 0x50, 0x4e, 0x47],
};

type Primitive = {
  attributes: Record<string, number>;
  indices?: number;
  targets?: Record<string, number>[];
};

type Gltf = {
  extensionsRequired?: string[];
  nodes?: { name?: string; mesh?: number }[];
  meshes?: { primitives: Primitive[] }[];
  images?: { mimeType?: string; bufferView?: number }[];
  accessors?: { bufferView?: number }[];
  bufferViews?: { byteOffset?: number; byteLength: number }[];
};

type Glb = { size: number; json: Gltf; bin: Buffer };

/** En-tête de 12 octets, puis la partie JSON, puis la partie binaire (spécification glTF 2.0). */
function readGlb(file: string): Glb {
  const data = readFileSync(join(ROOT, file));
  if (data.toString('latin1', 0, 4) !== 'glTF') throw new Error(`${file} : pas un GLB`);
  const jsonLength = data.readUInt32LE(12);
  const json = JSON.parse(data.toString('utf8', 20, 20 + jsonLength)) as Gltf;
  const binStart = 20 + jsonLength;
  const bin =
    binStart < data.length
      ? data.subarray(binStart + 8, binStart + 8 + data.readUInt32LE(binStart))
      : Buffer.alloc(0);
  return { size: data.length, json, bin };
}

/** Nœuds qui portent un maillage, avec leurs primitives. */
function meshNodes(json: Gltf): { name: string; primitives: Primitive[] }[] {
  return (json.nodes ?? []).flatMap((node) =>
    node.mesh === undefined
      ? []
      : [
          {
            name: node.name ?? '',
            primitives: json.meshes?.[node.mesh]?.primitives ?? [],
          },
        ],
  );
}

describe('modèles 3D', () => {
  it('ont chacun une règle, et chaque règle a son fichier', () => {
    const onDisk = MODEL_FOLDERS.flatMap((folder) =>
      readdirSync(join(ROOT, folder))
        .filter((name) => name.endsWith('.glb'))
        .map((name) => `${folder}/${name}`),
    );
    expect(onDisk.sort()).toEqual(MODEL_RULES.map((rule) => rule.file).sort());
  });

  describe.each(MODEL_RULES)('$file', (rule: ModelRule) => {
    let glb: Glb;
    beforeAll(() => {
      glb = readGlb(rule.file);
    });

    it('ne demande que la quantification', () => {
      for (const name of glb.json.extensionsRequired ?? []) {
        expect(ALLOWED_EXTENSIONS).toContain(name);
      }
    });

    it("n'embarque que des images JPEG ou PNG", () => {
      for (const image of glb.json.images ?? []) {
        const signature = IMAGE_SIGNATURES[image.mimeType ?? ''];
        const view = glb.json.bufferViews?.[image.bufferView ?? -1];
        expect(signature).toBeDefined();
        expect(view).toBeDefined();
        const start = view?.byteOffset ?? 0;
        expect([...glb.bin.subarray(start, start + (signature?.length ?? 0))]).toEqual(signature);
      }
    });

    it("ne garde que les attributs lus par l'app (sinon : npm run explorer:clean)", () => {
      for (const node of meshNodes(glb.json)) {
        const allowed = nodeRule(rule, node.name);
        expect({ node: node.name, rule: allowed !== undefined }).toEqual({
          node: node.name,
          rule: true,
        });
        for (const primitive of node.primitives) {
          const extra = Object.keys(primitive.attributes).filter(
            (name) => !allowed?.attributes.some((attribute) => attribute === name),
          );
          expect({ node: node.name, extra }).toEqual({ node: node.name, extra: [] });
          if (allowed?.dropIndices) {
            expect({ node: node.name, indices: primitive.indices }).toEqual({
              node: node.name,
              indices: undefined,
            });
          }
        }
      }
    });

    it("a au moins un nœud pour chaque règle (noms lus par l'app)", () => {
      const names = meshNodes(glb.json).map((node) => node.name);
      for (const key of Object.keys(rule.nodes)) {
        const matched = names.some((name) => ruleKey(rule, name) === key);
        expect({ rule: key, matched }).toEqual({ rule: key, matched: true });
      }
    });

    it('range chaque attribut dans sa propre vue (sommets non entrelacés)', () => {
      const accessors = glb.json.accessors ?? [];
      const perView = new Map<number, number>();
      for (const accessor of accessors) {
        if (accessor.bufferView === undefined) continue;
        perView.set(accessor.bufferView, (perView.get(accessor.bufferView) ?? 0) + 1);
      }
      const shared = meshNodes(glb.json)
        .flatMap((node) => node.primitives)
        .flatMap((primitive) => [
          ...Object.values(primitive.attributes),
          ...(primitive.targets ?? []).flatMap((target) => Object.values(target)),
        ])
        .filter((index) => (perView.get(accessors[index]?.bufferView ?? -1) ?? 0) > 1);
      expect(shared).toEqual([]);
    });

    it('tient sous son plafond de poids', () => {
      expect(glb.size).toBeLessThanOrEqual(rule.maxBytes);
    });

    it('relie les zones du corps et leurs vêtements à des nœuds du GLB', () => {
      if (rule.file !== 'assets/avatar/avatar.glb') return;
      const bodyZones = JSON.parse(
        readFileSync(join(ROOT, 'src/features/avatar/avatar3d/bodyZones.json'), 'utf8'),
      ) as Record<string, string[]>;
      const names = new Set(meshNodes(glb.json).map((node) => node.name));
      const expectedZones = [
        'bas-pantalon-ceinture',
        'bas-short-ceinture',
        'corps',
        'corps-avant-bras',
        'corps-bras-haut',
        'corps-cuisse',
        'corps-mollet',
        'corps-torse-bas',
        'corps-torse-haut',
      ];
      expect(Object.keys(bodyZones)).toEqual(expectedZones);
      expect(bodyZones).not.toHaveProperty('bas-jupe-ceinture');
      expect(names.has('bas-jupe-ceinture')).toBe(false);
      for (const belt of ['bas-pantalon-ceinture', 'bas-short-ceinture']) {
        expect(bodyZones[belt]).toEqual(['haut-sweat', 'haut-tshirt']);
      }
      for (const zone of Object.keys(bodyZones)) expect(names.has(zone)).toBe(true);
      for (const pieces of Object.values(bodyZones)) {
        for (const piece of pieces) expect(names.has(piece)).toBe(true);
      }
      expect(rule.nodes).toHaveProperty('*');
      for (const name of [...Object.keys(bodyZones), ...Object.values(bodyZones).flat()]) {
        expect(ruleKey(rule, name)).toBe('*');
      }
    });
  });
});
