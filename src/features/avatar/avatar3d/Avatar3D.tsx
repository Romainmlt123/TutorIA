import { useFrame } from '@react-three/fiber';
import { useEffect, useMemo } from 'react';
import * as THREE from 'three';
import type { GLTF } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { clone } from 'three/examples/jsm/utils/SkeletonUtils.js';

import { preloadModel, useModel } from '@/lib/three/useModel';
import { avatarArt } from '@/theme/avatarArt';

import type { AvatarLook } from '../logic/avatarLook';
import { avatarBuild, avatarScale, faceParams } from '../logic/face';
import { type FaceUniforms, faceMaterial, fitFace, setFace } from './faceMaterial';

/*
 * Figurine de l'avatar d'un élève (modèle Blender assets/avatar/avatar.glb, tools/avatar-3d) : une
 * copie du modèle par avatar affiché, qui en partage la géométrie. On n'y montre que les pièces
 * choisies (coiffure, vêtements), colorées d'après le nom de leur matière, et le visage est dessiné
 * sur la tête par faceMaterial. Les matières sont éclairées : la scène doit contenir AvatarLights.
 */

// eslint-disable-next-line @typescript-eslint/no-require-imports -- asset Metro (identifiant en natif, URL sur le web)
const AVATAR_GLB: string = require('../../../../assets/avatar/avatar.glb');

export type AvatarAnimation = 'attente' | 'marche' | 'saut' | 'salut';

type Piece = { name: string; meshes: THREE.Mesh[] };

type Rig = {
  root: THREE.Group;
  mixer: THREE.AnimationMixer;
  actions: Map<string, THREE.AnimationAction>;
  pieces: Piece[];
  face: FaceUniforms;
  /** Matières par rôle : peau, cheveux, vêtements et accessoires, et détails aux couleurs fixes. */
  colors: Record<Role, THREE.MeshLambertMaterial[]>;
  materials: THREE.Material[];
  /** Formes des pièces, par nom : « fort » (carrure), « chapeau » (cheveux tassés sous un couvre-chef),
   * « ecart » et « hauteur » (lunettes qui suivent les yeux). */
  morphs: { mesh: THREE.Mesh; name: string; index: number }[];
  playing: string | null;
};

/** Nom d'une pièce d'après son maillage : three suffixe « _1 », « _2 » les pièces à plusieurs matières. */
const pieceOf = (mesh: THREE.Object3D) => mesh.name.replace(/_\d+$/, '');

type Role =
  | 'skin'
  | 'hair'
  | 'top'
  | 'bottom'
  | 'shoes'
  | 'hat'
  | 'glasses'
  | 'neck'
  | 'back'
  | 'sole'
  | 'detail'
  | 'lens'
  | 'jewel';

/** Préfixe du nom des pièces de chaque emplacement de la tenue (tools/avatar-3d/avatar.py). */
const SLOT_PREFIX = {
  top: 'haut-',
  bottom: 'bas-',
  shoes: 'chaussures-',
  hat: 'tete-',
  glasses: 'visage-',
  neck: 'cou-',
  back: 'dos-',
} as const;

const SLOTS = Object.keys(SLOT_PREFIX) as (keyof typeof SLOT_PREFIX)[];

function roleOf(piece: string, material: string): Role | null {
  if (material === 'peau') return 'skin';
  if (material === 'cheveux') return 'hair';
  if (material === 'semelle') return 'sole';
  if (material === 'detail') return 'detail';
  if (material === 'verre') return 'lens';
  if (material === 'bijou') return 'jewel';
  return SLOTS.find((slot) => piece.startsWith(SLOT_PREFIX[slot])) ?? null;
}

function buildRig(gltf: GLTF): Rig {
  const root = clone(gltf.scene) as THREE.Group;
  const face = faceMaterial();
  const colors: Rig['colors'] = {
    skin: [],
    hair: [],
    top: [],
    bottom: [],
    shoes: [],
    hat: [],
    glasses: [],
    neck: [],
    back: [],
    sole: [],
    detail: [],
    lens: [],
    jewel: [],
  };
  const materials: THREE.Material[] = [face.material];
  const pieces = new Map<string, THREE.Mesh[]>();
  const morphs: Rig['morphs'] = [];
  root.traverse((object) => {
    if (!(object instanceof THREE.Mesh)) return;
    const piece = pieceOf(object);
    for (const [name, index] of Object.entries(object.morphTargetDictionary ?? {})) {
      morphs.push({ mesh: object, name, index });
    }
    const source = object.material as THREE.Material;
    let material: THREE.MeshLambertMaterial;
    if (piece === 'tete') {
      material = face.material;
      fitFace(face.uniforms, object.geometry);
      colors.skin.push(material);
    } else {
      material = new THREE.MeshLambertMaterial();
      materials.push(material);
      const role = roleOf(piece, source.name);
      if (role) colors[role].push(material);
    }
    object.material = material;
    // La figurine bouge : sa boîte englobante de repos ne la suit pas.
    object.frustumCulled = false;
    pieces.set(piece, [...(pieces.get(piece) ?? []), object]);
  });
  const mixer = new THREE.AnimationMixer(root);
  const actions = new Map(gltf.animations.map((clip) => [clip.name, mixer.clipAction(clip)]));
  const saut = actions.get('saut');
  if (saut) {
    saut.setLoop(THREE.LoopOnce, 1);
    saut.clampWhenFinished = true;
  }
  return {
    root,
    mixer,
    actions,
    pieces: [...pieces].map(([name, meshes]) => ({ name, meshes })),
    face: face.uniforms,
    colors,
    materials,
    morphs,
    playing: null,
  };
}

/** Pièces visibles pour une apparence : le corps, la tête, la coiffure, la tenue et les accessoires. */
export function visiblePieces(look: AvatarLook): Set<string> {
  const worn = SLOTS.filter((slot) => look.outfit[slot].item !== 'aucun').map(
    (slot) => `${SLOT_PREFIX[slot]}${look.outfit[slot].item}`,
  );
  return new Set(['corps', 'tete', `cheveux-${look.hair.style}`, ...worn]);
}

function dress(rig: Rig, look: AvatarLook) {
  const shown = visiblePieces(look);
  for (const piece of rig.pieces)
    for (const mesh of piece.meshes) mesh.visible = shown.has(piece.name);
  const paint = (list: THREE.MeshLambertMaterial[], hex: string) => {
    for (const material of list) material.color.set(hex);
  };
  paint(rig.colors.skin, avatarArt.skins[look.skin]!);
  paint(rig.colors.hair, avatarArt.hairs[look.hair.color]!);
  for (const slot of SLOTS) paint(rig.colors[slot], avatarArt.cloths[look.outfit[slot].color]!);
  paint(rig.colors.sole, avatarArt.sole);
  paint(rig.colors.detail, avatarArt.detail);
  paint(rig.colors.lens, avatarArt.lens);
  paint(rig.colors.jewel, avatarArt.jewel);
  setFace(
    rig.face,
    faceParams(look),
    avatarArt.eyes[look.eyes.color]!,
    avatarArt.hairs[look.hair.color]!,
  );
  rig.root.scale.setScalar(avatarScale(look));
  const influence: Record<string, number> = {
    fort: avatarBuild(look),
    chapeau: look.outfit.hat.item === 'aucun' ? 0 : 1,
    ecart: look.eyes.spacing,
    hauteur: look.eyes.height,
  };
  for (const { mesh, name, index } of rig.morphs) {
    if (mesh.morphTargetInfluences) mesh.morphTargetInfluences[index] = influence[name] ?? 0;
  }
}

/** Passe en douceur à une autre animation ; sans animation, la figurine prend sa pose de départ. */
function play(rig: Rig, name: AvatarAnimation, animated: boolean, speed: number) {
  const next = rig.actions.get(name);
  if (!next) return;
  next.timeScale = speed;
  if (rig.playing !== name) {
    const previous = rig.playing ? rig.actions.get(rig.playing) : undefined;
    next.reset().play();
    if (previous && animated) next.crossFadeFrom(previous, 0.25, false);
    else previous?.stop();
    rig.playing = name;
  }
  if (!animated) rig.mixer.setTime(0);
}

function dispose(rig: Rig) {
  rig.mixer.stopAllAction();
  for (const material of rig.materials) material.dispose();
}

type Props = {
  look: AvatarLook;
  animation?: AvatarAnimation;
  /** Faux si « Réduire les animations » est actif : la figurine reste immobile. */
  animated?: boolean;
  position?: readonly [number, number, number];
  /** Rotation autour de la verticale (radians) ; 0 : de face. */
  turn?: number;
  /** Vitesse de lecture de l'animation (1 : normale) : une marche plus rapide sur la carte. */
  speed?: number;
};

export function Avatar3D(props: Props) {
  const gltf = useModel(AVATAR_GLB);
  return gltf ? <LoadedAvatar gltf={gltf} {...props} /> : null;
}

function LoadedAvatar({
  gltf,
  look,
  animation = 'attente',
  animated = true,
  position = [0, 0, 0],
  turn = 0,
  speed = 1,
}: Props & { gltf: GLTF }) {
  const rig = useMemo(() => buildRig(gltf), [gltf]);
  useEffect(() => () => dispose(rig), [rig]);
  useEffect(() => dress(rig, look), [rig, look]);
  useEffect(() => play(rig, animation, animated, speed), [rig, animation, animated, speed]);
  useFrame((_, delta) => {
    if (animated) rig.mixer.update(Math.min(delta, 0.1));
  });
  return (
    <group position={position as [number, number, number]} rotation={[0, turn, 0]}>
      <primitive object={rig.root} />
    </group>
  );
}

/**
 * Lumière des scènes où paraissent des avatars : ciel et sol clairs (la figurine reste lisible
 * jusque sous le menton, quelle que soit sa peau), soleil de face en haut à gauche comme la cuisson
 * des îles, et une lumière d'appoint de face à droite.
 */
export function AvatarLights() {
  return (
    <>
      <hemisphereLight args={[avatarArt.light.sky, avatarArt.light.ground, 2.2]} />
      <directionalLight position={[-3.5, 4.5, 3]} intensity={1.7} color={avatarArt.light.sun} />
      <directionalLight position={[3, 1, 4]} intensity={0.7} color={avatarArt.light.fill} />
    </>
  );
}

/** Commence à charger la figurine avant d'en avoir besoin. */
export function preloadAvatar() {
  preloadModel(AVATAR_GLB);
}
