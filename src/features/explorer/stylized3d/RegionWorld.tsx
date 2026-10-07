import { useEffect, useMemo } from 'react';
import * as THREE from 'three';
import type { GLTF } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';

import { preloadAvatar } from '@/features/avatar/avatar3d/Avatar3D';
import { preloadModel, useModel } from '@/lib/three/useModel';
import { explorerArt } from '@/theme/explorerArt';

import type { RegionMap } from '../logic/regionMap';
import {
  bladeAllowed,
  clearingDressing,
  decorPlan,
  grassTufts,
  landDiscs,
  placedDecor,
  type Decor,
  type DecorEntry,
} from '../logic/terrainLayout';
import { grassMaterial } from './grass';
import { MapAvatar, type AvatarOnMap } from './MapAvatar';
import { groundShadows, type ShadowSpot } from './groundShadows';
import { levelNodes } from './levelNodes';
import { pathGeometry, pathMaterial } from './mapPath';
import { MONUMENT_MODELS } from './monuments';
import regionDecor from './regionDecor.json';
import { bakedMaterial, decorMeshes, readKit, tuftsGeometry } from './stripKit';
import { TERRAIN_MODELS, type Terrain } from './terrains';
import { waterMeshes } from './water';

// eslint-disable-next-line @typescript-eslint/no-require-imports -- asset Metro (identifiant en natif, URL sur le web)
const STRIP_KIT_GLB: string = require('../../../../assets/explorer/models/strip-kit.glb');

/*
 * Carte d'une région (X2b), vue de haut. Pour une région cuite (terrains.ts) : son terrain Blender
 * (la région de l'île agrandie, avec ses repères et l'eau animée), et les décors du kit posés aux
 * emplacements choisis par Blender (regionDecor.json). Sinon, une maquette simple (disques de terre)
 * avec des décors semés par l'app. Par-dessus : le chemin pavé, un point par niveau (vert pour une
 * leçon, bleu pour des exercices, rouge et plus grand pour une évaluation, gris s'il est fermé), le
 * pion et, au centre de chaque ville, son monument (ou un village générique). Repère : x vers la
 * droite, z vers la caméra, y en haut, en mètres ; la terre est à y = 0.
 */

const ART = explorerArt.map;
const DECOR_ENTRIES = regionDecor as unknown as Readonly<Record<string, readonly DecorEntry[]>>;

/** Épaisseur de l'île sous le sol. */
const LAND_DEPTH = 0.9;

/**
 * L'île en maquette simple : des disques de terre (un par clairière, et un tous les 0,5 m le long
 * du chemin), en deux pièces : les dessus d'herbe et les falaises, d'où le bord festonné.
 */
function landGeometries(map: RegionMap): {
  top: THREE.BufferGeometry;
  cliff: THREE.BufferGeometry;
} {
  const tops: THREE.BufferGeometry[] = [];
  const cliffs: THREE.BufferGeometry[] = [];
  for (const disc of landDiscs(map)) {
    const top = new THREE.CircleGeometry(disc.radius, 24);
    top.rotateX(-Math.PI / 2);
    top.translate(disc.x, 0, disc.z);
    tops.push(top);
    const cliff = new THREE.CylinderGeometry(disc.radius, disc.radius, LAND_DEPTH, 24, 1, true);
    cliff.translate(disc.x, -LAND_DEPTH / 2, disc.z);
    cliffs.push(cliff);
  }
  const top = mergeGeometries(tops);
  const cliff = mergeGeometries(cliffs);
  tops.forEach((g) => g.dispose());
  cliffs.forEach((g) => g.dispose());
  if (!top || !cliff) throw new Error('île de la carte : fusion des disques impossible');
  return { top, cliff };
}

/** Village générique, à la place du monument de la ville : trois maisons à toit pointu. */
function village(x: number, z: number, roof: string): THREE.Group {
  const group = new THREE.Group();
  const wall = new THREE.MeshBasicMaterial({ color: ART.village.wall });
  const roofMaterial = new THREE.MeshBasicMaterial({ color: roof });
  const houses: [number, number, number, number][] = [
    [-0.32, 0.12, 0.42, 0.5],
    [0.08, -0.05, 0.5, 0.64],
    [0.42, 0.14, 0.36, 0.42],
  ];
  for (const [dx, dz, width, height] of houses) {
    const body = new THREE.Mesh(new THREE.BoxGeometry(width, height, width), wall);
    body.position.set(dx, height / 2, dz);
    const top = new THREE.Mesh(
      new THREE.ConeGeometry(width * 0.78, height * 0.55, 4),
      roofMaterial,
    );
    top.position.set(dx, height + height * 0.27, dz);
    top.rotation.y = Math.PI / 4;
    group.add(body, top);
  }
  group.position.set(x, 0, z);
  return group;
}

type Built = {
  root: THREE.Group;
  geometries: THREE.BufferGeometry[];
  materials: THREE.Material[];
};

/** Chemin, points de niveau, villages génériques et (sans terrain cuit) la terre en maquette simple. */
function buildBase(
  map: RegionMap,
  regionColor: string,
  modeled: ReadonlySet<string>,
  baked: boolean,
): Built {
  const root = new THREE.Group();
  const geometries: THREE.BufferGeometry[] = [];
  const materials: THREE.Material[] = [];
  if (!baked) {
    const terrain = landGeometries(map);
    const grass = new THREE.MeshBasicMaterial({ color: ART.land });
    const cliff = new THREE.MeshBasicMaterial({ color: ART.cliff, side: THREE.DoubleSide });
    geometries.push(terrain.top, terrain.cliff);
    materials.push(grass, cliff);
    root.add(new THREE.Mesh(terrain.top, grass), new THREE.Mesh(terrain.cliff, cliff));
  }
  const ribbon = pathGeometry(map.path, map.pawnIndex);
  const paving = pathMaterial();
  geometries.push(ribbon);
  materials.push(paving);
  const path = new THREE.Mesh(ribbon, paving);
  path.renderOrder = 2;
  root.add(path);
  for (const mesh of levelNodes(map.nodes, map.pawnIndex)) {
    geometries.push(mesh.geometry);
    materials.push(mesh.material as THREE.Material);
    root.add(mesh);
  }
  for (const city of map.cities) {
    if (modeled.has(city.monument)) continue;
    root.add(village(city.center.x, city.center.z, regionColor));
  }
  root.traverse((object) => {
    if (object instanceof THREE.Mesh && !geometries.includes(object.geometry)) {
      geometries.push(object.geometry);
      if (!materials.includes(object.material as THREE.Material)) {
        materials.push(object.material as THREE.Material);
      }
    }
  });
  return { root, geometries, materials };
}

/** Graine des décors : toujours la même pour une région, différente d'une région à l'autre. */
function seedOf(regionId: string): number {
  let hash = 7;
  for (const char of regionId) hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  return hash;
}

type Layer = {
  root: THREE.Group;
  geometries: THREE.BufferGeometry[];
  materials: THREE.Material[];
};

function disposeLayer(layer: Layer) {
  layer.geometries.forEach((g) => g.dispose());
  layer.materials.forEach((m) => m.dispose());
}

/** Rayon et hauteur de l'ombre d'un décor, à l'échelle 1 (les fleurs et la barrière n'en ont pas). */
const DECOR_SHADOW: Partial<Record<Decor['kind'], { radius: number; height: number }>> = {
  'rocher-a': { radius: 0.28, height: 0.2 },
  'rocher-b': { radius: 0.32, height: 0.2 },
  cailloux: { radius: 0.18, height: 0.05 },
};

/** Décors du kit, avec leur ombre au sol ; et, en maquette simple, les brins d'herbe semés par l'app. */
function buildDecor(gltf: GLTF, map: RegionMap, baked: boolean): Layer {
  const kit = readKit(gltf);
  const root = new THREE.Group();
  const geometries: THREE.BufferGeometry[] = [];
  const materials: THREE.Material[] = [];
  const seed = seedOf(map.regionId);
  // Les clairières autour des monuments reçoivent aussi leur herbe, leurs fleurs et leurs galets.
  const clearings = clearingDressing(map, seed + 3);
  const plan = [
    ...(baked ? placedDecor(map, DECOR_ENTRIES[map.regionId] ?? []) : decorPlan(map, seed)),
    ...clearings.decor,
  ];
  const decor = decorMeshes(kit, plan);
  materials.push(...decor.materials);
  root.add(...decor.meshes);
  const spots: ShadowSpot[] = plan.flatMap((d) => {
    const shadow = DECOR_SHADOW[d.kind];
    return shadow
      ? [{ x: d.x, z: d.z, radius: shadow.radius * d.scale, height: shadow.height * d.scale }]
      : [];
  });
  const shadows = groundShadows(spots);
  geometries.push(shadows.geometry);
  materials.push(shadows.material as THREE.Material);
  root.add(shadows);
  {
    const sown = baked ? clearings.tufts : [...grassTufts(map, plan, seed + 1), ...clearings.tufts];
    const tufts = tuftsGeometry(sown, seed + 2);
    const blades = grassMaterial();
    geometries.push(tufts);
    materials.push(blades);
    const bladeMesh = new THREE.Mesh(tufts, blades);
    bladeMesh.frustumCulled = false;
    root.add(bladeMesh);
  }
  return { root, geometries, materials };
}

function RegionDecor(props: { map: RegionMap; baked: boolean }) {
  const gltf = useModel(STRIP_KIT_GLB);
  return gltf ? <LoadedDecor gltf={gltf} {...props} /> : null;
}

function LoadedDecor({ gltf, map, baked }: { gltf: GLTF; map: RegionMap; baked: boolean }) {
  const layer = useMemo(() => buildDecor(gltf, map, baked), [gltf, map, baked]);
  useEffect(() => () => disposeLayer(layer), [layer]);
  return <primitive object={layer.root} />;
}

/** Copie d'une pièce du modèle, à sa place : le modèle chargé reste intact dans le cache. */
function copyOf(source: THREE.Mesh, material: THREE.Material): THREE.Mesh {
  const mesh = new THREE.Mesh(source.geometry, material);
  mesh.position.copy(source.position);
  mesh.quaternion.copy(source.quaternion);
  mesh.scale.copy(source.scale);
  return mesh;
}

/** Un monument au centre de chaque ville, posé dans l'herbe avec son ombre. */
function buildMonuments(gltf: GLTF, map: RegionMap): Layer {
  const pieces = new Map<string, THREE.Mesh>();
  gltf.scene.traverse((object) => {
    if (object instanceof THREE.Mesh) pieces.set(object.name, object);
  });
  const root = new THREE.Group();
  const materials: THREE.Material[] = [];
  const geometries: THREE.BufferGeometry[] = [];
  for (const city of map.cities) {
    const piece = pieces.get(city.monument);
    if (!piece) throw new Error(`monument « ${city.monument} » absent du modèle de la région`);
    const material = bakedMaterial(piece);
    materials.push(material);
    const holder = new THREE.Group();
    holder.position.set(city.center.x, 0, city.center.z);
    holder.add(copyOf(piece, material));
    root.add(holder);
  }
  const shadows = groundShadows(
    map.cities.map((c) => ({ x: c.center.x, z: c.center.z, radius: 0.75, height: 1.1 })),
  );
  geometries.push(shadows.geometry);
  materials.push(shadows.material as THREE.Material);
  root.add(shadows);
  return { root, materials, geometries };
}

function RegionMonuments({ map, asset }: { map: RegionMap; asset: string }) {
  const gltf = useModel(asset);
  return gltf ? <LoadedMonuments gltf={gltf} map={map} /> : null;
}

function LoadedMonuments({ gltf, map }: { gltf: GLTF; map: RegionMap }) {
  const layer = useMemo(() => buildMonuments(gltf, map), [gltf, map]);
  useEffect(() => () => disposeLayer(layer), [layer]);
  return <primitive object={layer.root} />;
}

/**
 * Brins d'herbe du terrain cuit, sans ceux qui pousseraient sur le chemin, sous un point de niveau
 * ou un monument : Blender ne connaît le chemin qu'à peu près. Chaque brin est un triangle.
 */
function bladesGeometry(source: THREE.Mesh, map: RegionMap): THREE.BufferGeometry {
  source.updateMatrix();
  const allowed = bladeAllowed(map);
  const position = source.geometry.getAttribute('position');
  const uv = source.geometry.getAttribute('uv');
  const index = source.geometry.getIndex();
  const count = index ? index.count : position.count;
  const positions: number[] = [];
  const uvs: number[] = [];
  const corner = new THREE.Vector3();
  for (let t = 0; t < count; t += 3) {
    const ids = [0, 1, 2].map((k) => (index ? index.getX(t + k) : t + k));
    corner.fromBufferAttribute(position, ids[0]!).applyMatrix4(source.matrix);
    if (!allowed(corner.x, corner.z)) continue;
    for (const id of ids) {
      corner.fromBufferAttribute(position, id).applyMatrix4(source.matrix);
      positions.push(corner.x, corner.y, corner.z);
      uvs.push(uv.getX(id), uv.getY(id));
    }
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  return geometry;
}

/** Le terrain cuit (sol, repères), ses brins d'herbe qui ondulent et l'eau animée, agrandis comme la région. */
function buildTerrain(gltf: GLTF, terrain: Terrain, map: RegionMap): Layer {
  const pieces = new Map<string, THREE.Mesh>();
  gltf.scene.traverse((object) => {
    if (object instanceof THREE.Mesh) pieces.set(object.name, object);
  });
  const ground = pieces.get('region');
  const blades = pieces.get('brins');
  if (!ground || !blades) throw new Error('terrain de région : « region » ou « brins » absent');
  const root = new THREE.Group();
  const materials: THREE.Material[] = [];
  const geometries: THREE.BufferGeometry[] = [];
  for (const piece of [ground, pieces.get('reperes')]) {
    if (!piece) continue;
    const material = bakedMaterial(piece);
    materials.push(material);
    const mesh = copyOf(piece, material);
    mesh.frustumCulled = false;
    root.add(mesh);
  }
  const grass = grassMaterial();
  const tufts = bladesGeometry(blades, map);
  materials.push(grass);
  geometries.push(tufts);
  const bladeMesh = new THREE.Mesh(tufts, grass);
  bladeMesh.frustumCulled = false;
  root.add(bladeMesh);
  // L'eau est celle de l'île, agrandie avec le reste : le terrain a la rive peinte au même endroit.
  const water = waterMeshes(terrain.scale);
  water.traverse((object) => {
    if (!(object instanceof THREE.Mesh)) return;
    geometries.push(object.geometry);
    materials.push(object.material as THREE.Material);
  });
  root.add(water);
  return { root, geometries, materials };
}

function RegionTerrain({ terrain, map }: { terrain: Terrain; map: RegionMap }) {
  const gltf = useModel(terrain.asset);
  return gltf ? <LoadedTerrain gltf={gltf} terrain={terrain} map={map} /> : null;
}

function LoadedTerrain({ gltf, terrain, map }: { gltf: GLTF; terrain: Terrain; map: RegionMap }) {
  const layer = useMemo(() => buildTerrain(gltf, terrain, map), [gltf, terrain, map]);
  useEffect(() => () => disposeLayer(layer), [layer]);
  return <primitive object={layer.root} />;
}

/**
 * Commence à charger les modèles d'une région (terrain, décors, monuments) avant d'y entrer : appelé
 * dès que l'élève la choisit, le chargement avance pendant le plongeon de la caméra.
 */
export function preloadRegion(regionId: string) {
  const assets = [STRIP_KIT_GLB, TERRAIN_MODELS[regionId]?.asset, MONUMENT_MODELS[regionId]];
  for (const asset of assets) if (asset) preloadModel(asset);
  preloadAvatar();
}

type Props = {
  map: RegionMap;
  regionColor: string;
  animated: boolean;
  /** Avatar de l'élève, qui tient lieu de pion (null tant que son apparence n'est pas lue). */
  avatar: AvatarOnMap | null;
};

export function RegionWorld({ map, regionColor, animated, avatar }: Props) {
  const monumentModel = MONUMENT_MODELS[map.regionId];
  const modeled = useMemo(
    () => new Set(monumentModel ? map.cities.map((c) => c.monument) : []),
    [map.cities, monumentModel],
  );
  const terrain = TERRAIN_MODELS[map.regionId];
  const built = useMemo(
    () => buildBase(map, regionColor, modeled, terrain !== undefined),
    [map, regionColor, modeled, terrain],
  );
  useEffect(
    () => () => {
      built.geometries.forEach((g) => g.dispose());
      built.materials.forEach((m) => m.dispose());
    },
    [built],
  );
  return (
    <>
      <primitive object={built.root} />
      {avatar ? <MapAvatar map={map} avatar={avatar} animated={animated} /> : null}
      {terrain ? <RegionTerrain terrain={terrain} map={map} /> : null}
      <RegionDecor map={map} baked={terrain !== undefined} />
      {monumentModel ? <RegionMonuments map={map} asset={monumentModel} /> : null}
    </>
  );
}
