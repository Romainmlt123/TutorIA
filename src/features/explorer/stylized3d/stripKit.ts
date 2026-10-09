import * as THREE from 'three';
import type { GLTF } from 'three/examples/jsm/loaders/GLTFLoader.js';

import { seeded } from '../hd2d/pixels';
import type { Decor, DecorKind, Tuft } from '../logic/terrainLayout';

/*
 * Kit de décor des cartes de région (modèle Blender strip-kit.glb, tools/explorer-3d/strip_kit.py) :
 * rochers, galets, touffes de fleurs, barrière, chacun avec sa texture cuite. Ici, tout ce qui
 * ne dépend que du kit : on lit ses pièces, on instancie les décors, on sème les brins d'herbe.
 * Les matériaux sont créés ici : le modèle chargé reste intact dans le cache de useModel.
 */

export type Kit = { decor: Record<DecorKind, THREE.Mesh> };

const DECOR_KINDS: readonly DecorKind[] = [
  'rocher-a',
  'rocher-b',
  'cailloux',
  'fleurs',
  'fleurs-b',
  'barriere',
];

export function readKit(gltf: GLTF): Kit {
  const meshes = new Map<string, THREE.Mesh>();
  gltf.scene.traverse((object) => {
    if (object instanceof THREE.Mesh) meshes.set(object.name, object);
  });
  const need = (name: string): THREE.Mesh => {
    const mesh = meshes.get(name);
    if (!mesh) throw new Error(`strip-kit.glb : pièce « ${name} » absente`);
    return mesh;
  };
  const decor = {} as Record<DecorKind, THREE.Mesh>;
  for (const kind of DECOR_KINDS) decor[kind] = need(kind);
  return { decor };
}

/** Matériau sans lumière qui affiche la texture cuite d'une pièce du modèle. */
export function bakedMaterial(piece: THREE.Mesh): THREE.MeshBasicMaterial {
  const map = (piece.material as THREE.MeshStandardMaterial).map;
  return new THREE.MeshBasicMaterial({ map });
}

/** Un mesh instancié par sorte de décor, à la place et à l'échelle que le plan donne. */
export function decorMeshes(
  kit: Kit,
  plan: readonly Decor[],
): { meshes: THREE.InstancedMesh[]; materials: THREE.Material[] } {
  const meshes: THREE.InstancedMesh[] = [];
  const materials: THREE.Material[] = [];
  const matrix = new THREE.Matrix4();
  const place = new THREE.Matrix4();
  const euler = new THREE.Euler();
  for (const kind of DECOR_KINDS) {
    const own = plan.filter((d) => d.kind === kind);
    if (own.length === 0) continue;
    const piece = kit.decor[kind];
    piece.updateMatrix();
    const material = bakedMaterial(piece);
    materials.push(material);
    const mesh = new THREE.InstancedMesh(piece.geometry, material, own.length);
    own.forEach((d, i) => {
      euler.set(0, d.yaw, 0);
      place.compose(
        new THREE.Vector3(d.x, 0, d.z),
        new THREE.Quaternion().setFromEuler(euler),
        new THREE.Vector3(d.scale, d.scale, d.scale),
      );
      mesh.setMatrixAt(i, matrix.multiplyMatrices(place, piece.matrix));
    });
    mesh.instanceMatrix.needsUpdate = true;
    // Une boîte englobante fausse ferait disparaître les arbres en bord d'écran.
    mesh.frustumCulled = false;
    meshes.push(mesh);
  }
  return { meshes, materials };
}

/**
 * Touffes d'herbe (v = hauteur du brin, de 0 au pied à 1 à la pointe), comme celles de l'île : le
 * matériau de grass.ts les fait onduler au vent.
 */
export function tuftsGeometry(tufts: readonly Tuft[], seed: number): THREE.BufferGeometry {
  const random = seeded(seed);
  const positions: number[] = [];
  const uvs: number[] = [];
  for (const tuft of tufts) {
    const blades = tuft.tall ? 5 + Math.floor(random() * 5) : 4 + Math.floor(random() * 5);
    for (let b = 0; b < blades; b++) {
      const bx = tuft.x + (random() - 0.5) * 0.06;
      const bz = tuft.z + (random() - 0.5) * 0.06;
      const yaw = random() * Math.PI * 2;
      const lean = tuft.tall ? 0.1 + random() * 0.3 : 0.15 + random() * 0.4;
      const height = tuft.tall ? 0.11 + random() * 0.09 : 0.07 + random() * 0.08;
      const width = 0.008 + random() * 0.006;
      const dx = Math.cos(yaw);
      const dz = Math.sin(yaw);
      positions.push(
        bx - dz * width,
        0,
        bz + dx * width,
        bx + dz * width,
        0,
        bz - dx * width,
        bx + dx * Math.sin(lean) * height,
        Math.cos(lean) * height,
        bz + dz * Math.sin(lean) * height,
      );
      uvs.push(0, 0, 1, 0, 0.5, 1);
    }
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  return geometry;
}
