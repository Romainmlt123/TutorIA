import { theme } from '@/theme';

import { outlineOf, shade } from './color';
import {
  depthOf,
  drawSolid,
  project,
  type Shape,
  type Solid,
  type V2,
  type V3,
  type View,
} from './iso';

/*
 * Volumes de base de l'illustration (faces planes) et formes « billboard » (toujours de face) :
 * boules d'arbres, nuages, bosses d'herbe, pastilles. Chaque fonction renvoie des formes SVG.
 */

type Placement = { at: V3; rotation?: number };

function place([x, y, z]: V3, { at, rotation = 0 }: Placement): V3 {
  const c = Math.cos(rotation);
  const s = Math.sin(rotation);
  return [at[0] + x * c - y * s, at[1] + x * s + y * c, at[2] + z];
}

/** Profondeur commune à un objet : ses faces restent groupées au tri du peintre. */
function anchored(view: View, shapes: Shape[], at: V3): Shape[] {
  const base = depthOf(view, at);
  return shapes.map((s) => ({ ...s, depth: base + (s.depth - base) * 0.01 }));
}

/** Prisme droit : un polygone (dans le plan x, y) extrudé en hauteur. */
export function prism(
  view: View,
  outline: readonly V2[],
  height: number,
  color: string,
  placement: Placement,
): Shape[] {
  const bottom = outline.map(([x, y]) => place([x, y, 0], placement));
  const top = outline.map(([x, y]) => place([x, y, height], placement));
  const faces: V3[][] = [top, bottom.slice().reverse()];
  for (let i = 0; i < outline.length; i++) {
    const j = (i + 1) % outline.length;
    faces.push([bottom[i]!, bottom[j]!, top[j]!, top[i]!]);
  }
  return anchored(view, drawSolid(view, { faces, color }), placement.at);
}

/** Prisme couché : un polygone (dans le plan x, z) extrudé en profondeur (y). */
export function slab(
  view: View,
  outline: readonly V2[],
  thickness: number,
  color: string,
  placement: Placement,
): Shape[] {
  const front = outline.map(([x, z]) => place([x, -thickness / 2, z], placement));
  const back = outline.map(([x, z]) => place([x, thickness / 2, z], placement));
  const faces: V3[][] = [front, back.slice().reverse()];
  for (let i = 0; i < outline.length; i++) {
    const j = (i + 1) % outline.length;
    faces.push([front[i]!, front[j]!, back[j]!, back[i]!]);
  }
  return anchored(view, drawSolid(view, { faces, color }), placement.at);
}

export function box(view: View, size: V3, color: string, placement: Placement): Shape[] {
  const [w, d] = [size[0] / 2, size[1] / 2];
  return prism(
    view,
    [
      [-w, -d],
      [w, -d],
      [w, d],
      [-w, d],
    ],
    size[2],
    color,
    placement,
  );
}

export function cylinder(
  view: View,
  radius: number,
  height: number,
  color: string,
  placement: Placement,
  sides = 16,
): Shape[] {
  const outline: V2[] = Array.from({ length: sides }, (_, i) => {
    const a = (i / sides) * Math.PI * 2;
    return [Math.cos(a) * radius, Math.sin(a) * radius];
  });
  return prism(view, outline, height, color, placement);
}

export function pyramid(
  view: View,
  base: number,
  height: number,
  color: string,
  placement: Placement,
): Shape[] {
  const h = base / 2;
  const corners = [
    [-h, -h],
    [h, -h],
    [h, h],
    [-h, h],
  ].map(([x, y]) => place([x!, y!, 0], placement));
  const apex = place([0, 0, height], placement);
  const faces: V3[][] = corners.map((c, i) => [c, corners[(i + 1) % 4]!, apex]);
  faces.push(corners.slice().reverse());
  return anchored(view, drawSolid(view, { faces, color }), placement.at);
}

function circlePath(cx: number, cy: number, rx: number, ry: number): string {
  return `M${(cx - rx).toFixed(1)} ${cy.toFixed(1)}a${rx.toFixed(1)} ${ry.toFixed(1)} 0 1 0 ${(2 * rx).toFixed(1)} 0a${rx.toFixed(1)} ${ry.toFixed(1)} 0 1 0 ${(-2 * rx).toFixed(1)} 0Z`;
}

/**
 * Boule dessinée de face (arbre, buisson, nuage, bosse d'herbe) : disque, ombre propre en bas à
 * droite, reflet en haut à gauche. Le contour suit la couleur.
 */
export function blob(
  view: View,
  at: V3,
  radius: number,
  color: string,
  options: { squash?: number; highlight?: boolean; outline?: boolean } = {},
): Shape[] {
  const [cx, cy] = project(view, at);
  const r = radius * view.scale;
  const ry = r * (options.squash ?? 1);
  const depth = depthOf(view, at);
  const shapes: Shape[] = [
    {
      d: circlePath(cx, cy, r, ry),
      fill: color,
      stroke: options.outline === false ? undefined : outlineOf(color),
      strokeWidth: 1.6,
      depth,
    },
    {
      d: circlePath(cx + r * 0.18, cy + ry * 0.2, r * 0.78, ry * 0.72),
      fill: shade(color, -0.16),
      depth: depth + 0.0001,
    },
    {
      d: circlePath(cx - r * 0.08, cy - ry * 0.08, r * 0.72, ry * 0.68),
      fill: color,
      depth: depth + 0.0002,
    },
  ];
  if (options.highlight !== false) {
    shapes.push({
      d: circlePath(cx - r * 0.32, cy - ry * 0.36, r * 0.26, ry * 0.18),
      fill: shade(color, 0.5),
      opacity: 0.8,
      depth: depth + 0.0003,
    });
  }
  return shapes;
}

/** Ombre portée douce au sol, sous un objet. */
export function groundShadow(view: View, at: V3, radius: number): Shape {
  const [cx, cy] = project(view, at);
  return {
    d: circlePath(cx, cy, radius * view.scale, radius * view.scale * view.tilt),
    fill: theme.palette.gray[800],
    opacity: 0.16,
    depth: depthOf(view, at) - 0.5,
  };
}

export type { Solid };

const PHI = (1 + Math.sqrt(5)) / 2;
const ICO_VERTICES: V3[] = [
  [-1, PHI, 0],
  [1, PHI, 0],
  [-1, -PHI, 0],
  [1, -PHI, 0],
  [0, -1, PHI],
  [0, 1, PHI],
  [0, -1, -PHI],
  [0, 1, -PHI],
  [PHI, 0, -1],
  [PHI, 0, 1],
  [-PHI, 0, -1],
  [-PHI, 0, 1],
];
const ICO_FACES = [
  [0, 11, 5],
  [0, 5, 1],
  [0, 1, 7],
  [0, 7, 10],
  [0, 10, 11],
  [1, 5, 9],
  [5, 11, 4],
  [11, 10, 2],
  [10, 7, 6],
  [7, 1, 8],
  [3, 9, 4],
  [3, 4, 2],
  [3, 2, 6],
  [3, 6, 8],
  [3, 8, 9],
  [4, 9, 5],
  [2, 4, 11],
  [6, 2, 10],
  [8, 6, 7],
  [9, 8, 1],
];

/**
 * Rocher polyédrique (icosaèdre déformé, graine fixe) : les facettes accrochent la lumière comme
 * les blocs de pierre des illustrations d'inspiration.
 */
export function boulder(
  view: View,
  at: V3,
  radius: number,
  color: string,
  seed: number,
  stretch: V3 = [1, 1, 0.85],
): Shape[] {
  let s = seed * 9301 + 49297;
  const rand = () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
  const vertices = ICO_VERTICES.map(([x, y, z]) => {
    const k = (radius / Math.hypot(1, PHI)) * (0.82 + rand() * 0.32);
    return [
      at[0] + x * k * stretch[0],
      at[1] + y * k * stretch[1],
      at[2] + z * k * stretch[2],
    ] as const;
  });
  const faces = ICO_FACES.map((f) => f.map((i) => vertices[i]!));
  return anchored(view, drawSolid(view, { faces, color }, 1.3), at);
}
