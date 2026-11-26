/**
 * Allège les modèles 3D (GLB) sans rien changer à l'image : retire, nœud par nœud, les attributs de
 * sommets que l'app ne lit jamais (liste blanche : src/features/explorer/logic/modelRules.ts) et les
 * indices triviaux des brins d'herbe, puis range chaque attribut à part (sommets non entrelacés :
 * three.js n'envoie plus deux fois le même bloc à la carte graphique).
 * Ne touche ni aux textures, ni aux noms, ni aux transformations, ni aux matériaux, squelettes,
 * formes et animations. Relançable : un fichier déjà nettoyé ressort identique.
 * Usage : npm run explorer:clean (aussi à la fin de explorer:models et de avatar:model, après la
 * quantification). Jamais `gltf-transform optimize` : il fusionne les chiffres de la cascade, retire
 * l'UV des brins et simplifie l'île.
 * Dépendances : @gltf-transform/core et @gltf-transform/extensions 4.5.1 (MIT, maintenues, outil de
 * développement seulement), la version de la CLI qui quantifie les modèles.
 */
import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { NodeIO, PropertyType, VertexLayout, type Document, type Mesh } from '@gltf-transform/core';
import { KHRONOS_EXTENSIONS } from '@gltf-transform/extensions';

import {
  isIdentityIndex,
  MODEL_FOLDERS,
  MODEL_RULES,
  nodeRule,
  type ModelRule,
  type NodeRule,
} from '../src/features/explorer/logic/modelRules.ts';

const RULES_FILE = 'src/features/explorer/logic/modelRules.ts';

const root = join(import.meta.dirname, '..');
// Les extensions Khronos restent déclarées (KHR_mesh_quantization surtout) ; une extension requise
// inconnue fait échouer la lecture.
const io = new NodeIO()
  .registerExtensions(KHRONOS_EXTENSIONS)
  .setVertexLayout(VertexLayout.SEPARATE);

type Stats = { bytes: number; triangles: number; imageBytes: number };

function fail(message: string): never {
  process.stderr.write(`${message}\n`);
  process.exit(1);
}

function stats(document: Document, bytes: number): Stats {
  let drawn = 0;
  for (const mesh of document.getRoot().listMeshes()) {
    for (const primitive of mesh.listPrimitives()) {
      drawn += (primitive.getIndices() ?? primitive.getAttribute('POSITION'))?.getCount() ?? 0;
    }
  }
  const imageBytes = document
    .getRoot()
    .listTextures()
    .reduce((sum, texture) => sum + (texture.getImage()?.byteLength ?? 0), 0);
  return { bytes, triangles: drawn / 3, imageBytes };
}

/** La règle de chaque maillage, d'après le nom des nœuds qui le portent. */
function meshRules(
  document: Document,
  model: ModelRule,
): Map<Mesh, { node: string; rule: NodeRule }> {
  const rules = new Map<Mesh, { node: string; rule: NodeRule }>();
  for (const node of document.getRoot().listNodes()) {
    const mesh = node.getMesh();
    if (!mesh) continue;
    const name = node.getName();
    const rule = nodeRule(model, name);
    if (!rule)
      throw new Error(`${model.file} : le nœud « ${name} » n'a pas de règle (${RULES_FILE})`);
    const known = rules.get(mesh);
    if (known && known.rule !== rule) {
      throw new Error(
        `${model.file} : « ${known.node} » et « ${name} » partagent un maillage, avec deux règles`,
      );
    }
    rules.set(mesh, { node: name, rule });
  }
  return rules;
}

/** Retire d'un modèle ce que sa règle ne garde pas. */
function clean(document: Document, model: ModelRule) {
  for (const [mesh, { node, rule }] of meshRules(document, model)) {
    for (const primitive of mesh.listPrimitives()) {
      for (const semantic of primitive.listSemantics()) {
        if (!rule.attributes.some((kept) => kept === semantic))
          primitive.setAttribute(semantic, null);
      }
      const indices = primitive.getIndices();
      if (!rule.dropIndices || !indices) continue;
      const order = indices.getArray();
      const vertices = primitive.getAttribute('POSITION')?.getCount() ?? -1;
      if (!order || !isIdentityIndex(order, vertices)) {
        throw new Error(
          `${model.file} : les indices de « ${node} » ne sont pas triviaux, ils restent nécessaires`,
        );
      }
      primitive.setIndices(null);
    }
  }
  // Les données que plus rien n'utilise quittent le fichier.
  for (const accessor of document.getRoot().listAccessors()) {
    if (accessor.listParents().every((parent) => parent.propertyType === PropertyType.ROOT)) {
      accessor.dispose();
    }
  }
}

const number = (n: number) => n.toLocaleString('fr-FR');

async function main() {
  const files = MODEL_FOLDERS.flatMap((folder) =>
    readdirSync(join(root, folder))
      .filter((name) => name.endsWith('.glb'))
      .map((name) => `${folder}/${name}`),
  ).sort();
  const lines = ['fichier | octets avant | octets après | gain | triangles | octets des images'];
  for (const file of files) {
    const model = MODEL_RULES.find((rule) => rule.file === file);
    if (!model) throw new Error(`${file} : pas de règle dans ${RULES_FILE}`);
    const path = join(root, file);
    const original = readFileSync(path);
    const document = await io.readBinary(original);
    const before = stats(document, original.byteLength);
    clean(document, model);
    const output = await io.writeBinary(document);
    // Vérifié sur le fichier tel qu'il sera écrit : mêmes triangles, et images de même poids.
    const after = stats(await io.readBinary(output), output.byteLength);
    if (after.triangles !== before.triangles || after.imageBytes !== before.imageBytes) {
      throw new Error(`${file} : triangles ou images modifiés, fichier laissé tel quel`);
    }
    const changed = !Buffer.from(output).equals(original);
    if (changed) writeFileSync(path, output);
    lines.push(
      [
        file,
        number(before.bytes),
        changed ? number(after.bytes) : 'inchangé',
        number(before.bytes - after.bytes),
        number(after.triangles),
        number(after.imageBytes),
      ].join(' | '),
    );
    if (after.bytes > model.maxBytes) {
      lines.push(`  au-dessus du plafond de ${number(model.maxBytes)} octets (${RULES_FILE})`);
    }
  }
  process.stdout.write(`${lines.join('\n')}\n`);
}

main().catch((error: unknown) => fail(error instanceof Error ? error.message : String(error)));
