import type { DoneSegment, GroundSprite, NodeSprites } from '../tiles/types';
import { MAP_LAYOUT } from './mapLayout';
import { worldToContentDp, type ImageFrame } from './mapProjection';
import type { MapCity, MapNode, RegionMap } from './regionMap';
import { MAP_ELEVATION } from './shots';

/*
 * Ce qui se pose sur une carte pré-rendue (X2b), dans le contenu qui défile (dp, origine au coin haut
 * gauche du rendu) : les tronçons miel du chemin, les disques des niveaux et leur halo (sprites de
 * Blender, tools/explorer-3d/node_sprites.py), les boutons et les bandeaux des villes. Tout est placé
 * une fois pour toutes ; seule la progression change ce qui est posé, jamais le défilement.
 */

type Origin = Pick<ImageFrame, 'x0' | 'v0'>;
type Point = { x: number; y: number };
type Ground = { x: number; z: number };
/** Nom d'un sprite des points de niveau (toutes les clés sauf l'échelle). */
export type NodeSpriteName = Exclude<keyof NodeSprites, 'ppm'>;

/** Hauteur du dessus d'un disque (node_sprites.py : disque de 0,09 m) : l'icône et le bouton s'y centrent. */
export const DISC_TOP = 0.09;

/**
 * Tronçons miel du chemin (le tronçon `gap` porte les planches entre les niveaux `gap` et `gap + 1`) :
 * ceux qui relient deux niveaux terminés, et celui qui mène d'un niveau terminé au niveau à jouer (le
 * pion). Les villes ne s'ouvrent pas forcément dans l'ordre du chemin : un tronçon qui part d'un
 * niveau pas encore fait, ou qui mène à un niveau fermé, reste gris. Même règle sur la carte 3D
 * (mapPath.ts).
 */
export function honeyGaps(nodes: readonly Pick<MapNode, 'state'>[], pawnIndex: number): number[] {
  const gaps: number[] = [];
  for (let gap = 0; gap + 1 < nodes.length; gap += 1) {
    const to = nodes[gap + 1]!;
    if (nodes[gap]!.state === 'completed' && (to.state === 'completed' || gap + 1 === pawnIndex)) {
      gaps.push(gap);
    }
  }
  return gaps;
}

/** Tronçons miel à poser, parmi ceux que Blender a rendus. */
export function doneSegmentsOf<T extends Pick<DoneSegment, 'gap'>>(
  segments: readonly T[],
  gaps: readonly number[],
): T[] {
  const honey = new Set(gaps);
  return segments.filter((segment) => honey.has(segment.gap));
}

/** Celui des deux sprites dont le rayon est le plus proche de celui du niveau. */
function nearest(
  radius: number,
  sprites: NodeSprites,
  [small, big]: readonly [NodeSpriteName, NodeSpriteName],
): NodeSpriteName {
  return Math.abs(sprites[big].radius - radius) < Math.abs(sprites[small].radius - radius)
    ? big
    : small;
}

/** Disque d'un niveau : la couleur de son type s'il est ouvert, le verrou à sa taille s'il est fermé. */
export function discSpriteOf(
  node: Pick<MapNode, 'type' | 'state' | 'radius'>,
  sprites: NodeSprites,
): NodeSpriteName {
  if (node.state !== 'locked') return node.type;
  return nearest(node.radius, sprites, ['verrou', 'verrou-grand']);
}

/** Halo d'un niveau ouvert, à sa taille : l'anneau net et la lueur douce. */
export function haloSpritesOf(
  node: Pick<MapNode, 'radius'>,
  sprites: NodeSprites,
): { ring: NodeSpriteName; glow: NodeSpriteName } {
  return {
    ring: nearest(node.radius, sprites, ['anneau', 'anneau-grand']),
    glow: nearest(node.radius, sprites, ['lueur', 'lueur-grand']),
  };
}

/** Pied d'un niveau dans le contenu (dp), à `k` dp par mètre : l'ancrage de ses sprites. */
export function nodeGround(origin: Origin, k: number, node: Ground): Point {
  return worldToContentDp(origin, k, node.x, node.z, 0);
}

/** Centre du dessus du disque d'un niveau dans le contenu (dp) : là où se posent l'icône et le bouton. */
export function discFace(origin: Origin, k: number, node: Ground): Point {
  return worldToContentDp(origin, k, node.x, node.z, DISC_TOP);
}

/**
 * Place d'un sprite posé au sol dans le contenu : son ancrage sur le point `at`, à `scale` dp par
 * pixel du sprite (dpPerMeter / ppm des sprites).
 */
export function groundSpriteRect(
  sprite: Pick<GroundSprite, 'width' | 'height' | 'anchor'>,
  at: Point,
  scale: number,
): { left: number; top: number; width: number; height: number } {
  return {
    left: at.x - sprite.anchor[0] * scale,
    top: at.y - sprite.anchor[1] * scale,
    width: sprite.width * scale,
    height: sprite.height * scale,
  };
}

/** Niveaux du fond vers l'avant (z croissant) : un disque plus proche passe devant son voisin. */
export function backToFront<T extends Pick<MapNode, 'z'>>(nodes: readonly T[]): T[] {
  return [...nodes].sort((a, b) => a.z - b.z);
}

/**
 * Point où se pose le bas du bandeau d'une ville, [x, y, z] en mètres : en hauteur, derrière le
 * cercle de ses niveaux. C'est la place préférée du bandeau (cityBannerPlaces).
 */
export function cityBannerAnchor(
  city: Pick<MapCity, 'center' | 'radius'>,
): readonly [number, number, number] {
  return [city.center.x, 0.3, city.center.z - (city.radius - MAP_LAYOUT.clearing) - 0.35];
}

export type Rect = { left: number; top: number; width: number; height: number };
type Size = { width: number; height: number };

const SIN = Math.sin((MAP_ELEVATION * Math.PI) / 180);
/** Écart gardé entre un bandeau et ce qu'il ne doit pas cacher (dp). */
const BANNER_MARGIN = 6;
/** Rangée d'étoiles au-dessus d'un niveau terminé (NodeStars), en dp au-dessus du dessus du disque. */
const STARS_ROW: Size & { lift: number } = { width: 84, height: 32, lift: 20 };

/** Aire commune à deux rectangles (dp²). */
export function overlap(a: Rect, b: Rect): number {
  const w = Math.min(a.left + a.width, b.left + b.width) - Math.max(a.left, b.left);
  const h = Math.min(a.top + a.height, b.top + b.height) - Math.max(a.top, b.top);
  return w > 0 && h > 0 ? w * h : 0;
}

function grow(rect: Rect, by: number): Rect {
  return {
    left: rect.left - by,
    top: rect.top - by,
    width: rect.width + 2 * by,
    height: rect.height + 2 * by,
  };
}

/**
 * Ce qu'un bandeau ne doit jamais cacher, dans le contenu (dp) : chaque disque, de son bord avant au
 * dessus de son rebord, et la rangée d'étoiles des niveaux terminés.
 */
export function markerObstacles(origin: Origin, k: number, nodes: readonly MapNode[]): Rect[] {
  return nodes.flatMap((node) => {
    const ground = nodeGround(origin, k, node);
    const face = discFace(origin, k, node);
    const half = node.radius * k * 1.1;
    const disc: Rect = {
      left: ground.x - half,
      top: face.y - half * SIN,
      width: 2 * half,
      height: ground.y - face.y + 2 * half * SIN,
    };
    if (node.state !== 'completed') return [disc];
    const stars: Rect = {
      left: face.x - STARS_ROW.width / 2,
      top: face.y - STARS_ROW.lift - STARS_ROW.height,
      width: STARS_ROW.width,
      height: STARS_ROW.height,
    };
    return [disc, stars];
  });
}

/**
 * Places des bandeaux des villes dans le contenu (dp), une fois pour toutes : derrière le cercle des
 * niveaux si rien n'y est caché (cityBannerAnchor), sinon devant, à gauche ou à droite du cercle. Un
 * bandeau ne cache jamais un disque, une rangée d'étoiles ni un autre bandeau ; si aucune place n'est
 * libre, il prend celle qui en cache le moins. `sizes` : la taille de chaque bandeau (dp).
 */
export function cityBannerPlaces(
  map: Pick<RegionMap, 'cities' | 'nodes'>,
  origin: Origin,
  k: number,
  sizes: ReadonlyMap<string, Size>,
): Map<string, Rect> {
  const blocked = markerObstacles(origin, k, map.nodes).map((rect) => grow(rect, BANNER_MARGIN));
  const places = new Map<string, Rect>();
  for (const city of map.cities) {
    const size = sizes.get(city.id);
    if (!size) continue;
    const { width: w, height: h } = size;
    const ring = city.radius - MAP_LAYOUT.clearing;
    const { x: cx, z: cz } = city.center;
    const at = (x: number, z: number, y = 0) => worldToContentDp(origin, k, x, z, y);
    const [bx, by, bz] = cityBannerAnchor(city);
    const behind = at(bx, bz, by);
    const front = at(cx, cz + ring + 0.35);
    const left = at(cx - ring - 0.45, cz);
    const right = at(cx + ring + 0.45, cz);
    const candidates: Rect[] = [
      { left: behind.x - w / 2, top: behind.y - h, width: w, height: h },
      { left: front.x - w / 2, top: front.y, width: w, height: h },
      { left: left.x - w, top: left.y - h / 2, width: w, height: h },
      { left: right.x, top: right.y - h / 2, width: w, height: h },
    ];
    const hidden = (rect: Rect) => blocked.reduce((sum, b) => sum + overlap(rect, b), 0);
    let best = candidates[0]!;
    let bestHidden = hidden(best);
    for (const rect of candidates.slice(1)) {
      if (bestHidden === 0) break;
      const value = hidden(rect);
      if (value < bestHidden) {
        best = rect;
        bestHidden = value;
      }
    }
    places.set(city.id, best);
    blocked.push(grow(best, BANNER_MARGIN));
  }
  return places;
}
