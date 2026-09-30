/**
 * Île des Maths en 3D réaliste, façon maquette : le modèle Blender (lumière, ombres douces et
 * occlusion cuites dans une seule texture, tools/explorer-3d/island_maths.py), avec de l'eau
 * animée (π, rivière, cascade), des brins d'herbe qui ondulent au vent et quelques chiffres
 * lumineux qui tombent avec la cascade. Aucune lumière en temps réel : tout est cuit. Les nuages
 * sont à part (Clouds), pour s'afficher pendant le chargement du modèle.
 * Les effets d'image (halo, léger flou de maquette, étalonnage) viennent de Hd2dPost.
 * Repère : x vers la droite, z vers la caméra, y vers le haut ; le plateau est à y = 0.
 */
import { useFrame, useLoader, useThree } from '@react-three/fiber';
import { useEffect, useMemo } from 'react';
import * as THREE from 'three';
import { type GLTF, GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

import { explorerArt } from '@/theme/explorerArt';

import { seeded } from '../hd2d/pixels';
import { grassMaterial } from './grass';
import {
  applyRegionTint,
  disposeRegionTint,
  setRegionLook,
  type RegionLook,
  type RegionTintUniforms,
} from './regionTint';
import { SCENE_TIME } from './time';
import { fallCurve, waterMeshes } from './water';

// eslint-disable-next-line @typescript-eslint/no-require-imports -- asset Metro (identifiant en natif, URL sur le web)
const ISLAND_GLB: string = require('../../../../assets/explorer/models/island-maths-3d.glb');

const ART = explorerArt;
const DIGIT_COUNT = 7;

type Digit = {
  holder: THREE.Group;
  material: THREE.MeshBasicMaterial;
  offset: number;
  lane: number;
};

type World = {
  root: THREE.Group;
  water: THREE.Group;
  /** Matériaux créés pour la scène (île, brins) : libérés avec elle, contrairement au modèle. */
  owned: THREE.Material[];
  digits: Digit[];
  fall: THREE.CatmullRomCurve3;
  /** Instant de la première image, pour l'apparition de l'île. */
  shownAt: number | null;
  /** Teinte des régions (X2a) et son intensité lissée, de 0 (carrousel) à 1 (régions). */
  tint: RegionTintUniforms;
  regionMix: number;
};

/** Sans demande de la vue : pas de teinte, l'île telle qu'elle a été cuite. */
const NO_REGIONS: RegionLook = { mix: 0, focus: null };

/** L'île apparaît en 0,7 s : elle monte un peu en grandissant, puis se pose. */
const APPEAR_SECONDS = 0.7;

type Model = { island: THREE.Mesh; blades: THREE.Mesh; digits: THREE.Mesh[] };

/** Nouvel objet qui partage la géométrie d'une pièce du modèle, à la même place. */
function copyOf(source: THREE.Mesh, material: THREE.Material): THREE.Mesh {
  const mesh = new THREE.Mesh(source.geometry, material);
  mesh.position.copy(source.position);
  mesh.quaternion.copy(source.quaternion);
  mesh.scale.copy(source.scale);
  return mesh;
}

/**
 * Le modèle : l'île cuite (sa texture s'affiche telle quelle, MeshBasic, sans calcul de lumière),
 * les brins d'herbe (animés par le vent) et les dix chiffres de la cascade.
 * Le modèle chargé reste intact : useLoader le garde en cache et le rend à chaque scène qui le
 * demande (atelier, onglet Explorer). Chaque scène crée donc ses propres objets, qui en partagent
 * la géométrie et la texture.
 */
function readModel(gltf: GLTF): Model {
  let island: THREE.Mesh | null = null;
  let blades: THREE.Mesh | null = null;
  const digits: THREE.Mesh[] = [];
  gltf.scene.traverse((object) => {
    if (!(object instanceof THREE.Mesh)) return;
    if (object.name.startsWith('chiffre_')) digits.push(object);
    else if (object.name === 'ile') island = object;
    else if (object.name === 'brins') blades = object;
  });
  if (!island || !blades || digits.length === 0)
    throw new Error('island-maths-3d.glb : île, brins ou chiffres absents');
  const source: THREE.Mesh = island;
  const baked = (source.material as THREE.MeshStandardMaterial).map;
  return {
    island: copyOf(source, new THREE.MeshBasicMaterial({ map: baked })),
    blades: copyOf(blades, grassMaterial()),
    digits,
  };
}

function buildWorld(gltf: GLTF): World {
  const { island, blades, digits: glyphs } = readModel(gltf);
  const root = new THREE.Group();
  const owned = [island.material as THREE.Material, blades.material as THREE.Material];
  island.updateMatrix();
  const tint = applyRegionTint(island.material as THREE.MeshBasicMaterial, island.matrix.clone());
  const water = waterMeshes();
  root.add(island, blades, water);

  // Chiffres de la cascade : chacun dans un support, que l'on place sans toucher à la transformation
  // propre du modèle (quantification des sommets).
  const rand = seeded(8);
  const digits = Array.from({ length: DIGIT_COUNT }, (_, i) => {
    const glyph = glyphs[(i * 7 + 3) % glyphs.length]!;
    const material = new THREE.MeshBasicMaterial({
      color: ART.digit,
      transparent: true,
      fog: false,
    });
    const mesh = copyOf(glyph, material);
    mesh.renderOrder = 4;
    const holder = new THREE.Group();
    holder.add(mesh);
    holder.scale.setScalar(0.75 + rand() * 0.3);
    root.add(holder);
    // Couloirs répartis sur la largeur, dans le désordre : deux chiffres voisins dans le temps
    // ne tombent jamais au même endroit.
    const lane = ((i * 3) % DIGIT_COUNT) / (DIGIT_COUNT - 1) - 0.5;
    return { holder, material, offset: i / DIGIT_COUNT, lane };
  });

  return { root, water, owned, digits, fall: fallCurve(), shownAt: null, tint, regionMix: 0 };
}

/** Libère ce que la scène a créé ; le modèle lui-même reste dans le cache de useLoader. */
function disposeWorld(w: World) {
  w.water.traverse((object) => {
    if (!(object instanceof THREE.Mesh)) return;
    object.geometry.dispose();
    (object.material as THREE.Material).dispose();
  });
  for (const d of w.digits) d.material.dispose();
  for (const material of w.owned) material.dispose();
  disposeRegionTint(w.tint);
}

/** Apparition : de 0 à 1, en douceur ; immédiate si les animations sont réduites. */
function appearance(w: World, t: number, animated: boolean): number {
  if (!animated) return 1;
  w.shownAt ??= t;
  const p = Math.min(1, (t - w.shownAt) / APPEAR_SECONDS);
  return 1 - (1 - p) ** 3;
}

/** Une image : apparition, teinte des régions, flottement, eau, chiffres qui tombent. */
function tickWorld(
  w: World,
  t: number,
  delta: number,
  camera: THREE.Camera,
  animated: boolean,
  regions: RegionLook,
) {
  const shown = appearance(w, t, animated);
  w.root.scale.setScalar(0.85 + 0.15 * shown);
  w.root.position.y = -0.6 * (1 - shown);
  w.regionMix = animated
    ? w.regionMix + (regions.mix - w.regionMix) * (1 - Math.exp(-delta * 5))
    : regions.mix;
  setRegionLook(w.tint, { ...regions, mix: w.regionMix });
  if (animated) {
    SCENE_TIME.value = t;
    // L'île ne flotte plus dans les vues de région : les panneaux posés dessus restent en place.
    w.root.position.y += Math.sin(t * 1.1) * 0.08 * (1 - w.regionMix);
    for (const d of w.digits) {
      const phase = (t * 0.16 + d.offset) % 1;
      // Position à longueur d'arc constante : les chiffres ne s'entassent pas au sommet, où la
      // courbe de la cascade passe le rebord. Ils apparaissent un peu sous le bord, en fondu.
      const p = w.fall.getPointAt(0.1 + phase * 0.75);
      d.holder.position.set(p.x + d.lane * (0.3 + phase * 0.4), p.y, p.z + 0.08);
      d.material.opacity =
        THREE.MathUtils.smoothstep(phase, 0, 0.18) *
        (1 - THREE.MathUtils.smoothstep(phase, 0.5, 1)) *
        0.9;
    }
  }
  for (const d of w.digits) {
    d.holder.rotation.y = Math.atan2(
      camera.position.x - d.holder.position.x,
      camera.position.z - d.holder.position.z,
    );
  }
}

type Props = {
  animated?: boolean;
  /** Teinte, région choisie et brume des régions (X2a) ; aucune par défaut. */
  regions?: RegionLook;
};

export function MathsIsland3D({ animated = true, regions = NO_REGIONS }: Props) {
  const camera = useThree((s) => s.camera);
  const gltf = useLoader(GLTFLoader, ISLAND_GLB);
  const world = useMemo(() => buildWorld(gltf), [gltf]);
  useEffect(() => () => disposeWorld(world), [world]);
  useFrame(({ clock }, delta) =>
    tickWorld(world, clock.elapsedTime, delta, camera, animated, regions),
  );
  return <primitive object={world.root} />;
}
