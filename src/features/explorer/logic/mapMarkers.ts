import type { DoneSegment, GroundSprite, NodeSprites } from '../tiles/types';
import { MAP_LAYOUT } from './mapLayout';
import { worldToContentDp, type ImageFrame } from './mapProjection';
import type { MapCity, MapNode } from './regionMap';

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
 * Tronçons miel du chemin à poser : ceux d'avant le pion. Le tronçon `gap` porte les planches entre
 * les niveaux `gap` et `gap + 1` ; une planche est miel jusqu'au pion (mapPath.ts : u ≤ pawnIndex).
 */
export function doneSegmentsBefore<T extends Pick<DoneSegment, 'gap'>>(
  segments: readonly T[],
  pawnIndex: number,
): T[] {
  return segments.filter((segment) => segment.gap < pawnIndex);
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
 * cercle de ses niveaux, pour n'en cacher aucun.
 */
export function cityBannerAnchor(
  city: Pick<MapCity, 'center' | 'radius'>,
): readonly [number, number, number] {
  return [city.center.x, 0.3, city.center.z - (city.radius - MAP_LAYOUT.clearing) - 0.35];
}
