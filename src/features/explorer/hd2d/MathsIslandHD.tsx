/**
 * Île des Maths en HD-2D : décor 3D habillé de pixel art (herbe, falaise, motte de terre), sprites
 * des objets de la matière tournés vers la caméra, eau pixelisée animée (π, rivière, cascade),
 * cristaux lumineux, rayons de soleil, poussière lumineuse, îles lointaines dans la brume.
 * Les effets d'image (halo, flou de maquette, étalonnage) sont dans Hd2dPost.
 * Repère : x vers la droite, z vers la caméra, y vers le haut ; le plateau est à y = 0.
 */
import { useFrame, useThree } from '@react-three/fiber';
import { useMemo } from 'react';
import * as THREE from 'three';

import { explorerArt } from '@/theme/explorerArt';

import { seeded } from './pixels';
import {
  abacusSprite,
  cloudSprite,
  compassSprite,
  craneSprite,
  diceSprite,
  digitSprite,
  piSprite,
  protractorSprite,
  pyramidSprite,
  roundTree,
  signTree,
  type Sprite,
} from './sprites';
import { spriteMesh, toTexture } from './threeKit';
import { cliffTile, grassTile, rockTile, rootBallTile } from './tiles';

const ART = explorerArt;
const WATER = ART.ramps.water;
const R = 3.2;
const CLIFF = 1.5;

function edge(a: number): number {
  return (
    R *
    (1 + 0.06 * Math.sin(5 * a + 0.7) + 0.04 * Math.sin(8 * a + 2.1) + 0.03 * Math.sin(2 * a + 4.4))
  );
}

const SIDES = 96;
const outline = Array.from({ length: SIDES }, (_, i) => {
  const a = (i / SIDES) * Math.PI * 2;
  return new THREE.Vector2(Math.cos(a) * edge(a), Math.sin(a) * edge(a));
});

/** Horloge commune à l'eau et aux rayons : un seul uniforme partagé. */
const WATER_TIME = { value: 0 };

/** Eau en pixel art : tons quantifiés au pixel du monde, vaguelettes et éclats qui scintillent. */
function waterMaterial(flow: 'flat' | 'fall'): THREE.ShaderMaterial {
  return new THREE.ShaderMaterial({
    uniforms: {
      uTime: WATER_TIME,
      uDeep: { value: new THREE.Color(WATER[2]) },
      uMid: { value: new THREE.Color(WATER[3]) },
      uLight: { value: new THREE.Color(WATER[4]) },
      uFoam: { value: new THREE.Color(WATER[5]) },
      uFall: { value: flow === 'fall' ? 1 : 0 },
    },
    vertexShader: /* glsl */ `
      varying vec3 vWorld;
      void main() {
        vec4 w = modelMatrix * vec4(position, 1.0);
        vWorld = w.xyz;
        gl_Position = projectionMatrix * viewMatrix * w;
      }`,
    fragmentShader: /* glsl */ `
      uniform float uTime;
      uniform vec3 uDeep;
      uniform vec3 uMid;
      uniform vec3 uLight;
      uniform vec3 uFoam;
      uniform float uFall;
      varying vec3 vWorld;
      float hash(vec2 p) { return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }
      void main() {
        vec3 color;
        if (uFall > 0.5) {
          // Cascade : colonnes de pixels qui descendent, écume en haut et en bas.
          vec2 px = floor(vec2((vWorld.x - vWorld.z) * 32.0, vWorld.y * 32.0));
          float stream = fract(px.y * 0.09 + floor(uTime * 18.0) * 0.09 + hash(vec2(px.x, 0.0)) * 3.0);
          color = mix(uMid, uLight, step(0.72, stream));
          color = mix(color, uDeep, step(0.93, hash(vec2(px.x, 1.0))) * 0.6);
          color = mix(color, uFoam, step(0.9, stream));
        } else {
          vec2 px = floor(vWorld.xz * 32.0);
          float ripple = step(0.8, fract((px.x * 0.13 + px.y * 0.21) + sin(px.y * 0.35 + uTime * 1.6) * 0.18));
          color = mix(uMid, uDeep, step(0.55, fract(px.x * 0.05 + px.y * 0.08)) * 0.4);
          color = mix(color, uLight, ripple);
          color = mix(color, uFoam, step(0.975, hash(px + floor(uTime * 4.0))));
        }
        gl_FragColor = vec4(color, 1.0);
        #include <colorspace_fragment>
      }`,
    side: THREE.DoubleSide,
  });
}

function plateau(grass: THREE.Texture): THREE.Mesh {
  const geometry = new THREE.ShapeGeometry(
    new THREE.Shape(outline.map((p) => new THREE.Vector2(p.x, -p.y))),
    1,
  );
  geometry.rotateX(-Math.PI / 2);
  const uv = geometry.getAttribute('uv') as THREE.BufferAttribute;
  const pos = geometry.getAttribute('position') as THREE.BufferAttribute;
  for (let i = 0; i < pos.count; i++) uv.setXY(i, pos.getX(i) / 2, pos.getZ(i) / 2);
  const mesh = new THREE.Mesh(geometry, new THREE.MeshLambertMaterial({ map: grass }));
  mesh.receiveShadow = true;
  return mesh;
}

/**
 * Anneaux successifs (rayon relatif, hauteur) reliés en bande texturée : la tuile se répète le
 * long du bord (une tuile tous les 2 m) et sur la hauteur (une tuile tous les `tileHeight` m).
 */
function ringBand(
  rings: readonly { scale: number; y: number; wobble?: number }[],
  texture: THREE.Texture,
  tileHeight: number,
  seed: number,
): THREE.Mesh {
  const rand = seeded(seed);
  const jitter = rings.map((r) =>
    Array.from({ length: SIDES }, () => 1 + (rand() - 0.5) * (r.wobble ?? 0)),
  );
  const positions: number[] = [];
  const uvs: number[] = [];
  for (let k = 0; k + 1 < rings.length; k++) {
    const top = rings[k]!;
    const bottom = rings[k + 1]!;
    let length = 0;
    for (let i = 0; i < SIDES; i++) {
      const j = (i + 1) % SIDES;
      const a = outline[i]!;
      const b = outline[j]!;
      const segment = a.distanceTo(b);
      const u0 = length / 2;
      const u1 = (length + segment) / 2;
      length += segment;
      const at = (p: THREE.Vector2, ring: number, idx: number, y: number) => {
        const s = rings[ring]!.scale * jitter[ring]![idx]!;
        return [p.x * s, y, p.y * s] as const;
      };
      const t0 = at(a, k, i, top.y);
      const t1 = at(b, k, j, top.y);
      const b0 = at(a, k + 1, i, bottom.y);
      const b1 = at(b, k + 1, j, bottom.y);
      const v0 = -top.y / tileHeight;
      const v1 = -bottom.y / tileHeight;
      positions.push(...t0, ...b0, ...b1, ...t0, ...b1, ...t1);
      uvs.push(u0, -v0, u0, -v1, u1, -v1, u0, -v0, u1, -v1, u1, -v0);
    }
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  geometry.computeVertexNormals();
  const mesh = new THREE.Mesh(
    geometry,
    new THREE.MeshLambertMaterial({ map: texture, side: THREE.DoubleSide }),
  );
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  return mesh;
}

/** Falaise : terre striée avec l'herbe qui dégouline. */
function cliff(texture: THREE.Texture): THREE.Mesh {
  return ringBand(
    [
      { scale: 1.005, y: 0 },
      { scale: 0.93, y: -CLIFF },
    ],
    texture,
    CLIFF,
    1,
  );
}

/** Motte de terre sous l'île : bosselée, en pointe, texturée de terre profonde et de racines. */
function rootBall(texture: THREE.Texture): THREE.Mesh {
  return ringBand(
    [
      { scale: 0.93, y: -CLIFF },
      { scale: 0.84, y: -CLIFF - 0.7, wobble: 0.08 },
      { scale: 0.64, y: -CLIFF - 1.5, wobble: 0.14 },
      { scale: 0.38, y: -CLIFF - 2.3, wobble: 0.2 },
      { scale: 0.12, y: -CLIFF - 2.9, wobble: 0.3 },
      { scale: 0.01, y: -CLIFF - 3.2 },
    ],
    texture,
    CLIFF,
    2,
  );
}

/** Quelques cailloux pris dans la terre, et des racines qui pendent sous la pointe. */
function stonesAndRoots(rock: THREE.Texture): THREE.Group {
  const group = new THREE.Group();
  const material = new THREE.MeshLambertMaterial({ map: rock, flatShading: true });
  const stones: [number, number, number, number][] = [
    // angle (0 = face à la caméra), hauteur, rayon relatif, taille
    [-0.55, -CLIFF - 0.55, 0.86, 0.32],
    [0.7, -CLIFF - 1.2, 0.7, 0.26],
    [-1.4, -CLIFF - 1.0, 0.76, 0.22],
    [0.15, -CLIFF - 2.0, 0.5, 0.2],
  ];
  for (const [angle, y, spread, size] of stones) {
    const a = Math.PI / 2 + angle;
    const stone = new THREE.Mesh(new THREE.IcosahedronGeometry(size, 0), material);
    stone.position.set(Math.cos(a) * edge(a) * spread, y, Math.sin(a) * edge(a) * spread);
    stone.rotation.set(angle, angle * 2, 0.4);
    stone.scale.set(1.2, 0.85, 1);
    stone.castShadow = true;
    group.add(stone);
  }
  const rootMaterial = new THREE.MeshLambertMaterial({ color: ART.ramps.deepDirt[1] });
  const rand = seeded(12);
  for (let k = 0; k < 6; k++) {
    const a = (k / 6) * Math.PI * 2 + 0.3;
    const r = 0.3 + rand() * 0.5;
    const start = new THREE.Vector3(Math.cos(a) * r, -CLIFF - 2.5 - rand() * 0.4, Math.sin(a) * r);
    const points = [0, 1, 2, 3].map(
      (i) =>
        new THREE.Vector3(
          start.x + Math.sin(i * 1.7 + k) * 0.12 * i,
          start.y - i * (0.25 + rand() * 0.15),
          start.z + Math.cos(i * 1.3 + k) * 0.12 * i,
        ),
    );
    const root = new THREE.Mesh(
      new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points), 12, 0.035 - k * 0.003, 5),
      rootMaterial,
    );
    group.add(root);
  }
  return group;
}

/**
 * Cristaux lumineux en grappes sur l'avant de la motte : très émissifs (le halo les fait rayonner),
 * chacun avec une petite lumière colorée qui teinte la terre autour.
 */
function crystals(): THREE.Group {
  const group = new THREE.Group();
  const clusters: [number, number, number, number][] = [
    // angle (0 = face à la caméra), hauteur, taille, couleur (index)
    [-0.95, -CLIFF - 0.45, 0.5, 0],
    [0.45, -CLIFF - 1.35, 0.44, 1],
    [1.25, -CLIFF - 0.55, 0.4, 2],
  ];
  const rand = seeded(4);
  for (const [angle, y, size, index] of clusters) {
    const color = ART.crystals[index]!;
    const a = Math.PI / 2 + angle;
    const spread = y < -CLIFF - 1 ? 0.7 : 0.9;
    const base = new THREE.Vector3(
      Math.cos(a) * edge(a) * spread,
      y,
      Math.sin(a) * edge(a) * spread,
    );
    const material = new THREE.MeshLambertMaterial({
      color,
      emissive: new THREE.Color(color),
      emissiveIntensity: 0.9,
      flatShading: true,
    });
    for (let k = 0; k < 3; k++) {
      const s = size * (k === 0 ? 1 : 0.55 + rand() * 0.2);
      const shard = new THREE.Mesh(new THREE.OctahedronGeometry(s, 0), material);
      shard.scale.set(0.55, 1.7, 0.55);
      shard.position
        .copy(base)
        .add(new THREE.Vector3((k - 1) * s * 0.7, (k === 0 ? 0 : -0.15) - s * 0.3, 0.12 * k));
      shard.rotation.set(0.5 + rand() * 0.3, a, (k - 1) * 0.45);
      group.add(shard);
    }
    const light = new THREE.PointLight(color, 3, 2.4, 1.6);
    light.position.copy(base).add(new THREE.Vector3(0, 0, 0.4));
    group.add(light);
  }
  return group;
}

/** Rayons de soleil : lames lumineuses additives qui descendent en biais depuis le haut à gauche. */
function sunbeams(): THREE.Group {
  const group = new THREE.Group();
  const material = new THREE.ShaderMaterial({
    uniforms: { uTime: WATER_TIME, uColor: { value: new THREE.Color(ART.light.sun) } },
    vertexShader: /* glsl */ `
      varying vec2 vUv;
      void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
    fragmentShader: /* glsl */ `
      uniform float uTime;
      uniform vec3 uColor;
      varying vec2 vUv;
      void main() {
        float across = 1.0 - abs(vUv.x - 0.5) * 2.0;
        float along = smoothstep(0.0, 0.35, vUv.y) * smoothstep(1.0, 0.55, vUv.y);
        float shimmer = 0.75 + 0.25 * sin(uTime * 0.8 + vUv.y * 6.0);
        gl_FragColor = vec4(uColor, across * across * along * shimmer * 0.22);
      }`,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    side: THREE.DoubleSide,
  });
  for (const [x, w] of [
    [-2.4, 0.9],
    [-0.6, 0.6],
    [1.1, 1.1],
  ] as const) {
    const beam = new THREE.Mesh(new THREE.PlaneGeometry(w, 11), material);
    beam.position.set(x, 1.5, -0.5);
    beam.rotation.z = -0.42;
    group.add(beam);
  }
  return group;
}

// ---------------------------------------------------------------------------
// Eau : π tracé par l'eau, rivière qui en sort, cascade qui déborde de la falaise
// ---------------------------------------------------------------------------

/** π vu de dessus : la barre au fond, les jambes vers la caméra (il se lit à l'endroit). */
const PI_SHAPE: [number, number][] = [
  [-0.95, 0.5],
  [0.95, 0.5],
  [0.95, 0.22],
  [0.5, 0.22],
  [0.5, -0.5],
  [0.72, -0.5],
  [0.72, -0.72],
  [0.24, -0.72],
  [0.24, 0.22],
  [-0.28, 0.22],
  [-0.28, -0.72],
  [-0.56, -0.72],
  [-0.56, 0.22],
  [-0.95, 0.22],
];
const PI_ORIGIN = { x: -0.75, z: -0.55, sx: 1.3, sz: 1.8 };
const piPoint = ([x, y]: [number, number]) =>
  new THREE.Vector2(PI_ORIGIN.x + x * PI_ORIGIN.sx, PI_ORIGIN.z - y * PI_ORIGIN.sz);

/** La rivière part du pied droit du π et rejoint le bord avant de l'île. */
const RIVER: [number, number][] = [
  [0.12, 0.62],
  [0.5, 1.25],
  [0.95, 1.85],
  [1.28, 2.4],
  [1.46, 2.8],
];

function ribbon(
  points: readonly THREE.Vector3[],
  width: number,
  up: THREE.Vector3 | null,
): THREE.BufferGeometry {
  const positions: number[] = [];
  for (let i = 0; i + 1 < points.length; i++) {
    const p0 = points[i]!;
    const p1 = points[i + 1]!;
    const tangent = new THREE.Vector3().subVectors(p1, p0).normalize();
    const normal = up ?? new THREE.Vector3(0, 1, 0);
    const side = new THREE.Vector3()
      .crossVectors(tangent, normal)
      .normalize()
      .multiplyScalar(width / 2);
    const a = p0.clone().add(side);
    const b = p0.clone().sub(side);
    const c = p1.clone().sub(side);
    const d = p1.clone().add(side);
    positions.push(
      a.x,
      a.y,
      a.z,
      b.x,
      b.y,
      b.z,
      c.x,
      c.y,
      c.z,
      a.x,
      a.y,
      a.z,
      c.x,
      c.y,
      c.z,
      d.x,
      d.y,
      d.z,
    );
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geometry.computeVertexNormals();
  return geometry;
}

function water(): { group: THREE.Group; fall: THREE.CatmullRomCurve3 } {
  const group = new THREE.Group();
  const flat = waterMaterial('flat');

  const pi = new THREE.ShapeGeometry(
    new THREE.Shape(PI_SHAPE.map(piPoint).map((p) => new THREE.Vector2(p.x, -p.y))),
  );
  pi.rotateX(-Math.PI / 2);
  const piMesh = new THREE.Mesh(pi, flat);
  piMesh.position.y = 0.012;
  group.add(piMesh);

  const river = new THREE.CatmullRomCurve3(RIVER.map(([x, z]) => new THREE.Vector3(x, 0.014, z)));
  group.add(new THREE.Mesh(ribbon(river.getPoints(40), 0.42, null), flat));

  // Cascade : l'eau déborde du bord, épouse le haut de la falaise puis tombe à la verticale.
  const end = river.getPoint(1);
  const out = new THREE.Vector3(end.x, 0, end.z).normalize();
  const along = (d: number, y: number) => end.clone().setY(y).addScaledVector(out, d);
  const fall = new THREE.CatmullRomCurve3([
    along(0, 0.014),
    along(0.18, -0.05),
    along(0.3, -0.35),
    along(0.36, -1.2),
    along(0.4, -2.6),
    along(0.44, -4.2),
  ]);
  const tangentAxis = new THREE.Vector3(-out.z, 0, out.x);
  const fallGeometry = ribbon(
    fall.getPoints(40),
    0.42,
    tangentAxis
      .clone()
      .cross(new THREE.Vector3(0, 1, 0))
      .normalize(),
  );
  group.add(new THREE.Mesh(fallGeometry, waterMaterial('fall')));
  return { group, fall };
}

// ---------------------------------------------------------------------------
// Objets, nuages, poussière, îles lointaines
// ---------------------------------------------------------------------------

type Placed = { sprite: Sprite; x: number; z: number; scale?: number };

/** Objets de la matière, placés hors de l'eau (x, z du plateau). */
function props(): Placed[] {
  return [
    { sprite: craneSprite(), x: 1.2, z: -1.7, scale: 0.85 },
    { sprite: protractorSprite(), x: -0.35, z: -2.45, scale: 0.8 },
    { sprite: compassSprite(), x: 2.45, z: 0.1, scale: 0.75 },
    { sprite: piSprite(), x: -1.85, z: 2.1, scale: 0.85 },
    { sprite: pyramidSprite('wood', 22), x: -0.2, z: 1.85, scale: 0.85 },
    { sprite: pyramidSprite('blue', 18), x: -0.85, z: 2.55, scale: 0.75 },
    { sprite: pyramidSprite('violet', 16), x: 2.1, z: 1.05, scale: 0.75 },
    { sprite: diceSprite(3), x: 2.15, z: 2.05, scale: 0.8 },
    { sprite: abacusSprite(), x: -2.55, z: 0.05, scale: 0.8 },
    { sprite: signTree('+', 'green'), x: -2.35, z: -0.95, scale: 0.8 },
    { sprite: signTree('×', 'violet'), x: 2.5, z: -0.95, scale: 0.7 },
    { sprite: signTree('÷', 'cyan'), x: 0.25, z: 2.85, scale: 0.7 },
    { sprite: roundTree(3), x: -1.35, z: -2.6, scale: 0.8 },
    { sprite: roundTree(7), x: 2.2, z: -2.0, scale: 0.75 },
    { sprite: roundTree(11), x: -2.3, z: -1.9, scale: 0.75 },
    { sprite: roundTree(5), x: 0.45, z: -2.95, scale: 0.7 },
  ];
}

/** Poussière lumineuse qui flotte autour de l'île (le halo la fait briller). */
function dust(): THREE.Points {
  const rand = seeded(21);
  const count = 70;
  const positions = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    positions[i * 3] = (rand() - 0.5) * 9;
    positions[i * 3 + 1] = -3.5 + rand() * 6.5;
    positions[i * 3 + 2] = (rand() - 0.5) * 7;
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  return new THREE.Points(
    geometry,
    new THREE.PointsMaterial({
      color: ART.dust,
      size: 0.07,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    }),
  );
}

/** Îles lointaines : la même île en miniature, noyée dans la brume et floutée. */
function distantIslands(
  grass: THREE.Texture,
  dirt: THREE.Texture,
  earth: THREE.Texture,
): THREE.Group {
  const group = new THREE.Group();
  const specs: [number, number, number, number][] = [
    [-9, 2.5, -16, 0.45],
    [10, 4.5, -22, 0.55],
    [6, -4.5, -14, 0.3],
    [-12, -2.5, -24, 0.5],
  ];
  for (const [x, y, z, s] of specs) {
    const island = new THREE.Group();
    island.add(plateau(grass), cliff(dirt), rootBall(earth));
    island.position.set(x, y, z);
    island.scale.setScalar(s);
    island.rotation.y = x * 0.2;
    group.add(island);
  }
  return group;
}

type World = {
  scene: THREE.Group;
  root: THREE.Group;
  billboards: THREE.Mesh[];
  digits: THREE.Mesh[];
  fall: THREE.CatmullRomCurve3;
  clouds: THREE.Mesh[];
  particles: THREE.Points;
};

function buildWorld(): World {
  const root = new THREE.Group();
  const grass = toTexture(grassTile(), true);
  const dirt = toTexture(cliffTile(), true);
  const earth = toTexture(rootBallTile(), true);
  const rock = toTexture(rockTile(), true);
  root.add(plateau(grass), cliff(dirt), rootBall(earth), stonesAndRoots(rock), crystals());
  const { group: waterGroup, fall } = water();
  root.add(waterGroup);

  const billboards: THREE.Mesh[] = [];
  for (const placed of props()) {
    const mesh = spriteMesh(placed.sprite, placed.scale ?? 1);
    mesh.position.set(placed.x, 0, placed.z);
    root.add(mesh);
    billboards.push(mesh);
  }
  const digits = Array.from({ length: 10 }, (_, i) => {
    const mesh = spriteMesh(digitSprite(String((i * 7 + 3) % 10)), 0.9);
    mesh.castShadow = false;
    root.add(mesh);
    billboards.push(mesh);
    return mesh;
  });
  const clouds = [
    { x: -4.2, y: 1.8, z: -3.5, s: 1.3 },
    { x: 3.9, y: 2.6, z: -5, s: 1.6 },
    { x: 3.0, y: -3.2, z: 2.5, s: 1.1 },
    { x: -3.6, y: -1.5, z: 2.2, s: 0.9 },
  ].map((c, i) => {
    const mesh = spriteMesh(cloudSprite(i + 1), c.s, false);
    mesh.castShadow = false;
    mesh.position.set(c.x, c.y, c.z);
    root.add(mesh);
    billboards.push(mesh);
    return mesh;
  });
  const particles = dust();
  root.add(particles);
  const scene = new THREE.Group();
  scene.add(root, distantIslands(grass, dirt, earth), sunbeams());
  return { scene, root, billboards, digits, fall, clouds, particles };
}

/** Une image : flottement, eau, chiffres qui tombent, nuages, poussière, sprites face à la caméra. */
function tickWorld(w: World, t: number, delta: number, camera: THREE.Camera, animated: boolean) {
  if (animated) {
    WATER_TIME.value = t;
    w.root.position.y = Math.sin(t * 1.1) * 0.08;
    w.digits.forEach((digit, i) => {
      const phase = 0.12 + ((((t * 0.28 + i / w.digits.length) % 1) + 1) % 1) * 0.88;
      const p = w.fall.getPoint(phase);
      digit.position.set(p.x + Math.sin(i * 2.1) * 0.06, p.y - 0.12, p.z + 0.08);
    });
    w.clouds.forEach((cloud, i) => {
      cloud.position.x += delta * (0.08 + i * 0.03);
      if (cloud.position.x > 6) cloud.position.x = -6;
    });
    w.particles.rotation.y += delta * 0.03;
  }
  // Sprites tournés vers la caméra autour de la verticale (comme les personnages d'Octopath).
  for (const mesh of w.billboards) {
    mesh.rotation.y = Math.atan2(
      camera.position.x - mesh.position.x,
      camera.position.z - mesh.position.z,
    );
  }
}

export function MathsIslandHD({ animated = true }: { animated?: boolean }) {
  const camera = useThree((s) => s.camera);
  const world = useMemo(() => buildWorld(), []);
  useFrame(({ clock }, delta) => tickWorld(world, clock.elapsedTime, delta, camera, animated));
  return <primitive object={world.scene} />;
}
