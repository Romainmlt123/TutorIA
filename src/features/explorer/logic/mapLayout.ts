import type { LevelType } from '../content';

/*
 * Disposition de la carte d'une région (X2b), vue de haut : les villes sont posées en serpentin sur
 * une grande île (deux par rangée, une rangée sur deux à l'envers), et les niveaux de chaque ville
 * forment un arc autour de son monument, du côté de la ville précédente au côté de la suivante.
 * Le chemin des niveaux passe ainsi par toutes les villes dans l'ordre du programme.
 * Repère en mètres de la scène : x vers la droite, z vers la caméra (vers le bas de l'écran).
 */

export type Vec = { x: number; z: number };

export const MAP_LAYOUT = {
  /** Demi-écart entre les deux colonnes de villes, et écart entre deux rangées. */
  column: 2.7,
  row: 5,
  /** Distance entre deux niveaux voisins sur l'arc, et rayon minimal (le monument occupe le centre). */
  step: 0.8,
  minRadius: 1.45,
  maxRadius: 2.2,
  /** Marge entre le bord du cercle de niveaux et le bord de la clairière. */
  clearing: 0.6,
  /** Rayon d'un point de niveau (0,26 m, 0,34 m pour une évaluation). */
  nodeRadius: 0.26,
  evaluationRadius: 0.34,
} as const;

export function nodeRadius(type: LevelType): number {
  return type === 'evaluation' ? MAP_LAYOUT.evaluationRadius : MAP_LAYOUT.nodeRadius;
}

/** Emplacement choisi d'une ville sur la carte : son centre, et les détours du chemin depuis la précédente. */
export type CitySite = { center: Vec; via: readonly Vec[] };

export type CityLayout = {
  center: Vec;
  /** Détours du chemin entre la ville précédente et celle-ci (pour contourner l'eau et les repères). */
  via: readonly Vec[];
  /** Rayon de la clairière : cercle de niveaux plus marge. Rien d'autre n'est semé dedans. */
  radius: number;
  /** Un point par niveau, dans l'ordre. */
  nodes: Vec[];
};

/** Centre de la ville de rang i : deux par rangée, en serpentin, avec un léger décalage naturel. */
function cityCenter(i: number, count: number): Vec {
  if (count === 1) return { x: 0, z: 0 };
  const row = Math.floor(i / 2);
  const side = (i % 2 === 0 ? -1 : 1) * (row % 2 === 0 ? 1 : -1);
  return {
    x: side * MAP_LAYOUT.column + 0.45 * Math.sin(i * 2.3 + 0.4),
    z: row * MAP_LAYOUT.row + 0.5 * Math.sin(i * 1.7 + 1),
  };
}

const TAU = Math.PI * 2;

/** Écart d'angle ramené entre -π et π. */
function wrap(angle: number): number {
  return angle - TAU * Math.round(angle / TAU);
}

/**
 * Angle balayé par l'arc de niveaux : du côté de la ville précédente (`from`) à celui de la suivante
 * (`to`), en passant du côté éloigné du chemin direct pour entourer le monument. Quand les deux
 * côtés sont opposés, l'arc passe par l'avant (vers la caméra).
 */
export function sweepBetween(from: number, to: number): number {
  const short = wrap(to - from);
  const long = short - Math.sign(short || 1) * TAU;
  if (Math.abs(Math.abs(short) - Math.PI) > 1e-6)
    return Math.abs(long) > Math.abs(short) ? long : short;
  // Demi-tour exact : on choisit le sens dont le milieu de l'arc est le plus proche de l'avant (+z).
  const middle = (candidate: number) => Math.sin(from + candidate / 2);
  return middle(short) >= middle(-short) ? short : -short;
}

/**
 * Les villes et leurs niveaux placés sur la carte. `cities[i]` donne le type de chaque niveau ; `sites`
 * (facultatif) donne les emplacements choisis, sinon les villes se rangent en serpentin.
 */
export function layoutCities(
  cities: readonly (readonly LevelType[])[],
  sites?: readonly CitySite[],
): CityLayout[] {
  const centers = cities.map((_, i) => sites?.[i]?.center ?? cityCenter(i, cities.length));
  const vias = cities.map((_, i) => sites?.[i]?.via ?? []);
  return cities.map((levels, i) => {
    const center = centers[i]!;
    // On entre du côté du premier détour (ou de la ville précédente), on sort du côté du suivant.
    const before = vias[i]![0] ?? centers[i - 1] ?? { x: center.x - 1, z: center.z };
    const after = vias[i + 1]?.[0] ?? centers[i + 1];
    const fromAngle = Math.atan2(before.z - center.z, before.x - center.x);
    // Dernière ville : le chemin s'arrête face à l'opposé de l'entrée.
    const toAngle = after
      ? Math.atan2(after.z - center.z, after.x - center.x)
      : fromAngle + Math.PI;
    const sweep = sweepBetween(fromAngle, toAngle);
    const count = levels.length;
    const radius = Math.min(
      MAP_LAYOUT.maxRadius,
      Math.max(MAP_LAYOUT.minRadius, ((count - 1) * MAP_LAYOUT.step) / Math.abs(sweep)),
    );
    const nodes = levels.map((_, k) => {
      const angle = fromAngle + (count > 1 ? (sweep * k) / (count - 1) : 0);
      return { x: center.x + radius * Math.cos(angle), z: center.z + radius * Math.sin(angle) };
    });
    return { center, via: vias[i]!, radius: radius + MAP_LAYOUT.clearing, nodes };
  });
}

/** Un point par lequel passe le chemin : `u` = rang du niveau (ou fraction, pour un détour entre deux niveaux). */
export type Anchor = Vec & { u: number };

/** Points du chemin dans l'ordre : les détours de chaque ville, puis ses niveaux. */
export function pathAnchors(layouts: readonly CityLayout[]): Anchor[] {
  const anchors: Anchor[] = [];
  let level = 0;
  for (const city of layouts) {
    city.via.forEach((v, j) =>
      anchors.push({ ...v, u: level - 1 + (j + 1) / (city.via.length + 1) }),
    );
    for (const node of city.nodes) anchors.push({ ...node, u: level++ });
  }
  return anchors;
}

export type PathSample = Vec & {
  /** Rang du niveau précédent le long du chemin, avec la fraction jusqu'au suivant (1,5 = à mi-chemin du 2e au 3e). */
  u: number;
};

const SAMPLES_PER_SEGMENT = 16;

/** Interpolation de Catmull-Rom centripète d'un point entre p1 et p2 (t de 0 à 1). */
function centripetal(p0: Vec, p1: Vec, p2: Vec, p3: Vec, t: number): Vec {
  const knot = (a: Vec, b: Vec, previous: number) =>
    previous + Math.max(Math.hypot(b.x - a.x, b.z - a.z), 1e-6) ** 0.5;
  const t0 = 0;
  const t1 = knot(p0, p1, t0);
  const t2 = knot(p1, p2, t1);
  const t3 = knot(p2, p3, t2);
  const s = t1 + (t2 - t1) * t;
  const mix = (a: Vec, b: Vec, ta: number, tb: number, at: number): Vec => {
    const w = (at - ta) / (tb - ta);
    return { x: a.x + (b.x - a.x) * w, z: a.z + (b.z - a.z) * w };
  };
  const a1 = mix(p0, p1, t0, t1, s);
  const a2 = mix(p1, p2, t1, t2, s);
  const a3 = mix(p2, p3, t2, t3, s);
  const b1 = mix(a1, a2, t0, t2, s);
  const b2 = mix(a2, a3, t1, t3, s);
  return mix(b1, b2, t1, t2, s);
}

/**
 * Chemin lissé qui passe par tous les points, prolongé d'un demi-mètre avant le premier et après le
 * dernier. `u` de chaque échantillon repère sa place entre les niveaux : 0 au premier niveau.
 */
export function smoothPath(points: readonly Anchor[]): PathSample[] {
  const first = points[0]!;
  const last = points[points.length - 1]!;
  const lead = (from: Anchor, toward: Anchor, u: number): Anchor => {
    const length = Math.hypot(toward.x - from.x, toward.z - from.z) || 1;
    return {
      x: from.x + ((from.x - toward.x) / length) * 0.5,
      z: from.z + ((from.z - toward.z) / length) * 0.5,
      u,
    };
  };
  const second = points[1] ?? first;
  const beforeLast = points[points.length - 2] ?? last;
  const anchors = [lead(first, second, first.u - 1), ...points, lead(last, beforeLast, last.u + 1)];
  const samples: PathSample[] = [];
  for (let i = 0; i < anchors.length - 1; i++) {
    const at = (k: number) => anchors[Math.min(Math.max(k, 0), anchors.length - 1)]!;
    const [a, b] = [anchors[i]!, anchors[i + 1]!];
    for (let s = 0; s < SAMPLES_PER_SEGMENT; s++) {
      const t = s / SAMPLES_PER_SEGMENT;
      samples.push({ ...centripetal(at(i - 1), a, b, at(i + 2), t), u: a.u + (b.u - a.u) * t });
    }
  }
  const end = anchors[anchors.length - 1]!;
  samples.push({ x: end.x, z: end.z, u: end.u });
  return samples;
}
