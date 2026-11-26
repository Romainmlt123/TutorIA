import { seeded } from '../hd2d/pixels';
import { piPoints, WATER_SURFACE } from '../stylized3d/waterLayout';
import { GLINT_GROUPS } from './mapAmbient';
import { imageV, type ImageFrame } from './mapProjection';

/*
 * Ce qui vit sur une carte pré-rendue (X2b), posé une fois pour toutes à l'ouverture : les reflets
 * du soleil sur l'eau du π et les nuages sous l'île. Leurs animations sont dans mapAmbient.ts.
 * Mesures en mètres de la carte : x vers la droite, z vers la caméra ; v = le plan image (vers le bas).
 */

type Polygon = readonly (readonly [number, number])[];

/** Distance minimale d'un reflet à la berge (mètres) : il reste sur l'eau, même en glissant. */
export const GLINT_INSET = 0.15;
/** Distance minimale entre deux reflets (mètres) : des éclats épars, jamais en paquets. */
export const GLINT_SPACING = 0.9;
/** Reflets d'une carte, au plus : quelques-uns à l'écran, dont un tiers qui brille. */
export const GLINT_MAX = 36;
/** Points tirés au hasard pour placer les reflets. */
const GLINT_ATTEMPTS = 1500;
/** Longueur d'un reflet (mètres), avant sa taille relative (`glintAt`) : un éclat de quelques dp. */
const GLINT_LENGTH = 0.07;

/**
 * Proportions d'un reflet, en fraction de sa longueur : sa hauteur (un éclat couché, étiré par les
 * vaguelettes), puis son bord doux (ombre floue de sa couleur : `spread`, puis `blur`).
 */
export const GLINT_SHAPE = { height: 0.45, spread: 0.05, blur: 0.5 } as const;

/** Un reflet sur l'eau : son point (mètres), sa longueur et son groupe de scintillement. */
export type Glint = { x: number; z: number; length: number; group: number };

/**
 * Le bassin en π d'une carte dont le terrain est l'île agrandie `scale` fois (terrains.ts) : son
 * contour (mètres de la carte) et la hauteur de son eau, comme Blender le rend (lib/mapwater.py).
 */
export function scaledPi(scale: number): { outline: [number, number][]; surface: number } {
  return {
    outline: piPoints().map(([x, z]) => [x * scale, z * scale]),
    surface: WATER_SURFACE * scale,
  };
}

/** Point dans le polygone (rayon horizontal, règle pair-impair). */
function inside(polygon: Polygon, x: number, z: number): boolean {
  let result = false;
  polygon.forEach(([ax, az], i) => {
    const [bx, bz] = polygon[(i + 1) % polygon.length]!;
    if (az > z !== bz > z && x < ax + ((z - az) * (bx - ax)) / (bz - az)) result = !result;
  });
  return result;
}

/** Distance d'un point au plus proche des bords du polygone. */
function edgeDistance(polygon: Polygon, x: number, z: number): number {
  let best = Infinity;
  polygon.forEach(([ax, az], i) => {
    const [bx, bz] = polygon[(i + 1) % polygon.length]!;
    const ex = bx - ax;
    const ez = bz - az;
    const h = Math.max(0, Math.min(1, ((x - ax) * ex + (z - az) * ez) / (ex * ex + ez * ez)));
    best = Math.min(best, Math.hypot(x - ax - ex * h, z - az - ez * h));
  });
  return best;
}

/** Rectangle de l'image rendue, en mètres du plan image. */
function imageRect(frame: ImageFrame) {
  return {
    xMin: frame.x0,
    xMax: frame.x0 + frame.width / frame.ppm,
    vMin: frame.v0,
    vMax: frame.v0 + frame.height / frame.ppm,
  };
}

/**
 * Reflets du soleil sur l'eau d'une carte pré-rendue : tirés au hasard (graine de la région) dans
 * le bassin `pi` (contour en mètres de la carte, à la hauteur `surface`), loin des berges, espacés
 * les uns des autres et dans l'image rendue. Les groupes de scintillement alternent d'un reflet à
 * l'autre.
 */
export function waterGlints(
  pi: Polygon,
  surface: number,
  frame: ImageFrame,
  seed: number,
): Glint[] {
  const rect = imageRect(frame);
  const xs = pi.map(([x]) => x);
  const zs = pi.map(([, z]) => z);
  const xMin = Math.max(Math.min(...xs), rect.xMin);
  const xMax = Math.min(Math.max(...xs), rect.xMax);
  const zMin = Math.min(...zs);
  const zMax = Math.max(...zs);
  if (xMin >= xMax) return [];
  const rand = seeded(seed);
  const glints: Glint[] = [];
  for (let attempt = 0; attempt < GLINT_ATTEMPTS && glints.length < GLINT_MAX; attempt++) {
    const x = xMin + rand() * (xMax - xMin);
    const z = zMin + rand() * (zMax - zMin);
    const v = imageV(z, surface);
    if (v <= rect.vMin || v >= rect.vMax) continue;
    if (!inside(pi, x, z) || edgeDistance(pi, x, z) < GLINT_INSET) continue;
    if (glints.some((g) => Math.hypot(g.x - x, g.z - z) < GLINT_SPACING)) continue;
    glints.push({
      x,
      z,
      length: GLINT_LENGTH * (0.75 + rand() * 0.5),
      group: glints.length % GLINT_GROUPS,
    });
  }
  return glints;
}

/**
 * Surface d'image (m²) pour un nuage. Plus serrés et plus gros que sous la carte en 3D (IslandStage :
 * 40 m², échelle 0,9 à 1,5) : ils couvrent environ un cinquième du ciel, qui ne se voit que par
 * endroits.
 */
export const CLOUD_AREA = 30;
/** Bouffées d'un nuage : une grosse au centre, les autres de part et d'autre (stylized3d/Clouds.tsx). */
const PUFFS = 5;

/**
 * Bouffée d'un nuage, dans le plan image (mètres, depuis le centre du nuage) : un cœur plein
 * (`width` × `height`, bouts arrondis) et son bord doux (ombre floue de même couleur : `spread`,
 * puis `blur`). Le dessous (`shade`, bleuté) est posé d'abord, le dessus éclairé (`lit`) ensuite.
 */
export type CloudPuff = {
  dx: number;
  dv: number;
  width: number;
  height: number;
  spread: number;
  blur: number;
  tone: 'shade' | 'lit';
};

/** Un nuage : son centre (plan image), sa vitesse de dérive (m/s), ses bouffées et leur étendue. */
export type MapCloud = {
  x: number;
  v: number;
  speed: number;
  halfWidth: number;
  halfHeight: number;
  puffs: CloudPuff[];
};

/** Les nuages d'une carte, et l'intervalle de x qu'ils parcourent avant de revenir à gauche. */
export type CloudField = { clouds: MapCloud[]; wrap: readonly [number, number] };

/**
 * Bouffées d'un nuage d'échelle `scale`, d'après la carte en 3D (stylized3d/Clouds.tsx) : `size`
 * est le côté de la bouffée en 3D, dont le nuage visible fait environ 62 % en largeur et 46 % en
 * hauteur. Le cœur et son bord doux le reproduisent : le flou (σ = 7 % du côté) commence à deux σ
 * du cœur, pour que le bord du cœur ne se voie pas.
 */
function puffsOf(scale: number, rand: () => number): CloudPuff[] {
  const shapes = Array.from({ length: PUFFS }, (_, i) => {
    const size = (i === 0 ? 2.4 : 1.3 + rand() * 0.7) * scale;
    const side = i === 0 ? 0 : (i % 2 === 0 ? 1 : -1) * (0.55 + rand() * 0.5);
    const up = ((rand() - 0.4) * 0.35 - Math.abs(side) * 0.2) * scale;
    return { dx: side * scale, dv: -up, size };
  });
  const puff = (
    { dx, dv, size }: (typeof shapes)[number],
    tone: CloudPuff['tone'],
    shrink: number,
    drop: number,
  ): CloudPuff => ({
    dx,
    dv: dv + drop * size,
    width: 0.34 * size * shrink,
    height: 0.18 * size * shrink,
    spread: 0.14 * size * shrink,
    blur: 0.14 * size * shrink,
    tone,
  });
  // Le dessous, un peu plus bas, puis le dessus éclairé, un peu plus petit et plus haut.
  return [
    ...shapes.map((shape) => puff(shape, 'shade', 1, 0.05)),
    ...shapes.map((shape) => puff(shape, 'lit', 0.85, -0.03)),
  ];
}

/** Suite R2 (nombre plastique) : des points bien répartis sur le carré unité, sans hasard. */
const PLASTIC = 1.324717957244746;
const r2 = (i: number): [number, number] => [
  (0.5 + (i + 1) / PLASTIC) % 1,
  (0.5 + (i + 1) / (PLASTIC * PLASTIC)) % 1,
];

/**
 * Nuages d'une carte pré-rendue, sous les tuiles : répartis sur toute l'image (un pour CLOUD_AREA
 * m²), ils ne se voient que là où l'île s'arrête et où le rendu est transparent. Ils dérivent à la
 * vitesse des nuages de la carte en 3D (IslandStage, `mapClouds`) et reviennent à gauche une fois
 * sortis de l'image, là où l'écran ne va jamais.
 */
export function mapClouds(frame: ImageFrame, seed: number): CloudField {
  const rect = imageRect(frame);
  const width = rect.xMax - rect.xMin;
  const height = rect.vMax - rect.vMin;
  const count = Math.round((width * height) / CLOUD_AREA);
  const clouds = Array.from({ length: count }, (_, i): MapCloud => {
    const [fx, fv] = r2(i);
    const puffs = puffsOf(1.2 + (i % 4) * 0.25, seeded(seed + i * 7919));
    const reach = (puff: CloudPuff) => puff.spread + puff.blur;
    return {
      x: rect.xMin + fx * width,
      v: rect.vMin + fv * height,
      speed: 0.06 + (i % 5) * 0.02,
      halfWidth: Math.max(...puffs.map((p) => Math.abs(p.dx) + p.width / 2 + reach(p))),
      halfHeight: Math.max(...puffs.map((p) => Math.abs(p.dv) + p.height / 2 + reach(p))),
      puffs,
    };
  });
  const margin = Math.max(0, ...clouds.map((cloud) => cloud.halfWidth));
  return { clouds, wrap: [rect.xMin - margin, rect.xMax + margin] };
}
