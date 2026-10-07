import { outlineOf, shade } from './color';

/*
 * Moteur de dessin d'Explorer : des volumes simples décrits en 3D (faces planes), projetés en vue
 * de trois quarts et ombrés en teintes de la palette, puis rendus comme des tracés SVG plats.
 * Le résultat est une illustration 2D : aucune 3D à l'affichage, juste des chemins colorés.
 */

export type V3 = readonly [number, number, number];
export type V2 = readonly [number, number];

/** Forme finale, prête pour <Path> : tout le dessin est une liste de formes triées. */
export type Shape = {
  d: string;
  fill: string;
  stroke?: string;
  strokeWidth?: number;
  opacity?: number;
  /** Profondeur : plus elle est grande, plus la forme est devant. */
  depth: number;
};

export type View = {
  /** Rotation du monde autour de la verticale (radians) : l'angle de trois quarts. */
  yaw: number;
  /** Écrasement de la profondeur (0 : vue de face, 1 : vue de dessus). */
  tilt: number;
  scale: number;
  origin: V2;
};

/** Lumière venant d'en haut, à gauche et de face (repère tourné : y s'éloigne de l'observateur). */
const LIGHT: V3 = normalize([-0.45, -0.5, 0.75]);
/**
 * Direction vers l'observateur, cohérente avec la projection : une profondeur écrasée de `tilt`
 * équivaut à une caméra orthographique inclinée de atan(tilt) au-dessus de l'horizon.
 */
function towardViewer(view: View): V3 {
  const elevation = Math.atan(view.tilt);
  return [0, -Math.cos(elevation), Math.sin(elevation)];
}

const dot = (a: V3, b: V3) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];

function normalize(v: V3): V3 {
  const l = Math.hypot(v[0], v[1], v[2]) || 1;
  return [v[0] / l, v[1] / l, v[2] / l];
}

function rotate(view: View, [x, y, z]: V3): V3 {
  const c = Math.cos(view.yaw);
  const s = Math.sin(view.yaw);
  return [x * c - y * s, x * s + y * c, z];
}

/** Projection : x vers la droite, profondeur écrasée vers le haut de l'écran, z vers le haut. */
export function project(view: View, p: V3): V2 {
  const [x, y, z] = rotate(view, p);
  return [
    view.origin[0] + x * view.scale,
    view.origin[1] - y * view.scale * view.tilt - z * view.scale,
  ];
}

/** Profondeur d'un point : ce qui est proche de l'observateur (y petit) et bas est devant. */
export function depthOf(view: View, p: V3): number {
  const [, y, z] = rotate(view, p);
  return -y + z * 0.01;
}

export function pathOf(points: readonly V2[], closed = true): string {
  return (
    points.map(([x, y], i) => `${i ? 'L' : 'M'}${x.toFixed(1)} ${y.toFixed(1)}`).join('') +
    (closed ? 'Z' : '')
  );
}

function normalOf(face: readonly V3[]): V3 {
  const [a, b, c] = face as [V3, V3, V3];
  const u: V3 = [b[0] - a[0], b[1] - a[1], b[2] - a[2]];
  const v: V3 = [c[0] - a[0], c[1] - a[1], c[2] - a[2]];
  return normalize([
    u[1] * v[2] - u[2] * v[1],
    u[2] * v[0] - u[0] * v[2],
    u[0] * v[1] - u[1] * v[0],
  ]);
}

/**
 * Teinte d'une face selon la lumière : dessus éclairé, côtés en demi-teinte, dessous sombre.
 * Trois paliers fondus, comme une peinture en aplats.
 */
export function toneOf(color: string, normal: V3): string {
  const light = dot(normal, LIGHT);
  if (light > 0.55) return shade(color, 0.14);
  if (light > 0.1) return color;
  if (light > -0.3) return shade(color, -0.14);
  return shade(color, -0.28);
}

export type Solid = { faces: readonly (readonly V3[])[]; color: string; outline?: boolean };

/**
 * Faces visibles d'un volume (tournées vers l'observateur), en formes SVG ombrées.
 * L'orientation des faces est corrigée d'après le centre du volume : elles peuvent être décrites
 * dans n'importe quel sens, tant que le volume est convexe par morceaux.
 */
export function drawSolid(view: View, solid: Solid, strokeWidth = 1.6): Shape[] {
  const rotated = solid.faces.map((face) => face.map((p) => rotate(view, p)));
  const all = rotated.flat();
  const center: V3 = [0, 1, 2].map(
    (i) => all.reduce((sum, p) => sum + p[i]!, 0) / all.length,
  ) as unknown as V3;
  const shapes: Shape[] = [];
  const viewer = towardViewer(view);
  rotated.forEach((face, index) => {
    let normal = normalOf(face);
    const mid: V3 = [0, 1, 2].map(
      (i) => face.reduce((sum, p) => sum + p[i]!, 0) / face.length,
    ) as unknown as V3;
    if (dot(normal, [mid[0] - center[0], mid[1] - center[1], mid[2] - center[2]]) < 0) {
      normal = [-normal[0], -normal[1], -normal[2]];
    }
    if (dot(normal, viewer) <= 0.02) return;
    const source = solid.faces[index]!;
    shapes.push({
      d: pathOf(source.map((p) => project(view, p))),
      fill: toneOf(solid.color, normal),
      stroke: solid.outline === false ? undefined : outlineOf(solid.color),
      strokeWidth,
      depth: source.reduce((sum, p) => sum + depthOf(view, p), 0) / source.length,
    });
  });
  return shapes;
}

/** Tri du peintre : les formes du fond d'abord. */
export function sortShapes(shapes: readonly Shape[]): Shape[] {
  return [...shapes].sort((a, b) => a.depth - b.depth);
}
