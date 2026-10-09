import { theme } from '@/theme';

import { outlineOf } from './color';
import {
  depthOf,
  drawSolid,
  pathOf,
  project,
  type Shape,
  type V2,
  type V3,
  type View,
} from './iso';
import { blob, boulder, box, cylinder, groundShadow, pyramid, slab } from './solids';

/*
 * Île des Maths (carrousel X1), illustration vectorielle au plus près de l'inspiration
 * (assets/inspirations/explorer/inspiration_ile_mathématique.png) : encre sombre, herbe hachurée
 * qui dégouline sur une falaise striée, socle de gros rochers à facettes, π dessiné par l'eau,
 * rivière et cascade de chiffres, grue en règles, rapporteur, compas, arbres-signes, pyramides,
 * dés et boulier. Sans personnage et sans rouge (réservé aux évaluations).
 */

const P = theme.palette;

export const ISLAND_VIEWBOX = { width: 340, height: 400 } as const;
export const ISLAND_VIEW: View = { yaw: 0.28, tilt: 0.52, scale: 42, origin: [178, 172] };

const R = 3.1;
const PHASE = [0.7, 2.1, 4.4];
const INK_WIDTH = 1.5;

function edge(a: number): number {
  return (
    R *
    (1 +
      0.06 * Math.sin(5 * a + PHASE[0]!) +
      0.04 * Math.sin(8 * a + PHASE[1]!) +
      0.03 * Math.sin(2 * a + PHASE[2]!))
  );
}

function ring(z: number, scale = 1, sides = 90): V3[] {
  return Array.from({ length: sides }, (_, i) => {
    const a = (i / sides) * Math.PI * 2;
    const r = edge(a) * scale;
    return [Math.cos(a) * r, Math.sin(a) * r, z] as const;
  });
}

/** Vrai si le point du bord est tourné vers l'observateur (moitié avant de l'île). */
function facesViewer(a: number): boolean {
  return Math.sin(a + ISLAND_VIEW.yaw) < 0.05;
}

const ink = (color: string) => outlineOf(color);

const segment = (view: View, a: V3, b: V3) => {
  const [ax, ay] = project(view, a);
  const [bx, by] = project(view, b);
  return `M${ax.toFixed(1)} ${ay.toFixed(1)}L${bx.toFixed(1)} ${by.toFixed(1)}`;
};

const ellipse = (cx: number, cy: number, rx: number, ry: number) =>
  `M${(cx - rx).toFixed(1)} ${cy.toFixed(1)}a${rx} ${ry} 0 1 0 ${2 * rx} 0a${rx} ${ry} 0 1 0 ${-2 * rx} 0Z`;

// ---------------------------------------------------------------------------
// Socle, falaise, herbe
// ---------------------------------------------------------------------------

function base(view: View): Shape[] {
  const shapes: Shape[] = [];
  // Gros rochers à facettes, en trois rangs qui se resserrent vers la pointe.
  const rows: [number, number, number, number, number][] = [
    // rang, nombre, écartement, altitude, taille
    [0, 9, 0.78, -1.35, 0.95],
    [1, 6, 0.45, -2.35, 0.85],
    [2, 3, 0.16, -3.25, 0.7],
  ];
  let seed = 1;
  for (const [row, count, spread, z, size] of rows) {
    for (let k = 0; k < count; k++) {
      const a = (k / count) * Math.PI * 2 + row * 0.5;
      const r = edge(a) * spread;
      const tint = seed % 5 === 0 ? P.blue[200] : seed % 4 === 0 ? P.gray[400] : P.gray[300];
      shapes.push(
        ...boulder(view, [Math.cos(a) * r, Math.sin(a) * r, z], size, tint, seed).map((s) => ({
          ...s,
          depth: -300 + s.depth * 0.01,
        })),
      );
      seed += 1;
    }
  }
  // Petits éclats qui flottent sous l'île.
  const shards: [number, number, number, number][] = [
    [-3.2, -0.4, -2.2, 0.22],
    [2.9, -1.2, -2.9, 0.18],
    [-1.6, -2.8, -3.6, 0.15],
  ];
  for (const [x, y, z, r] of shards) {
    shapes.push(
      ...boulder(view, [x, y, z], r, P.gray[300], 40 + Math.round(r * 100)).map((s) => ({
        ...s,
        depth: -290,
      })),
    );
  }
  return shapes;
}

/** Falaise de terre : dégradé, stries verticales, racines et cailloux, devant seulement. */
function cliff(view: View): Shape[] {
  const shapes: Shape[] = [];
  const top = ring(-0.12, 1.0);
  const bottom = ring(-1.05, 0.93);
  const faces = top.map((t, i) => [
    t,
    top[(i + 1) % top.length]!,
    bottom[(i + 1) % top.length]!,
    bottom[i]!,
  ]);
  const visible = drawSolid(view, { faces, color: P.orange[700], outline: false });
  shapes.push(...visible.map((s) => ({ ...s, fill: P.orange[700], depth: -200.1 })));
  // Haut de falaise plus clair : un aplat superposé plutôt qu'un dégradé (fiable partout).
  const upperTop = ring(-0.12, 1.0);
  const upperBottom = ring(-0.5, 0.97);
  const upperFaces = upperTop.map((t, i) => [
    t,
    upperTop[(i + 1) % upperTop.length]!,
    upperBottom[(i + 1) % upperTop.length]!,
    upperBottom[i]!,
  ]);
  shapes.push(
    ...drawSolid(view, { faces: upperFaces, color: P.orange[600], outline: false }).map((s) => ({
      ...s,
      fill: P.orange[600],
      depth: -200,
    })),
  );
  const lower = bottom
    .filter((_, i) => facesViewer((i / bottom.length) * Math.PI * 2))
    .map((p) => project(view, p))
    .sort((p, q) => p[0] - q[0]);
  shapes.push({
    d: pathOf(lower, false),
    fill: 'none',
    stroke: ink(P.orange[700]),
    strokeWidth: INK_WIDTH,
    depth: -199,
  });
  for (let i = 0; i < 90; i++) {
    const a = (i / 90) * Math.PI * 2;
    if (!facesViewer(a)) continue;
    const len = 0.45 + ((i * 7) % 5) * 0.1;
    const r1 = edge(a);
    const r2 = edge(a) * 0.94;
    shapes.push({
      d: segment(
        view,
        [Math.cos(a) * r1, Math.sin(a) * r1, -0.2 - ((i * 3) % 4) * 0.05],
        [Math.cos(a) * r2, Math.sin(a) * r2, -0.2 - len],
      ),
      fill: 'none',
      stroke: P.orange[800],
      strokeWidth: i % 3 ? 1 : 1.6,
      opacity: 0.75,
      depth: -198,
    });
    if (i % 11 === 0) {
      const [cx, cy] = project(view, [Math.cos(a) * r1, Math.sin(a) * r1, -0.55]);
      shapes.push({
        d: `M${cx.toFixed(1)} ${cy.toFixed(1)}q4 6 1 12q-2 5 2 9`,
        fill: 'none',
        stroke: P.orange[900],
        strokeWidth: 1,
        opacity: 0.8,
        depth: -197,
      });
    }
  }
  for (let i = 0; i < 18; i++) {
    const a = -Math.PI / 2 - ISLAND_VIEW.yaw + (i / 18 - 0.5) * 2.9;
    const r = edge(a) * 0.985;
    const [cx, cy] = project(view, [Math.cos(a) * r, Math.sin(a) * r, -0.45 - (i % 4) * 0.1]);
    shapes.push({
      d: ellipse(cx, cy, 3.5, 2.6),
      fill: P.orange[400],
      stroke: ink(P.orange[700]),
      strokeWidth: 0.8,
      depth: -196,
    });
  }
  return shapes;
}

/** Plateau d'herbe hachurée, et bordure qui dégouline sur la falaise. */
function grass(view: View): Shape[] {
  const shapes: Shape[] = [];
  shapes.push({
    d: pathOf(ring(0).map((p) => project(view, p))),
    fill: P.green[400],
    stroke: ink(P.green[600]),
    strokeWidth: INK_WIDTH,
    depth: -100,
  });
  // Lumière douce sur l'herbe, vers la gauche et le fond.
  shapes.push({
    d: pathOf(ring(0, 0.7).map(([x, y, z]) => project(view, [x - 0.4, y + 0.35, z]))),
    fill: P.green[300],
    opacity: 0.6,
    depth: -99.8,
  });
  for (let i = 0; i < 160; i++) {
    const a = (i * 2.399963) % (Math.PI * 2);
    const rr = Math.sqrt(((i * 61) % 157) / 157) * R * 0.92;
    const [cx, cy] = project(view, [Math.cos(a) * rr, Math.sin(a) * rr, 0]);
    const dark = i % 3 !== 0;
    shapes.push({
      d: dark
        ? `M${(cx - 3).toFixed(1)} ${(cy + 1).toFixed(1)}l1.5 -4l1 3l1.2 -4.5l1.6 5`
        : `M${(cx - 2).toFixed(1)} ${cy.toFixed(1)}l2 -3l2 3`,
      fill: 'none',
      stroke: dark ? P.green[700] : P.green[200],
      strokeWidth: 1.1,
      opacity: dark ? 0.55 : 0.8,
      depth: -99,
    });
  }
  const count = 120;
  const angleAt = (i: number) =>
    -Math.PI / 2 - ISLAND_VIEW.yaw - Math.PI * 0.62 + (i / count) * Math.PI * 1.24;
  const lip: V2[] = [];
  for (let i = 0; i <= count; i++) {
    const a = angleAt(i);
    const r = edge(a) * 1.005;
    const drop = 0.16 + 0.12 * Math.abs(Math.sin(i * 0.9)) + (i % 7 === 0 ? 0.14 : 0);
    lip.push(project(view, [Math.cos(a) * r, Math.sin(a) * r, -drop]));
  }
  const rim: V2[] = [];
  for (let i = count; i >= 0; i--) {
    const a = angleAt(i);
    const r = edge(a) * 0.985;
    rim.push(project(view, [Math.cos(a) * r, Math.sin(a) * r, 0.02]));
  }
  shapes.push({
    d: pathOf([...lip, ...rim]),
    fill: P.green[500],
    stroke: ink(P.green[600]),
    strokeWidth: INK_WIDTH,
    depth: -98,
  });
  shapes.push({
    d: pathOf(
      rim.map(([x, y]) => [x, y + 3] as const),
      false,
    ),
    fill: 'none',
    stroke: P.green[300],
    strokeWidth: 2,
    opacity: 0.8,
    depth: -97.9,
  });
  return shapes;
}

// ---------------------------------------------------------------------------
// Eau : π tracé par l'eau, rivière, sortie de la cascade
// ---------------------------------------------------------------------------

const PI_CENTER: V2 = [-0.85, 0.75];
// π simple et lisible vu de haut : une barre, deux jambes droites, le pied droit relevé.
const PI_SHAPE: V2[] = [
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

const RIVER: V2[] = [
  [0.05, -0.55],
  [0.25, -0.5],
  [0.35, -0.2],
  [0.6, -0.8],
  [1.1, -1.35],
  [1.55, -1.75],
  [1.78, -2.08],
];

function water(view: View): Shape[] {
  const piPoints = PI_SHAPE.map(([x, y]) =>
    project(view, [PI_CENTER[0] + x * 1.35, PI_CENTER[1] + y * 1.9, 0.01]),
  );
  const riverD = pathOf(
    RIVER.map(([x, y]) => project(view, [x, y, 0.01])),
    false,
  );
  return [
    { d: riverD, fill: 'none', stroke: ink(P.azure[400]), strokeWidth: 21, depth: -95 },
    { d: riverD, fill: 'none', stroke: P.azure[300], strokeWidth: 18, depth: -94.9 },
    { d: riverD, fill: 'none', stroke: P.azure[200], strokeWidth: 4, opacity: 0.9, depth: -94.8 },
    {
      d: pathOf(piPoints),
      fill: P.azure[300],
      stroke: ink(P.azure[400]),
      strokeWidth: INK_WIDTH,
      depth: -94.7,
    },
    {
      d: pathOf(piPoints.map(([x, y]) => [x - 1.5, y - 1.5] as const)),
      fill: 'none',
      stroke: P.azure[100],
      strokeWidth: 1.4,
      opacity: 0.9,
      depth: -94.6,
    },
  ];
}

/** Cascade : rectangle vertical sous la sortie de la rivière (animé par l'écran, avec des chiffres). */
export function waterfallRect(view: View) {
  const end = RIVER[RIVER.length - 1]!;
  const [x, y] = project(view, [end[0], end[1], 0]);
  return { x: x - 10, y: y - 2, width: 20, height: 175 };
}

// ---------------------------------------------------------------------------
// Objets de la matière
// ---------------------------------------------------------------------------

/** Règle (bois clair, graduations à l'encre) : une planche plate, debout ou couchée. */
function ruler(
  view: View,
  outline: V2[],
  at: V3,
  rotation: number,
  ticksAlong: 'x' | 'z',
): Shape[] {
  const shapes = slab(view, outline, 0.14, P.orange[300], { at, rotation });
  const xs = outline.map((p) => p[0]);
  const zs = outline.map((p) => p[1]);
  const [x0, x1, z0, z1] = [Math.min(...xs), Math.max(...xs), Math.min(...zs), Math.max(...zs)];
  const c = Math.cos(rotation);
  const s = Math.sin(rotation);
  const pt = (x: number, z: number): V3 => [at[0] + x * c, at[1] + x * s - 0.08, at[2] + z];
  const n = Math.round((ticksAlong === 'x' ? x1 - x0 : z1 - z0) / 0.14);
  for (let k = 1; k < n; k++) {
    const long = k % 5 === 0;
    const [a, b] =
      ticksAlong === 'x'
        ? [pt(x0 + k * 0.14, z1), pt(x0 + k * 0.14, z1 - (long ? 0.14 : 0.08))]
        : [pt(x0, z0 + k * 0.14), pt(x0 + (long ? 0.14 : 0.08), z0 + k * 0.14)];
    shapes.push({
      d: segment(view, a, b),
      fill: 'none',
      stroke: P.gray[800],
      strokeWidth: 0.9,
      depth: depthOf(view, at) + 0.03,
    });
  }
  return shapes;
}

/** Arbre en forme de signe (+, ×, ÷) : le feuillage est le signe lui-même. */
function signTree(view: View, at: V3, sign: '+' | '×' | '÷', color: string, size = 0.55): Shape[] {
  const shapes: Shape[] = [groundShadow(view, at, 0.35)];
  shapes.push(...cylinder(view, 0.07, 0.75, P.orange[700], { at }, 8));
  const t = size * 0.34;
  const L = size;
  const plus: V2[] = [
    [-t, L],
    [t, L],
    [t, t],
    [L, t],
    [L, -t],
    [t, -t],
    [t, -L],
    [-t, -L],
    [-t, -t],
    [-L, -t],
    [-L, t],
    [-t, t],
  ];
  const lift = (pts: readonly V2[]) => pts.map(([x, z]) => [x, z + 0.75 + L] as const);
  if (sign === '÷') {
    const bar: V2[] = [
      [-L, t * 0.8],
      [L, t * 0.8],
      [L, -t * 0.8],
      [-L, -t * 0.8],
    ];
    shapes.push(...slab(view, lift(bar), 0.2, color, { at, rotation: 0.3 }));
    for (const dz of [L * 0.62, -L * 0.62]) {
      shapes.push(
        ...blob(view, [at[0], at[1] - 0.05, at[2] + 0.75 + L + dz], t * 0.9, color).map((s) => ({
          ...s,
          depth: s.depth + 0.02,
        })),
      );
    }
  } else {
    const shape =
      sign === '×' ? plus.map(([x, z]) => [(x - z) * 0.7071, (x + z) * 0.7071] as const) : plus;
    shapes.push(...slab(view, lift(shape), 0.2, color, { at, rotation: 0.3 }));
  }
  return shapes;
}

function roundTree(view: View, at: V3, height: number, color: string): Shape[] {
  return [
    groundShadow(view, at, 0.3),
    ...cylinder(view, 0.07 * height, height * 0.5, P.orange[700], { at }, 8),
    ...blob(view, [at[0] - 0.08, at[1], at[2] + height * 0.72], height * 0.3, color).map((s) => ({
      ...s,
      depth: s.depth + 0.01,
    })),
    ...blob(view, [at[0] + 0.12, at[1] - 0.05, at[2] + height * 0.86], height * 0.24, color).map(
      (s) => ({ ...s, depth: s.depth + 0.02 }),
    ),
  ];
}

function dice(view: View, at: V3, rotation: number, pips: 1 | 2 | 3): Shape[] {
  const shapes = box(view, [0.46, 0.46, 0.46], P.gray[100], { at, rotation });
  const offsets: V2[] =
    pips === 1
      ? [[0, 0]]
      : pips === 2
        ? [
            [-0.1, -0.1],
            [0.1, 0.1],
          ]
        : [
            [-0.11, -0.11],
            [0, 0],
            [0.11, 0.11],
          ];
  for (const [dx, dy] of offsets) {
    const [cx, cy] = project(view, [at[0] + dx, at[1] + dy, at[2] + 0.47]);
    shapes.push({
      d: ellipse(cx, cy, 2.4, 1.8),
      fill: P.gray[800],
      depth: depthOf(view, at) + 0.03,
    });
  }
  return shapes;
}

/** Boulier : cadre en bois et rangées de perles colorées. */
function abacus(view: View, at: V3, rotation: number): Shape[] {
  const shapes: Shape[] = [groundShadow(view, at, 0.55)];
  const W = 0.62;
  const H = 1.0;
  const bars: V2[][] = [
    [
      [-W, 0],
      [-W + 0.1, 0],
      [-W + 0.1, H],
      [-W, H],
    ],
    [
      [W - 0.1, 0],
      [W, 0],
      [W, H],
      [W - 0.1, H],
    ],
    [
      [-W, H - 0.1],
      [W, H - 0.1],
      [W, H],
      [-W, H],
    ],
    [
      [-W, 0.05],
      [W, 0.05],
      [W, 0.15],
      [-W, 0.15],
    ],
  ];
  for (const bar of bars) shapes.push(...slab(view, bar, 0.12, P.orange[500], { at, rotation }));
  const colors = [P.blue[400], P.violet[400], P.cyan[400], P.orange[300]];
  const c = Math.cos(rotation);
  const s = Math.sin(rotation);
  for (let row = 0; row < 4; row++) {
    const z = 0.28 + row * 0.18;
    for (let k = 0; k < 4; k++) {
      const x = -0.38 + k * 0.17 + (row % 2) * 0.12;
      shapes.push(
        ...blob(view, [at[0] + x * c, at[1] + x * s - 0.07, at[2] + z], 0.075, colors[row]!).map(
          (sh) => ({ ...sh, depth: depthOf(view, at) + 0.05 }),
        ),
      );
    }
  }
  return shapes;
}

/** Grue en règles : mât debout, flèche couchée, hauban et équerre suspendue. */
function crane(view: View): Shape[] {
  const shapes: Shape[] = [];
  const foot: V3 = [1.25, 1.35, 0];
  const rot = 0.25;
  const c = Math.cos(rot);
  const s = Math.sin(rot);
  shapes.push(groundShadow(view, foot, 0.5));
  shapes.push(
    ...ruler(
      view,
      [
        [-0.18, 0],
        [0.18, 0],
        [0.18, 2.9],
        [-0.18, 2.9],
      ],
      foot,
      rot,
      'z',
    ),
  );
  shapes.push(
    ...ruler(
      view,
      [
        [-2.3, 2.62],
        [0.55, 2.62],
        [0.55, 2.95],
        [-2.3, 2.95],
      ],
      [foot[0], foot[1] - 0.12, foot[2]],
      rot,
      'x',
    ).map((sh) => ({ ...sh, depth: sh.depth + 0.2 })),
  );
  const hookTop: V3 = [foot[0] - 2.05 * c, foot[1] - 2.05 * s - 0.14, 2.62];
  const hookBottom: V3 = [hookTop[0], hookTop[1], 1.45];
  const front = depthOf(view, foot);
  shapes.push({
    d: segment(view, hookTop, hookBottom),
    fill: 'none',
    stroke: P.gray[700],
    strokeWidth: 1.6,
    depth: front + 0.25,
  });
  shapes.push({
    d: segment(
      view,
      [foot[0] + 0.5 * c, foot[1] + 0.5 * s - 0.14, 2.9],
      [foot[0], foot[1] - 0.1, 1.7],
    ),
    fill: 'none',
    stroke: P.gray[700],
    strokeWidth: 1.4,
    depth: front + 0.25,
  });
  const square: V2[] = [
    [-0.35, -0.55],
    [0.35, -0.55],
    [0, 0],
  ];
  shapes.push(
    ...slab(view, square, 0.1, P.cyan[400], { at: hookBottom, rotation: rot }).map((sh) => ({
      ...sh,
      depth: front + 0.3,
    })),
  );
  return shapes;
}

function protractor(view: View, at: V3, rotation: number): Shape[] {
  const half: V2[] = Array.from({ length: 25 }, (_, i) => {
    const a = (i / 24) * Math.PI;
    return [Math.cos(a) * 1.15, Math.sin(a) * 1.15];
  });
  const shapes = [
    groundShadow(view, at, 0.9),
    ...slab(view, half, 0.14, P.violet[300], { at, rotation }),
  ];
  const c = Math.cos(rotation);
  const s = Math.sin(rotation);
  for (let k = 1; k < 18; k++) {
    const a = (k / 18) * Math.PI;
    const point = (r: number): V3 => [
      at[0] + Math.cos(a) * r * c,
      at[1] + Math.cos(a) * r * s - 0.08,
      Math.sin(a) * r,
    ];
    shapes.push({
      d: segment(view, point(1.13), point(k % 3 ? 1.02 : 0.92)),
      fill: 'none',
      stroke: P.violet[700],
      strokeWidth: 0.9,
      depth: depthOf(view, at) + 0.03,
    });
  }
  return shapes;
}

function compass(view: View, at: V3, rotation: number): Shape[] {
  const legs: V2[][] = [
    [
      [-0.7, 0],
      [-0.58, 0],
      [0.04, 1.8],
      [-0.04, 1.8],
    ],
    [
      [0.58, 0],
      [0.7, 0],
      [0.04, 1.8],
      [-0.04, 1.8],
    ],
  ];
  return [
    ...legs.flatMap((leg) => slab(view, leg, 0.1, P.gray[500], { at, rotation })),
    ...blob(view, [at[0], at[1], 1.85], 0.15, P.violet[500]).map((sh) => ({
      ...sh,
      depth: sh.depth + 0.1,
    })),
  ];
}

function flowers(view: View): Shape[] {
  const colors = [P.gray[100], P.orange[300], P.violet[200]];
  return Array.from({ length: 36 }, (_, i) => {
    const a = (i * 2.618) % (Math.PI * 2);
    const rr = 0.6 + (((i * 53) % 89) / 89) * 2.2;
    const p: V3 = [Math.cos(a) * rr, Math.sin(a) * rr, 0.02];
    const [cx, cy] = project(view, p);
    const color = colors[i % 3]!;
    return {
      d: ellipse(cx, cy, 2, 1.6),
      fill: color,
      stroke: ink(color),
      strokeWidth: 0.6,
      depth: depthOf(view, p) - 0.3,
    };
  });
}

function props(view: View): Shape[] {
  const at = (x: number, y: number, z = 0): V3 => [x, y, z];
  const pyramids: [number, number, number, number, string][] = [
    [0.35, -1.05, 0.95, 0.95, P.orange[300]],
    [-0.35, -2.0, 0.7, 0.7, P.blue[400]],
    [1.85, -0.55, 0.62, 0.7, P.violet[400]],
  ];
  return [
    ...protractor(view, at(-0.2, 2.35), -0.1),
    ...crane(view),
    ...compass(view, at(2.3, 0.45), -0.5),
    ...pyramids.flatMap(([x, y, b, h, color]) => [
      groundShadow(view, at(x + 0.1, y - 0.08), b * 0.6),
      ...pyramid(view, b, h, color, { at: at(x, y), rotation: 0.4 }),
    ]),
    groundShadow(view, at(1.3, -1.6), 0.3),
    ...dice(view, at(1.25, -1.55), 0.5, 3),
    groundShadow(view, at(-1.35, -0.45), 0.3),
    ...dice(view, at(-1.4, -0.4), 0.2, 2),
    ...abacus(view, at(-2.45, -0.45), 0.9),
    groundShadow(view, at(0.9, 0.35), 0.18),
    ...blob(view, at(0.85, 0.4, 0.17), 0.17, P.violet[500]),
    ...signTree(view, at(-2.3, 0.75), '+', P.green[600]),
    ...signTree(view, at(2.35, -1.3), '×', P.violet[500], 0.45),
    ...signTree(view, at(0.7, -2.4), '÷', P.cyan[600], 0.45),
    ...roundTree(view, at(-1.7, 2.15), 0.9, P.green[700]),
    ...roundTree(view, at(2.2, 1.6), 0.8, P.green[600]),
    ...roundTree(view, at(-1.9, -1.45), 0.75, P.green[700]),
    ...flowers(view),
  ];
}

/** Toute l'île, triée du fond vers l'avant. */
export function drawMathsIsland(view: View = ISLAND_VIEW): Shape[] {
  const shapes = [...base(view), ...cliff(view), ...grass(view), ...water(view), ...props(view)];
  return shapes.sort((a, b) => a.depth - b.depth);
}
