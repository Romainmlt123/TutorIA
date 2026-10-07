import type { Expression } from './expression';

/*
 * Géométrie des visuels du tuteur (fonctions pures) : graduations d'un repère, courbes découpées
 * en tracés continus, secteurs d'un diagramme circulaire, figure ramenée à l'écran.
 */

export type Point = { x: number; y: number };

/** Graduations « rondes » (pas de 1, 2 ou 5 × 10ⁿ) entre deux bornes, au plus `count` environ. */
export function niceTicks(min: number, max: number, count = 6): number[] {
  const span = max - min;
  if (!(span > 0) || !Number.isFinite(span)) return [];
  const raw = span / count;
  const magnitude = 10 ** Math.floor(Math.log10(raw));
  const step = [1, 2, 5, 10].map((m) => m * magnitude).find((s) => s >= raw) ?? 10 * magnitude;
  // Arrondi au pas (0,1 × 3 donne 0,3, pas 0,30000000000000004) ; jamais de « -0 ».
  const decimals = Math.max(0, -Math.floor(Math.log10(step)));
  const ticks: number[] = [];
  for (let n = Math.ceil(min / step); n * step <= max + step * 1e-9; n++) {
    ticks.push(Number((n * step).toFixed(decimals)) || 0);
  }
  return ticks;
}

/** Passage du repère (unités) à l'écran (pixels), l'axe des y vers le haut. */
export function graphScale(
  xRange: readonly [number, number],
  yRange: readonly [number, number],
  width: number,
  height: number,
) {
  const [x0, x1] = xRange;
  const [y0, y1] = yRange;
  return {
    x: (x: number) => ((x - x0) / (x1 - x0)) * width,
    y: (y: number) => height - ((y - y0) / (y1 - y0)) * height,
  };
}

/**
 * Courbe échantillonnée, coupée en tracés continus là où elle n'existe pas (racine d'un négatif,
 * division par zéro) ou sort largement du repère. Points en unités du repère.
 */
export function sampleCurve(
  f: Expression,
  xRange: readonly [number, number],
  yRange: readonly [number, number],
  samples = 160,
): Point[][] {
  const [x0, x1] = xRange;
  const [y0, y1] = yRange;
  const margin = (y1 - y0) * 2;
  const runs: Point[][] = [];
  let run: Point[] = [];
  for (let i = 0; i <= samples; i++) {
    const x = x0 + ((x1 - x0) * i) / samples;
    const y = f(x);
    if (Number.isFinite(y) && y >= y0 - margin && y <= y1 + margin) {
      run.push({ x, y });
    } else if (run.length) {
      runs.push(run);
      run = [];
    }
  }
  if (run.length) runs.push(run);
  return runs.filter((r) => r.length > 1);
}

/** Chemin SVG d'un tracé (points déjà à l'écran). */
export function polylinePath(points: readonly Point[]): string {
  return points
    .map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)} ${p.y.toFixed(1)}`)
    .join(' ');
}

export type Slice = { start: number; end: number; share: number };

/** Secteurs d'un diagramme circulaire : angles en radians, à partir du haut, dans le sens horaire. */
export function pieSlices(values: readonly number[]): Slice[] {
  const total = values.reduce((sum, v) => sum + Math.max(0, v), 0);
  if (total <= 0) return [];
  let angle = -Math.PI / 2;
  return values.map((value) => {
    const share = Math.max(0, value) / total;
    const slice = { start: angle, end: angle + share * 2 * Math.PI, share };
    angle = slice.end;
    return slice;
  });
}

/** Chemin SVG d'un secteur de disque. */
export function slicePath(cx: number, cy: number, r: number, slice: Slice): string {
  if (slice.share >= 0.9999) {
    return `M${cx - r} ${cy} A${r} ${r} 0 1 1 ${cx + r} ${cy} A${r} ${r} 0 1 1 ${cx - r} ${cy} Z`;
  }
  const a = { x: cx + r * Math.cos(slice.start), y: cy + r * Math.sin(slice.start) };
  const b = { x: cx + r * Math.cos(slice.end), y: cy + r * Math.sin(slice.end) };
  const large = slice.end - slice.start > Math.PI ? 1 : 0;
  return `M${cx} ${cy} L${a.x.toFixed(1)} ${a.y.toFixed(1)} A${r} ${r} 0 ${large} 1 ${b.x.toFixed(1)} ${b.y.toFixed(1)} Z`;
}

/**
 * Figure ramenée à l'écran : même échelle sur les deux axes (un carré reste un carré), centrée,
 * avec une marge, l'axe des y vers le haut. Les cercles comptent dans l'encombrement.
 */
export function fitFigure(
  points: readonly Point[],
  circles: readonly { center: Point; radius: number }[],
  width: number,
  height: number,
  padding: number,
): (p: Point) => Point {
  const boxes = [
    ...points.map((p) => ({ x0: p.x, x1: p.x, y0: p.y, y1: p.y })),
    ...circles.map((c) => ({
      x0: c.center.x - c.radius,
      x1: c.center.x + c.radius,
      y0: c.center.y - c.radius,
      y1: c.center.y + c.radius,
    })),
  ];
  const minX = Math.min(...boxes.map((b) => b.x0));
  const maxX = Math.max(...boxes.map((b) => b.x1));
  const minY = Math.min(...boxes.map((b) => b.y0));
  const maxY = Math.max(...boxes.map((b) => b.y1));
  const spanX = maxX - minX || 1;
  const spanY = maxY - minY || 1;
  const scale = Math.min((width - 2 * padding) / spanX, (height - 2 * padding) / spanY);
  const offsetX = (width - spanX * scale) / 2;
  const offsetY = (height - spanY * scale) / 2;
  return (p) => ({ x: offsetX + (p.x - minX) * scale, y: height - offsetY - (p.y - minY) * scale });
}

/** Échelle (pixels par unité) d'une figure ramenée à l'écran par `fitFigure`. */
export function figureScale(toScreen: (p: Point) => Point): number {
  const a = toScreen({ x: 0, y: 0 });
  const b = toScreen({ x: 1, y: 0 });
  return Math.abs(b.x - a.x);
}

const unit = (from: Point, to: Point): Point => {
  const length = Math.hypot(to.x - from.x, to.y - from.y) || 1;
  return { x: (to.x - from.x) / length, y: (to.y - from.y) / length };
};

/** Codage d'un angle (à l'écran) : un petit carré pour un angle droit, sinon un arc. */
export function angleMark(
  vertex: Point,
  from: Point,
  to: Point,
  size: number,
  right: boolean,
): string {
  const u = unit(vertex, from);
  const v = unit(vertex, to);
  if (right) {
    const a = { x: vertex.x + u.x * size, y: vertex.y + u.y * size };
    const c = { x: vertex.x + v.x * size, y: vertex.y + v.y * size };
    const b = { x: a.x + v.x * size, y: a.y + v.y * size };
    return `M${a.x.toFixed(1)} ${a.y.toFixed(1)} L${b.x.toFixed(1)} ${b.y.toFixed(1)} L${c.x.toFixed(1)} ${c.y.toFixed(1)}`;
  }
  const start = { x: vertex.x + u.x * size, y: vertex.y + u.y * size };
  const end = { x: vertex.x + v.x * size, y: vertex.y + v.y * size };
  // Sens de l'arc : celui du plus petit angle entre les deux côtés.
  const sweep = u.x * v.y - u.y * v.x > 0 ? 1 : 0;
  return `M${start.x.toFixed(1)} ${start.y.toFixed(1)} A${size} ${size} 0 0 ${sweep} ${end.x.toFixed(1)} ${end.y.toFixed(1)}`;
}

/** Où poser l'étiquette d'un angle : sur la bissectrice, un peu au-delà du codage. */
export function angleLabelAt(vertex: Point, from: Point, to: Point, distance: number): Point {
  const u = unit(vertex, from);
  const v = unit(vertex, to);
  const bisector = unit({ x: 0, y: 0 }, { x: u.x + v.x, y: u.y + v.y });
  return { x: vertex.x + bisector.x * distance, y: vertex.y + bisector.y * distance };
}

/** Où poser le nom d'un point : à l'opposé du centre de la figure, pour ne pas chevaucher ses côtés. */
export function pointLabelAt(point: Point, center: Point, distance: number): Point {
  const away = unit(center, point);
  return { x: point.x + away.x * distance, y: point.y + away.y * distance };
}
