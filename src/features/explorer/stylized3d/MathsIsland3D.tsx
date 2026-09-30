/**
 * Île des Maths en 3D réaliste, façon maquette : le modèle Blender (lumière, ombres douces et
 * occlusion cuites dans une seule texture, tools/explorer-3d/island_maths.py), avec de l'eau
 * animée (π, rivière, cascade), des brins d'herbe qui ondulent au vent, quelques chiffres
 * lumineux qui tombent avec la cascade et des nuages vaporeux. Aucune lumière en temps réel :
 * tout est cuit.
 * Les effets d'image (halo, léger flou de maquette, étalonnage) viennent de Hd2dPost.
 * Repère : x vers la droite, z vers la caméra, y vers le haut ; le plateau est à y = 0.
 */
import { useFrame, useLoader, useThree } from '@react-three/fiber';
import { useMemo } from 'react';
import * as THREE from 'three';
import { type GLTF, GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

import { explorerArt } from '@/theme/explorerArt';

import { seeded } from '../hd2d/pixels';
import { grassMaterial } from './grass';
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
  digits: Digit[];
  fall: THREE.CatmullRomCurve3;
  clouds: THREE.Group[];
  puffs: THREE.Mesh[];
};

type Model = { island: THREE.Mesh; blades: THREE.Mesh; digits: THREE.Mesh[] };

/**
 * Le modèle : l'île cuite (sa texture s'affiche telle quelle, MeshBasic, sans calcul de lumière),
 * les brins d'herbe (animés par le vent) et les dix chiffres de la cascade.
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
  const mesh: THREE.Mesh = island;
  const baked = mesh.material as THREE.MeshStandardMaterial;
  mesh.material = new THREE.MeshBasicMaterial({ map: baked.map });
  baked.dispose();
  const grass: THREE.Mesh = blades;
  (grass.material as THREE.Material).dispose();
  grass.material = grassMaterial();
  return { island: mesh, blades: grass, digits };
}

/**
 * Bouffée de nuage : un plan face à la caméra, dont la forme vient d'un bruit fractal (bords
 * doux et irréguliers), éclairé par le haut et un peu bleuté dessous, qui se déforme lentement.
 */
function puffMaterial(): THREE.ShaderMaterial {
  return new THREE.ShaderMaterial({
    uniforms: {
      uTime: SCENE_TIME,
      uTop: { value: new THREE.Color(ART.cloud.top) },
      uBottom: { value: new THREE.Color(ART.cloud.bottom) },
    },
    vertexShader: /* glsl */ `
      varying vec2 vUv;
      varying vec2 vSeed;
      void main() {
        vUv = uv;
        vSeed = modelMatrix[3].xy * 1.7;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }`,
    fragmentShader: /* glsl */ `
      uniform float uTime;
      uniform vec3 uTop;
      uniform vec3 uBottom;
      varying vec2 vUv;
      varying vec2 vSeed;
      float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
      float noise(vec2 p) {
        vec2 i = floor(p), f = fract(p);
        vec2 u = f * f * (3.0 - 2.0 * f);
        return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
                   mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
      }
      float fbm(vec2 p) {
        float sum = 0.0, amplitude = 0.5;
        for (int i = 0; i < 4; i++) { sum += noise(p) * amplitude; p *= 2.03; amplitude *= 0.5; }
        return sum;
      }
      void main() {
        vec2 c = (vUv - 0.5) * vec2(1.0, 1.35);
        float n = fbm(vUv * 3.2 + vSeed + uTime * 0.015);
        float density = smoothstep(0.5, 0.12, length(c) + (n - 0.5) * 0.42);
        if (density < 0.01) discard;
        float lit = smoothstep(0.15, 0.8, vUv.y + (n - 0.5) * 0.5);
        gl_FragColor = vec4(mix(uBottom, uTop, lit), density * 0.94);
        #include <colorspace_fragment>
      }`,
    transparent: true,
    depthWrite: false,
    fog: false,
  });
}

/** Nuage : quelques bouffées de tailles variées, serrées autour d'une grosse bouffée centrale. */
function cloud(seed: number): THREE.Group {
  const rand = seeded(seed);
  const group = new THREE.Group();
  const material = puffMaterial();
  for (let i = 0; i < 5; i++) {
    const size = i === 0 ? 2.4 : 1.3 + rand() * 0.7;
    const puff = new THREE.Mesh(new THREE.PlaneGeometry(size, size), material);
    const side = i === 0 ? 0 : (i % 2 === 0 ? 1 : -1) * (0.55 + rand() * 0.5);
    puff.position.set(side, (rand() - 0.4) * 0.35 - Math.abs(side) * 0.2, (rand() - 0.5) * 0.4);
    group.add(puff);
  }
  return group;
}

function buildWorld(gltf: GLTF): World {
  const { island, blades, digits: glyphs } = readModel(gltf);
  const root = new THREE.Group();
  root.add(island, blades, waterMeshes());

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
    const mesh = new THREE.Mesh(glyph.geometry, material);
    mesh.position.copy(glyph.position);
    mesh.quaternion.copy(glyph.quaternion);
    mesh.scale.copy(glyph.scale);
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

  const clouds = [
    { x: -4.6, y: 1.9, z: -3.8, s: 1.1 },
    { x: 4.3, y: 2.8, z: -5.2, s: 1.4 },
    { x: 4.0, y: -2.4, z: 1.2, s: 0.85 },
    { x: -4.3, y: -3.4, z: 0.6, s: 0.75 },
  ].map((c, i) => {
    const group = cloud(i + 3);
    group.position.set(c.x, c.y, c.z);
    group.scale.setScalar(c.s);
    root.add(group);
    return group;
  });
  const puffs = clouds.flatMap((c) => c.children.filter((o) => o instanceof THREE.Mesh));
  return { root, digits, fall: fallCurve(), clouds, puffs };
}

/** Une image : flottement, eau, chiffres qui tombent, nuages. */
function tickWorld(w: World, t: number, delta: number, camera: THREE.Camera, animated: boolean) {
  if (animated) {
    SCENE_TIME.value = t;
    w.root.position.y = Math.sin(t * 1.1) * 0.08;
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
    w.clouds.forEach((c, i) => {
      c.position.x += delta * (0.07 + i * 0.03);
      if (c.position.x > 6.5) c.position.x = -6.5;
    });
  }
  for (const d of w.digits) {
    d.holder.rotation.y = Math.atan2(
      camera.position.x - d.holder.position.x,
      camera.position.z - d.holder.position.z,
    );
  }
  // Nuages : chaque bouffée reste face à la caméra.
  for (const puff of w.puffs) puff.quaternion.copy(camera.quaternion);
}

export function MathsIsland3D({ animated = true }: { animated?: boolean }) {
  const camera = useThree((s) => s.camera);
  const gltf = useLoader(GLTFLoader, ISLAND_GLB);
  const world = useMemo(() => buildWorld(gltf), [gltf]);
  useFrame(({ clock }, delta) => {
    tickWorld(world, clock.elapsedTime, delta, camera, animated);
  });
  return <primitive object={world.root} />;
}
