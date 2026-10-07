import { seeded } from '../hd2d/pixels';
import type { PathSample, Vec } from './mapLayout';
import type { RegionMap } from './regionMap';

/*
 * Terrain de la carte d'une région (X2b) : le contour de l'île, et les décors et touffes d'herbe
 * semés dessus, en mètres de la scène (voir `landDiscs`). Tout est calculé ici à partir de la carte ; la scène 3D n'a
 * plus qu'à poser ce qu'on lui donne. Les décors évitent le chemin, les points de niveau et les
 * clairières des villes, où se dressent les monuments.
 */

/** Terre autour de la clairière d'une ville, et de chaque côté du chemin entre les villes (mètres). */
const CLEARING_MARGIN = 0.9;
export const CORRIDOR = 1.5;

/** Disques de terre qui forment l'île : un par ville, et un tous les 0,5 m le long du chemin. */
export type Disc = { x: number; z: number; radius: number };

export function landDiscs(map: RegionMap): Disc[] {
  const cities = map.cities.map((c) => ({ ...c.center, radius: c.radius + CLEARING_MARGIN }));
  let along = 0;
  const corridor: Disc[] = [];
  map.path.forEach((p, i) => {
    const before = map.path[i - 1];
    if (before) along += Math.hypot(p.x - before.x, p.z - before.z);
    if (i === 0 || along >= 0.5) {
      corridor.push({ x: p.x, z: p.z, radius: CORRIDOR });
      along = 0;
    }
  });
  return [...cities, ...corridor];
}

/**
 * Distance signée au bord de l'île, en mètres : négative sur la terre. L'île est l'union des
 * clairières et d'un couloir autour du chemin : elle épouse la carte au lieu de la remplir d'un
 * rectangle, avec du ciel entre les villes.
 */
export function landDistance(discs: readonly Disc[], x: number, z: number): number {
  let best = Infinity;
  for (const d of discs) best = Math.min(best, Math.hypot(d.x - x, d.z - z) - d.radius);
  return best;
}

/** Vrai si le point est sur la terre, au moins à `inset` mètres du bord. */
export function onLand(discs: readonly Disc[], x: number, z: number, inset: number): boolean {
  return landDistance(discs, x, z) <= -inset;
}

/** Rectangle qui contient toute l'île, pour semer au hasard dedans. */
function landBox(discs: readonly Disc[]) {
  return {
    minX: Math.min(...discs.map((d) => d.x - d.radius)),
    maxX: Math.max(...discs.map((d) => d.x + d.radius)),
    minZ: Math.min(...discs.map((d) => d.z - d.radius)),
    maxZ: Math.max(...discs.map((d) => d.z + d.radius)),
  };
}

function anywhere(box: ReturnType<typeof landBox>, random: () => number): Vec {
  return {
    x: box.minX + random() * (box.maxX - box.minX),
    z: box.minZ + random() * (box.maxZ - box.minZ),
  };
}

export type DecorKind = 'rocher-a' | 'rocher-b' | 'cailloux' | 'fleurs' | 'fleurs-b' | 'barriere';

export type Decor = { kind: DecorKind; x: number; z: number; yaw: number; scale: number };

/** Rayon au sol de chaque décor, et nombre pour 100 m² de terre. Pas d'arbre ni de buisson : l'île n'en a pas. */
const DECOR_KINDS: readonly { kind: DecorKind; radius: number; per100m2: number }[] = [
  { kind: 'rocher-a', radius: 0.3, per100m2: 3 },
  { kind: 'rocher-b', radius: 0.35, per100m2: 2 },
  { kind: 'cailloux', radius: 0.2, per100m2: 6 },
  { kind: 'fleurs', radius: 0.14, per100m2: 10 },
  { kind: 'fleurs-b', radius: 0.14, per100m2: 8 },
  { kind: 'barriere', radius: 0.45, per100m2: 3 },
];

/** Distance minimale entre un décor et le chemin (le point de niveau le plus large fait 0,34 m). */
const PATH_CLEARANCE = 0.55;
/** Une barrière longe le chemin à cette distance, et s'aligne sur lui. */
const FENCE_DISTANCE: readonly [number, number] = [0.7, 1.1];

type Nearest = { distance: number; tangent: Vec };

/** Distance au chemin lissé, et direction du chemin à l'endroit le plus proche. */
function nearestOnPath(map: RegionMap, x: number, z: number): Nearest {
  let best = 0;
  let distance = Infinity;
  for (let i = 0; i < map.path.length; i++) {
    const p = map.path[i]!;
    const d = Math.hypot(p.x - x, p.z - z);
    if (d < distance) {
      distance = d;
      best = i;
    }
  }
  const a = map.path[Math.max(best - 1, 0)]!;
  const b = map.path[Math.min(best + 1, map.path.length - 1)]!;
  const length = Math.hypot(b.x - a.x, b.z - a.z) || 1;
  return { distance, tangent: { x: (b.x - a.x) / length, z: (b.z - a.z) / length } };
}

const insideClearing = (map: RegionMap, x: number, z: number, margin: number) =>
  map.cities.some((c) => Math.hypot(c.center.x - x, c.center.z - z) < c.radius + margin);

/** Point à la distance d'une barrière du chemin, d'un côté ou de l'autre. */
function besidePath(map: RegionMap, random: () => number): Vec {
  const i = Math.floor(random() * (map.path.length - 2)) + 1;
  const a = map.path[i - 1]!;
  const b = map.path[i + 1]!;
  const length = Math.hypot(b.x - a.x, b.z - a.z) || 1;
  const side =
    (random() < 0.5 ? -1 : 1) *
    (FENCE_DISTANCE[0] + random() * (FENCE_DISTANCE[1] - FENCE_DISTANCE[0]));
  const p = map.path[i]!;
  return { x: p.x - ((b.z - a.z) / length) * side, z: p.z + ((b.x - a.x) / length) * side };
}

/** Surface de terre estimée (mètres carrés) : le rectangle englobant, par la part qu'en couvrent les disques. */
function landArea(discs: readonly Disc[], box: ReturnType<typeof landBox>): number {
  const random = seeded(99);
  let inside = 0;
  const samples = 400;
  for (let i = 0; i < samples; i++) {
    const p = anywhere(box, random);
    if (onLand(discs, p.x, p.z, 0)) inside++;
  }
  return ((box.maxX - box.minX) * (box.maxZ - box.minZ) * inside) / samples;
}

/** Les décors d'une carte : semés au hasard mais toujours pareil pour une même région. */
export function decorPlan(map: RegionMap, seed: number): Decor[] {
  const discs = landDiscs(map);
  const box = landBox(discs);
  const area = landArea(discs, box);
  const random = seeded(seed);
  const placed: { x: number; z: number; radius: number }[] = [];
  const result: Decor[] = [];
  for (const spec of DECOR_KINDS) {
    const wanted = Math.round((area / 100) * spec.per100m2);
    const isFence = spec.kind === 'barriere';
    let done = 0;
    for (let tries = 0; done < wanted && tries < wanted * 80; tries++) {
      const scale = 0.9 + random() * 0.25;
      const radius = spec.radius * scale;
      const { x, z } = isFence ? besidePath(map, random) : anywhere(box, random);
      if (!onLand(discs, x, z, 0.3 + radius)) continue;
      // Une barrière longe le chemin, y compris autour d'un monument, mais en dehors du cercle des niveaux.
      if (insideClearing(map, x, z, isFence ? -0.1 : radius)) continue;
      const near = nearestOnPath(map, x, z);
      if (near.distance < PATH_CLEARANCE + radius * 0.5) continue;
      if (isFence && (near.distance < FENCE_DISTANCE[0] || near.distance > FENCE_DISTANCE[1]))
        continue;
      if (placed.some((p) => Math.hypot(p.x - x, p.z - z) < p.radius + radius)) continue;
      placed.push({ x, z, radius });
      result.push({
        kind: spec.kind,
        x,
        z,
        yaw: isFence ? -Math.atan2(near.tangent.z, near.tangent.x) : random() * Math.PI * 2,
        scale,
      });
      done++;
    }
  }
  return result;
}

export type Tuft = { x: number; z: number; tall: boolean };

/** Touffes d'herbe par mètre carré de terre. */
const TUFTS_PER_M2 = 7;

/** Touffes d'herbe : sur la terre, hors du chemin, des points de niveau, des monuments et des décors. */
export function grassTufts(map: RegionMap, decor: readonly Decor[], seed: number): Tuft[] {
  const discs = landDiscs(map);
  const box = landBox(discs);
  const random = seeded(seed);
  const wanted = Math.round(landArea(discs, box) * TUFTS_PER_M2);
  const tufts: Tuft[] = [];
  for (let tries = 0; tufts.length < wanted && tries < wanted * 4; tries++) {
    const { x, z } = anywhere(box, random);
    if (!onLand(discs, x, z, 0.15)) continue;
    if (nearestOnPath(map, x, z).distance < 0.22) continue;
    if (map.nodes.some((n) => Math.hypot(n.x - x, n.z - z) < n.radius + 0.05)) continue;
    if (map.cities.some((c) => Math.hypot(c.center.x - x, c.center.z - z) < 0.8)) continue;
    if (decor.some((d) => Math.hypot(d.x - x, d.z - z) < 0.12)) continue;
    tufts.push({ x, z, tall: !onLand(discs, x, z, 0.6) });
  }
  return tufts;
}

/** Cases de la grille du chemin (mètres) : une distance jusqu'à 1,5 m se lit dans les cases voisines. */
const GRID = 1.5;

/**
 * Distance au chemin lissé, rapide (grille des échantillons) : exacte jusqu'à 1,5 m, au-delà la
 * réponse est seulement « plus de 1,5 m ». Sert à trier des milliers de brins d'herbe et de décors.
 */
export function pathDistance(map: RegionMap): (x: number, z: number) => number {
  const cells = new Map<string, PathSample[]>();
  const keyOf = (cx: number, cz: number) => `${cx},${cz}`;
  for (const p of map.path) {
    const key = keyOf(Math.floor(p.x / GRID), Math.floor(p.z / GRID));
    const cell = cells.get(key);
    if (cell) cell.push(p);
    else cells.set(key, [p]);
  }
  return (x, z) => {
    const cx = Math.floor(x / GRID);
    const cz = Math.floor(z / GRID);
    let best = Infinity;
    for (let dx = -1; dx <= 1; dx++) {
      for (let dz = -1; dz <= 1; dz++) {
        for (const p of cells.get(keyOf(cx + dx, cz + dz)) ?? []) {
          best = Math.min(best, Math.hypot(p.x - x, p.z - z));
        }
      }
    }
    return best;
  };
}

/** Décor d'une carte cuite, tel que l'écrit tools/explorer-3d/region_map.py : [sorte, x, z, angle, échelle]. */
export type DecorEntry = readonly [string, number, number, number, number];

const RADIUS = new Map<string, number>(DECOR_KINDS.map((k) => [k.kind, k.radius]));

/**
 * Décors d'une carte cuite : ceux de Blender, qui évitent déjà l'eau, les repères et les villes,
 * moins ceux qui toucheraient le vrai chemin ou un point de niveau (Blender n'en a qu'une idée approchée).
 */
export function placedDecor(map: RegionMap, entries: readonly DecorEntry[]): Decor[] {
  const near = pathDistance(map);
  return entries.flatMap(([kind, x, z, yaw, scale]) => {
    const base = RADIUS.get(kind);
    if (base === undefined) return [];
    const radius = base * scale;
    if (near(x, z) < PATH_CLEARANCE + radius * 0.5) return [];
    if (map.nodes.some((n) => Math.hypot(n.x - x, n.z - z) < n.radius + radius)) return [];
    return [{ kind: kind as DecorKind, x, z, yaw, scale }];
  });
}

/** Demi-largeur du chemin de planches (stylized3d/mapPath.ts) et emprise au sol d'un monument (mètres). */
const PATH_WIDTH_HALF = 0.2;
const MONUMENT_FOOTPRINT = 0.95;

/** Vrai si un brin d'herbe peut pousser là : ni sur le chemin, ni sous un point de niveau ou un monument. */
export function bladeAllowed(map: RegionMap): (x: number, z: number) => boolean {
  const near = pathDistance(map);
  return (x, z) =>
    near(x, z) > PATH_WIDTH_HALF + 0.05 &&
    !map.nodes.some((n) => Math.hypot(n.x - x, n.z - z) < n.radius + 0.04) &&
    !map.cities.some((c) => Math.hypot(c.center.x - x, c.center.z - z) < MONUMENT_FOOTPRINT);
}

/** Touffes d'herbe par mètre carré dans une clairière, et décors semés autour de chaque monument. */
const CLEARING_TUFTS_PER_M2 = 9;
const CLEARING_DECOR: readonly { kind: DecorKind; count: number }[] = [
  { kind: 'fleurs', count: 3 },
  { kind: 'fleurs-b', count: 3 },
  { kind: 'cailloux', count: 2 },
];

/**
 * L'herbe, les fleurs et les galets des clairières, autour des monuments : la carte laisse ailleurs
 * ces endroits vides (place des niveaux et du monument), ce qui faisait « pas fini ». On sème entre
 * l'emprise du monument et le bord de la clairière, sans toucher au chemin ni aux points de niveau.
 */
export function clearingDressing(map: RegionMap, seed: number): { decor: Decor[]; tufts: Tuft[] } {
  const near = pathDistance(map);
  const random = seeded(seed);
  const decor: Decor[] = [];
  const tufts: Tuft[] = [];
  const free = (x: number, z: number, margin: number) =>
    near(x, z) > PATH_WIDTH_HALF + margin &&
    !map.nodes.some((n) => Math.hypot(n.x - x, n.z - z) < n.radius + margin);
  for (const city of map.cities) {
    const inner = MONUMENT_FOOTPRINT + 0.1;
    const outer = city.radius;
    // Un point tiré uniformément dans l'anneau entre le monument et le bord de la clairière.
    const spot = () => {
      const angle = random() * Math.PI * 2;
      const r = Math.sqrt(inner * inner + random() * (outer * outer - inner * inner));
      return { x: city.center.x + Math.cos(angle) * r, z: city.center.z + Math.sin(angle) * r };
    };
    for (const { kind, count } of CLEARING_DECOR) {
      const radius = RADIUS.get(kind) ?? 0.15;
      let done = 0;
      for (let tries = 0; done < count && tries < count * 40; tries++) {
        const { x, z } = spot();
        const scale = 0.8 + random() * 0.3;
        if (!free(x, z, radius * scale + 0.12)) continue;
        if (decor.some((d) => Math.hypot(d.x - x, d.z - z) < 0.4)) continue;
        decor.push({ kind, x, z, yaw: random() * Math.PI * 2, scale });
        done++;
      }
    }
    const area = Math.PI * (outer * outer - inner * inner);
    const wanted = Math.round(area * CLEARING_TUFTS_PER_M2);
    for (let tries = 0, made = 0; made < wanted && tries < wanted * 4; tries++) {
      const { x, z } = spot();
      if (!free(x, z, 0.05)) continue;
      if (decor.some((d) => Math.hypot(d.x - x, d.z - z) < 0.12)) continue;
      tufts.push({ x, z, tall: random() < 0.25 });
      made++;
    }
  }
  return { decor, tufts };
}
