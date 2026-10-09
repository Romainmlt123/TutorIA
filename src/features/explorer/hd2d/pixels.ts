import { explorerArt } from '@/theme/explorerArt';

/*
 * Pixel art d'Explorer (HD-2D) : une toile de pixels RGBA, dessinée par du code (formes pleines,
 * rampes de teintes de la palette, tramage) puis contournée d'un pixel sombre. Les couleurs
 * viennent toutes de la palette Tutor'IA. Module pur : aucune dépendance à three.js.
 */

export type RGBA = readonly [number, number, number, number];

export function rgba(hex: string, alpha = 255): RGBA {
  const h = hex.replace('#', '');
  return [
    parseInt(h.slice(0, 2), 16),
    parseInt(h.slice(2, 4), 16),
    parseInt(h.slice(4, 6), 16),
    alpha,
  ];
}

/**
 * Rampes de teintes du monde d'Explorer (de la plus sombre à la plus claire), tirées de la palette
 * propre au monde (src/theme/explorerArt.ts), plus riche que celle de la marque.
 */
export const RAMPS = explorerArt.ramps;

export type RampName = keyof typeof RAMPS;

/** Ton `i` d'une rampe, borné (0 = le plus sombre). */
export function tone(ramp: RampName, i: number): string {
  const r = RAMPS[ramp];
  return r[Math.max(0, Math.min(r.length - 1, Math.round(i)))]!;
}

/** Tramage ordonné 4 × 4 (Bayer) : mélange deux tons en motif régulier, typique du pixel art. */
const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];
export function dither(x: number, y: number, t: number): boolean {
  return t * 16 > BAYER[(y & 3) * 4 + (x & 3)]!;
}

/** Générateur pseudo-aléatoire reproductible. */
export function seeded(seed: number): () => number {
  let s = seed >>> 0 || 1;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

export class PixelCanvas {
  readonly width: number;
  readonly height: number;
  readonly data: Uint8Array;

  /** Dimensions arrondies au pixel : une toile a toujours un nombre entier de pixels. */
  constructor(width: number, height: number) {
    this.width = Math.max(1, Math.round(width));
    this.height = Math.max(1, Math.round(height));
    this.data = new Uint8Array(this.width * this.height * 4);
  }

  inside(x: number, y: number): boolean {
    return x >= 0 && y >= 0 && x < this.width && y < this.height;
  }

  get(x: number, y: number): RGBA | null {
    if (!this.inside(x, y)) return null;
    const i = (y * this.width + x) * 4;
    return this.data[i + 3]
      ? [this.data[i]!, this.data[i + 1]!, this.data[i + 2]!, this.data[i + 3]!]
      : null;
  }

  set(x: number, y: number, color: string | RGBA): void {
    const xi = Math.floor(x);
    const yi = Math.floor(y);
    if (!this.inside(xi, yi)) return;
    const c = typeof color === 'string' ? rgba(color) : color;
    const i = (yi * this.width + xi) * 4;
    this.data[i] = c[0];
    this.data[i + 1] = c[1];
    this.data[i + 2] = c[2];
    this.data[i + 3] = c[3];
  }

  rect(
    x: number,
    y: number,
    w: number,
    h: number,
    color: string | ((x: number, y: number) => string | null),
  ) {
    for (let j = Math.floor(y); j < y + h; j++) {
      for (let i = Math.floor(x); i < x + w; i++) {
        const c = typeof color === 'string' ? color : color(i, j);
        if (c) this.set(i, j, c);
      }
    }
  }

  /** Polygone plein (règle pair-impair), avec une couleur fixe ou calculée par pixel. */
  polygon(
    points: readonly (readonly [number, number])[],
    color: string | ((x: number, y: number) => string | null),
  ) {
    const ys = points.map((p) => p[1]);
    for (let y = Math.floor(Math.min(...ys)); y <= Math.ceil(Math.max(...ys)); y++) {
      const cy = y + 0.5;
      const xs: number[] = [];
      for (let k = 0; k < points.length; k++) {
        const [ax, ay] = points[k]!;
        const [bx, by] = points[(k + 1) % points.length]!;
        if ((ay <= cy && by > cy) || (by <= cy && ay > cy))
          xs.push(ax + ((cy - ay) / (by - ay)) * (bx - ax));
      }
      xs.sort((a, b) => a - b);
      for (let k = 0; k + 1 < xs.length; k += 2) {
        for (let x = Math.round(xs[k]!); x < Math.round(xs[k + 1]!); x++) {
          const c = typeof color === 'string' ? color : color(x, y);
          if (c) this.set(x, y, c);
        }
      }
    }
  }

  circle(
    cx: number,
    cy: number,
    r: number,
    color: string | ((x: number, y: number) => string | null),
  ) {
    for (let y = Math.floor(cy - r); y <= Math.ceil(cy + r); y++) {
      for (let x = Math.floor(cx - r); x <= Math.ceil(cx + r); x++) {
        if ((x + 0.5 - cx) ** 2 + (y + 0.5 - cy) ** 2 <= r * r) {
          const c = typeof color === 'string' ? color : color(x, y);
          if (c) this.set(x, y, c);
        }
      }
    }
  }

  line(x0: number, y0: number, x1: number, y1: number, color: string) {
    let x = Math.round(x0);
    let y = Math.round(y0);
    const xe = Math.round(x1);
    const ye = Math.round(y1);
    const dx = Math.abs(xe - x);
    const dy = -Math.abs(ye - y);
    const sx = x < xe ? 1 : -1;
    const sy = y < ye ? 1 : -1;
    let err = dx + dy;
    for (;;) {
      this.set(x, y, color);
      if (x === xe && y === ye) break;
      const e2 = 2 * err;
      if (e2 >= dy) {
        err += dy;
        x += sx;
      }
      if (e2 <= dx) {
        err += dx;
        y += sy;
      }
    }
  }

  /**
   * Contour d'un pixel autour de la silhouette : chaque pixel vide voisin d'un pixel plein prend
   * une teinte très sombre de ce voisin (trait d'encre coloré, comme en pixel art soigné).
   */
  outline(darken = 0.3): this {
    const source = new Uint8Array(this.data);
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        const i = (y * this.width + x) * 4;
        if (source[i + 3]) continue;
        for (const [dx, dy] of [
          [1, 0],
          [-1, 0],
          [0, 1],
          [0, -1],
        ] as const) {
          const nx = x + dx;
          const ny = y + dy;
          if (!this.inside(nx, ny)) continue;
          const j = (ny * this.width + nx) * 4;
          if (!source[j + 3]) continue;
          this.set(x, y, [
            source[j]! * darken,
            source[j + 1]! * darken,
            source[j + 2]! * darken + 12,
            255,
          ]);
          break;
        }
      }
    }
    return this;
  }
}
