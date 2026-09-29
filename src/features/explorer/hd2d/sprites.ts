import { theme } from '@/theme';

import { dither, PixelCanvas, seeded, tone, type RampName } from './pixels';

/*
 * Sprites en pixel art de l'île des Maths (HD-2D), en haute définition : 32 pixels = 1 unité du
 * monde 3D. Chaque objet est décrit en formes simples (coordonnées « dessin », multipliées par K),
 * puis ombré au pixel : relief en bloc (flanc sombre décalé), biseau clair en haut à gauche,
 * reflet, tramage entre deux tons, et contour d'un pixel sombre.
 */

/** Finesse : pixels de sprite par pixel de dessin. */
const K = 2;
export const PIXELS_PER_UNIT = 16 * K;

export type Sprite = {
  canvas: PixelCanvas;
  /** Point d'ancrage au sol, en pixels depuis le bas. */
  baseline: number;
};

type Pt = readonly [number, number];
type Paint = string | ((x: number, y: number) => string | null);

/** Crayon « dessin » : mêmes formes que la toile, coordonnées multipliées par K. */
class Pen {
  constructor(readonly canvas: PixelCanvas) {}
  rect(x: number, y: number, w: number, h: number, paint: Paint) {
    this.canvas.rect(x * K, y * K, w * K, h * K, paint);
  }
  polygon(points: readonly Pt[], paint: Paint) {
    this.canvas.polygon(
      points.map(([x, y]) => [x * K, y * K] as const),
      paint,
    );
  }
  circle(cx: number, cy: number, r: number, paint: Paint) {
    this.canvas.circle(cx * K, cy * K, r * K, paint);
  }
  /** Trait de K pixels d'épaisseur. */
  line(x0: number, y0: number, x1: number, y1: number, color: string) {
    for (let d = 0; d < K; d++) this.canvas.line(x0 * K + d, y0 * K, x1 * K + d, y1 * K, color);
  }
  dot(x: number, y: number, color: string) {
    this.canvas.set(x, y, color);
  }
}

function canvasOf(w: number, h: number) {
  return new PixelCanvas(w * K, h * K);
}

type Mask = (x: number, y: number) => boolean;

function maskOf(w: number, h: number, draw: (pen: Pen) => void): Mask {
  const c = canvasOf(w, h);
  draw(new Pen(c));
  return (x, y) => c.get(x, y) !== null;
}

const MARK = theme.colors.surface;

/**
 * Ombre une silhouette : bord clair en haut à gauche (sur 2K pixels), bord sombre en bas à droite,
 * intérieur tramé du haut vers le bas, et reflet brillant au coin supérieur gauche.
 */
function bevel(canvas: PixelCanvas, mask: Mask, ramp: RampName, base = 3, dx = 0, dy = 0) {
  const w = canvas.width;
  const h = canvas.height;
  const depthTo = (x: number, y: number, sx: number, sy: number) => {
    for (let d = 1; d <= 2 * K; d++) if (!mask(x + sx * d, y + sy * d)) return d;
    return 99;
  };
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      if (!mask(x, y)) continue;
      const light = Math.min(depthTo(x, y, 0, -1), depthTo(x, y, -1, 0));
      const dark = Math.min(depthTo(x, y, 0, 1), depthTo(x, y, 1, 0));
      let t = base;
      if (light <= K) t = base + 2;
      else if (light <= 2 * K) t = base + 1;
      else if (dark <= K) t = base - 2;
      else if (dark <= 2 * K) t = base - 1;
      else if (dither(x, y, y / h)) t = base - 0.6;
      canvas.set(x + dx, y + dy, tone(ramp, t));
    }
  }
}

/** Glyphe en bloc : flanc sombre décalé (volume), face avant biseautée, reflet. */
function block(
  w: number,
  h: number,
  ramp: RampName,
  draw: (pen: Pen) => void,
  depth = 2,
): PixelCanvas {
  const canvas = canvasOf(w + depth, h + depth);
  const mask = maskOf(w + depth, h + depth, draw);
  const side = depth * K;
  for (let y = 0; y < canvas.height; y++) {
    for (let x = 0; x < canvas.width; x++) {
      for (let d = side; d >= 1; d--) {
        if (mask(x - d, y - d)) {
          canvas.set(x, y, tone(ramp, d > side / 2 ? 0 : 1));
          break;
        }
      }
    }
  }
  bevel(canvas, mask, ramp, 3);
  // Reflet : une petite barre claire près du coin supérieur gauche de chaque masse.
  for (let y = 0; y < canvas.height; y++) {
    for (let x = 0; x < canvas.width; x++) {
      if (mask(x, y) && !mask(x - K * 2, y) && !mask(x, y - K * 2) && mask(x + K * 3, y + K * 3)) {
        canvas.set(x + K, y + K, tone(ramp, 5));
        canvas.set(x + K + 1, y + K, tone(ramp, 5));
      }
    }
  }
  return canvas;
}

function copyInto(target: PixelCanvas, source: PixelCanvas, ox: number, oy: number) {
  for (let y = 0; y < source.height; y++) {
    for (let x = 0; x < source.width; x++) {
      const p = source.get(x, y);
      if (p) target.set(x + ox, y + oy, p);
    }
  }
}

/** Petite police 3 × 5 (chiffres) pour les graduations et la cascade. */
const FONT: Record<string, string[]> = {
  '0': ['111', '101', '101', '101', '111'],
  '1': ['010', '110', '010', '010', '111'],
  '2': ['111', '001', '111', '100', '111'],
  '3': ['111', '001', '011', '001', '111'],
  '4': ['101', '101', '111', '001', '001'],
  '5': ['111', '100', '111', '001', '111'],
  '6': ['111', '100', '111', '101', '111'],
  '7': ['111', '001', '010', '010', '010'],
  '8': ['111', '101', '111', '101', '111'],
  '9': ['111', '101', '111', '001', '111'],
};

/** Écrit un nombre en pixels fins (non multipliés), à la position donnée. */
function write(canvas: PixelCanvas, text: string, x: number, y: number, color: string) {
  [...text].forEach((ch, i) => {
    FONT[ch]?.forEach((row, ry) => {
      [...row].forEach((bit, rx) => {
        if (bit === '1') canvas.set(x + i * 4 + rx, y + ry, color);
      });
    });
  });
}

// ---------------------------------------------------------------------------
// Arbres
// ---------------------------------------------------------------------------

/** Tronc avec écorce, évasé au pied, et touffe d'herbe. */
function trunk(pen: Pen, cx: number, top: number, bottom: number) {
  pen.polygon(
    [
      [cx - 1.6, top],
      [cx + 1.6, top],
      [cx + 2.4, bottom],
      [cx - 2.4, bottom],
    ],
    (x) => tone('wood', x < cx * K - 1 ? 3 : x > cx * K + 1 ? 1 : 2),
  );
  for (let y = top + 2; y < bottom - 1; y += 3)
    pen.line(cx - 0.5, y, cx - 0.5, y + 1, tone('wood', 0));
  for (const [ox, h] of [
    [-4, 3],
    [-2, 4],
    [2, 3.5],
    [4, 2.5],
  ] as const) {
    pen.line(cx + ox, bottom, cx + ox * 0.8, bottom - h, tone('green', 4));
  }
}

/** Arbre rond : feuillage festonné en grappes, ombré par la lumière, feuilles claires. */
export function roundTree(seed: number): Sprite {
  const c = canvasOf(26, 32);
  const pen = new Pen(c);
  const rand = seeded(seed);
  trunk(pen, 13, 18, 32);
  const clusters: [number, number, number][] = [
    [13, 11, 8.5],
    [6.5, 14, 5.5],
    [19.5, 14, 5.5],
    [9, 6.5, 5],
    [17, 7, 5],
  ];
  for (let k = 0; k < 10; k++) {
    const a = (k / 10) * Math.PI * 2;
    clusters.push([13 + Math.cos(a) * 8.5, 12 + Math.sin(a) * 6.5, 2.6 + rand()]);
  }
  for (const [bx, by, r] of clusters) {
    pen.circle(bx, by, r, (x, y) => {
      const dx = (x / K - bx) / r;
      const dy = (y / K - by) / r;
      const light = -dx * 0.55 - dy * 0.85;
      return tone('green', 3 + light * 1.7 + (dither(x, y, 0.5) ? 0.35 : -0.35));
    });
  }
  for (let k = 0; k < 40; k++) {
    const x = Math.floor((4 + rand() * 18) * K);
    const y = Math.floor((3 + rand() * 13) * K);
    if (c.get(x, y) && c.get(x + 1, y)) {
      c.set(x, y, tone('green', 5));
      c.set(x + 1, y, tone('green', 5));
      c.set(x, y + 1, tone('green', 2));
    }
  }
  return { canvas: c.outline(), baseline: 0 };
}

/** Arbre-signe (+, ×, ÷) : tronc et signe en bloc, avec un reflet. */
export function signTree(sign: '+' | '×' | '÷', ramp: RampName): Sprite {
  const c = canvasOf(26, 34);
  const pen = new Pen(c);
  trunk(pen, 12, 19, 34);
  const glyph = block(24, 22, ramp, (p) => {
    if (sign === '+') {
      p.rect(9, 1, 6, 19, MARK);
      p.rect(2, 7.5, 20, 6, MARK);
    } else if (sign === '×') {
      p.polygon(
        [
          [3, 5],
          [7, 1],
          [21, 15],
          [17, 19],
        ],
        MARK,
      );
      p.polygon(
        [
          [17, 1],
          [21, 5],
          [7, 19],
          [3, 15],
        ],
        MARK,
      );
    } else {
      p.rect(2, 8.5, 20, 4, MARK);
      p.circle(12, 3.8, 3.2, MARK);
      p.circle(12, 17.2, 3.2, MARK);
    }
  });
  copyInto(c, glyph, 0, 0);
  return { canvas: c.outline(), baseline: 0 };
}

// ---------------------------------------------------------------------------
// Objets de maths
// ---------------------------------------------------------------------------

/** π en bloc, debout. */
export function piSprite(): Sprite {
  const g = block(30, 26, 'blue', (p) => {
    p.polygon(
      [
        [1, 3],
        [3, 1],
        [29, 1],
        [29, 7],
        [1, 7],
      ],
      MARK,
    );
    p.polygon(
      [
        [7, 7],
        [12, 7],
        [11, 20],
        [9, 25],
        [4, 25],
        [7, 19],
      ],
      MARK,
    );
    p.polygon(
      [
        [17, 7],
        [22, 7],
        [22, 20],
        [24, 21],
        [27, 19],
        [28, 23],
        [24, 26],
        [19, 25],
        [17, 21],
      ],
      MARK,
    );
  });
  return { canvas: g.outline(), baseline: 0 };
}

/** Pyramide : face éclairée, face à l'ombre, arête brillante, joints de pierre. */
export function pyramidSprite(ramp: RampName, size = 20): Sprite {
  const h = size * 0.85;
  const c = canvasOf(size + 2, h + 2);
  const pen = new Pen(c);
  const apex: Pt = [size * 0.45 + 1, 1];
  const left: Pt = [1, h];
  const right: Pt = [size + 1, h - 3];
  const front: Pt = [size * 0.55 + 1, h + 1];
  pen.polygon([apex, left, front], (x, y) => tone(ramp, dither(x, y, 0.3) ? 4 : 5));
  pen.polygon([apex, front, right], (x, y) => tone(ramp, dither(x, y, 0.45) ? 2 : 3));
  for (let k = 1; k < 5; k++) {
    const t = k / 5;
    const y = apex[1] + (h - apex[1]) * t;
    pen.line(
      apex[0] - (apex[0] - left[0]) * t + 1,
      y,
      apex[0] + (front[0] - apex[0]) * t - 0.5,
      y + t,
      tone(ramp, 3),
    );
  }
  pen.line(apex[0], apex[1], front[0], front[1], tone(ramp, 5));
  return { canvas: c.outline(), baseline: K };
}

/** Dé en perspective : faces arrondies et points ronds. */
export function diceSprite(pips: 2 | 3): Sprite {
  const c = canvasOf(16, 16);
  const pen = new Pen(c);
  pen.polygon(
    [
      [8, 1],
      [15, 4],
      [8, 7],
      [1, 4],
    ],
    (x, y) => tone('white', dither(x, y, 0.2) ? 4 : 5),
  );
  pen.polygon(
    [
      [1, 4],
      [8, 7],
      [8, 15],
      [1, 12],
    ],
    tone('white', 4),
  );
  pen.polygon(
    [
      [8, 7],
      [15, 4],
      [15, 12],
      [8, 15],
    ],
    (x, y) => tone('white', dither(x, y, 0.4) ? 2 : 3),
  );
  const ink = tone('rock', 0);
  const top: Pt[] =
    pips === 2
      ? [
          [6, 4],
          [10, 4],
        ]
      : [
          [5, 4],
          [8, 4],
          [11, 4],
        ];
  for (const [x, y] of top) pen.circle(x, y, 0.9, ink);
  for (const [x, y] of [
    [4.5, 9.5],
    [11.5, 7.5],
    [11.5, 11.5],
  ] as const) {
    pen.circle(x, y, 0.9, ink);
  }
  return { canvas: c.outline(), baseline: 0 };
}

/** Rapporteur : demi-disque violet gradué, chiffres, arc intérieur et centre. */
export function protractorSprite(): Sprite {
  const g = block(
    40,
    22,
    'violet',
    (p) => {
      p.circle(20, 21, 19.5, (x, y) => (y <= 20.5 * K ? MARK : null));
    },
    1,
  );
  const cx = 20 * K;
  const cy = 20.5 * K;
  const ink = tone('violet', 0);
  for (let k = 1; k < 36; k++) {
    const a = (k / 36) * Math.PI;
    const len = k % 9 === 0 ? 5 : k % 3 === 0 ? 3.5 : 2;
    const r0 = 18 * K;
    const r1 = (18 - len) * K;
    g.line(
      cx + Math.cos(a) * r0,
      cy - Math.sin(a) * r0,
      cx + Math.cos(a) * r1,
      cy - Math.sin(a) * r1,
      ink,
    );
  }
  for (const [deg, label] of [
    [150, '30'],
    [90, '90'],
    [30, '150'],
  ] as const) {
    const a = (deg * Math.PI) / 180;
    write(
      g,
      label,
      cx + Math.cos(a) * 12 * K - label.length * 2,
      cy - Math.sin(a) * 12 * K - 2,
      ink,
    );
  }
  const pen = new Pen(g);
  pen.circle(20, 20.5, 6, (x, y) => (y <= cy ? tone('violet', 5) : null));
  pen.circle(20, 20.5, 3.5, (x, y) => (y <= cy ? tone('violet', 2) : null));
  return { canvas: g.outline(), baseline: 0 };
}

/** Compas ouvert : jambes métalliques, charnière vissée, pointe et crayon. */
export function compassSprite(): Sprite {
  const c = canvasOf(24, 36);
  const pen = new Pen(c);
  const legs: [number, number][] = [
    [3, 33],
    [21, 33],
  ];
  for (const [x1, y1] of legs) {
    pen.polygon(
      [
        [11, 5],
        [13, 5],
        [x1 + 1, y1],
        [x1 - 1, y1],
      ],
      (x) => tone('rock', x < (x1 < 12 ? 7 : 16) * K ? 5 : 3),
    );
  }
  pen.polygon(
    [
      [2, 33],
      [4, 33],
      [3, 36],
    ],
    tone('rock', 0),
  );
  pen.polygon(
    [
      [19.5, 31],
      [22.5, 31],
      [22, 34],
      [20, 34],
    ],
    tone('wood', 4),
  );
  pen.polygon(
    [
      [20, 34],
      [22, 34],
      [21, 36],
    ],
    tone('rock', 1),
  );
  pen.circle(12, 5.5, 3.8, (x, y) => tone('violet', x < 11 * K && y < 5 * K ? 5 : 3));
  pen.circle(12, 5.5, 1.2, tone('rock', 5));
  pen.rect(11, 0, 2, 3, (x) => tone('rock', x < 12 * K ? 5 : 2));
  return { canvas: c.outline(), baseline: 0 };
}

/** Grue en règles : mât et flèche gradués et numérotés, boulons, câble, crochet et équerre. */
export function craneSprite(): Sprite {
  const c = canvasOf(48, 58);
  const pen = new Pen(c);
  const ink = tone('wood', 0);
  pen.rect(36, 4, 7, 54, (x) => tone('wood', x < 37 * K ? 5 : x >= 41 * K ? 2 : 4));
  pen.rect(2, 4, 44, 6, (x, y) => tone('wood', y < 5 * K ? 5 : y >= 8 * K ? 2 : 4));
  for (let k = 0; k < 17; k++) {
    const y = 12 + k * 2.6;
    pen.rect(38, y, k % 5 === 0 ? 3.5 : 2, 0.5, ink);
    if (k % 5 === 0 && k > 0) write(c, String(k / 5), 42 * K - 5, Math.round(y * K) - 2, ink);
  }
  for (let k = 0; k < 16; k++) {
    const x = 4 + k * 2.6;
    pen.rect(x, 5, 0.5, k % 5 === 0 ? 3 : 1.8, ink);
    if (k % 5 === 0 && k > 0) write(c, String(k / 5), Math.round(x * K) - 1, 8 * K - 1, ink);
  }
  for (const [x, y] of [
    [39.5, 7],
    [39.5, 20],
    [5, 7],
  ] as const) {
    pen.circle(x, y, 1, tone('rock', 4));
    c.set(x * K, y * K, tone('rock', 1));
  }
  pen.line(44, 10, 40, 27, tone('rock', 1));
  pen.line(8, 10, 8, 29, tone('rock', 2));
  pen.circle(8, 30, 1.6, (x, y) => (y > 30 * K || x > 8 * K ? tone('rock', 3) : null));
  pen.polygon(
    [
      [8, 31],
      [16, 42],
      [0.5, 42],
    ],
    (x, y) => tone('cyan', y > 40.5 * K || x < 3 * K ? 3 : 4),
  );
  // Évidement de l'équerre.
  for (let y = Math.round(36 * K); y < 40 * K; y++) {
    for (let x = Math.round(5 * K); x < 11 * K; x++) {
      const t = (y - 35.5 * K) / (4.5 * K);
      if (Math.abs(x - 8 * K) < t * 3.4 * K) c.set(x, y, [0, 0, 0, 0]);
    }
  }
  return { canvas: c.outline(), baseline: 0 };
}

/** Boulier : cadre en bois veiné, tiges et perles brillantes. */
export function abacusSprite(): Sprite {
  const c = canvasOf(24, 22);
  const pen = new Pen(c);
  pen.rect(1, 1, 22, 3, (x, y) => tone('wood', y < 2 * K ? 5 : 3));
  pen.rect(1, 18, 22, 3, (x, y) => tone('wood', y < 19 * K ? 4 : 2));
  pen.rect(1, 1, 3, 20, (x) => tone('wood', x < 2 * K ? 5 : 3));
  pen.rect(20, 1, 3, 20, (x) => tone('wood', x > 22 * K ? 2 : 3));
  const ramps: RampName[] = ['blue', 'violet', 'cyan', 'wood'];
  ramps.forEach((ramp, row) => {
    const y = 6.5 + row * 3;
    pen.rect(4, y, 16, 0.5, tone('rock', 3));
    for (let k = 0; k < 4; k++) {
      const x = 6 + k * 3 + (row % 2) * 2.5;
      pen.circle(x, y + 0.25, 1.35, (px, py) => tone(ramp, px < x * K && py < y * K ? 5 : 3));
    }
  });
  return { canvas: c.outline(), baseline: 0 };
}

/** Nuage pixelisé : boules blanches en escalier, ombre bleutée dessous, reflets. */
export function cloudSprite(seed: number): Sprite {
  const c = canvasOf(44, 20);
  const pen = new Pen(c);
  const rand = seeded(seed);
  const puffs: [number, number, number][] = [
    [12, 12, 7],
    [22, 9, 9],
    [32, 12, 7],
    [8 + rand() * 4, 14, 5],
    [26 + rand() * 4, 14, 6],
  ];
  for (const [x0, y0, r] of puffs) {
    pen.circle(x0, y0, r, (x, y) =>
      tone('white', y > 14.5 * K ? 3 : dither(x, y, (y / K - 4) / 14) ? 4 : 5),
    );
  }
  return { canvas: c.outline(0.55), baseline: 0 };
}

/** Chiffre de la cascade : police 3 × 5 agrandie, blanc bordé. */
export function digitSprite(digit: string): Sprite {
  const c = canvasOf(5, 7);
  const pen = new Pen(c);
  (FONT[digit] ?? FONT['0']!).forEach((row, y) => {
    [...row].forEach((bit, x) => {
      if (bit === '1') pen.rect(x + 1, y + 1, 1, 1, tone('white', 5));
    });
  });
  return { canvas: c.outline(0.35), baseline: 0 };
}
