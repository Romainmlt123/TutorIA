import type { MapTiles, PixelRect } from '../tiles/types';
import type { Bounds } from './mapScroll';
import { MAP_ELEVATION, MAP_VISIBLE_WIDTH, REGION_SHOT } from './shots';

/*
 * Carte pré-rendue d'une région (X2b) : du monde au plan image de la caméra orthographique de
 * Blender, puis aux dp de l'écran. Monde : x vers la droite, z vers la caméra, y vers le haut, en
 * mètres. Plan image : x, et v = z·sin 52° − y·cos 52° vers le bas, en mètres ; sans perspective,
 * le calcul est exact (vérifié au millième de pixel contre Blender). Le « contenu » est le plan qui
 * défile d'un bloc sous le doigt : son origine est le coin haut gauche de l'image rendue, le pixel
 * (0, 0). Les fonctions lues à chaque image du défilement sont des worklets (fil UI).
 */

const ELEVATION = (MAP_ELEVATION * Math.PI) / 180;
const SIN = Math.sin(ELEVATION);
const COS = Math.cos(ELEVATION);

/** Hauteur de la visée (fraction de l'écran, depuis le haut) : le point du sol que suit le défilement. */
export const MAP_AIM_ROW = REGION_SHOT.aimY;
/** Marge de la caméra au-delà des points de niveau extrêmes (mètres) : l'île déborde un peu de l'écran. */
export const CAMERA_MARGIN = 0.6;
/** Écran le plus haut prévu (hauteur sur largeur : 20:9, avec un peu de marge) : le rendu le couvre. */
export const TALLEST_SCREEN = 2.3;

/** Ce que la projection lit d'une carte pré-rendue : un petit objet, qui part tel quel sur le fil UI. */
export type ImageFrame = Pick<MapTiles, 'ppm' | 'x0' | 'v0' | 'width' | 'height'>;

export type ScreenSize = { width: number; height: number };

type Point = { x: number; y: number };
type Nodes = readonly { x: number; z: number }[];
type Translation = { translateX: number; translateY: number };

/** Coordonnée verticale du plan image (mètres, vers le bas) : z raccourci, la hauteur remonte. */
export function imageV(z: number, y: number): number {
  'worklet';
  return z * SIN - y * COS;
}

/** Point du monde → pixel du rendu, en coordonnées continues : (0, 0) est le coin haut gauche. */
export function worldToImagePx(
  frame: Pick<ImageFrame, 'ppm' | 'x0' | 'v0'>,
  x: number,
  z: number,
  y = 0,
): Point {
  return { x: (x - frame.x0) * frame.ppm, y: (imageV(z, y) - frame.v0) * frame.ppm };
}

/** Échelle de la carte (dp par mètre) : MAP_VISIBLE_WIDTH mètres sur la largeur de l'écran. */
export function dpPerMeter(screenWidthDp: number): number {
  return screenWidthDp / MAP_VISIBLE_WIDTH;
}

/** dp par pixel du rendu : la taille et la place des tuiles dans le contenu. */
export function imageScale(frame: Pick<ImageFrame, 'ppm'>, k: number): number {
  return k / frame.ppm;
}

/** Point du monde → position dans le contenu (dp), à l'échelle `k` (dpPerMeter). */
export function worldToContentDp(
  frame: Pick<ImageFrame, 'x0' | 'v0'>,
  k: number,
  x: number,
  z: number,
  y = 0,
): Point {
  'worklet';
  return { x: (x - frame.x0) * k, y: (imageV(z, y) - frame.v0) * k };
}

/** Translation du contenu qui pose le sol suivi (scrollX, scrollZ) au centre de l'écran, sur la visée. */
export function scrollToContentTranslation(
  scrollX: number,
  scrollZ: number,
  screen: ScreenSize,
  frame: Pick<ImageFrame, 'x0' | 'v0'>,
  k: number,
): Translation {
  'worklet';
  const at = worldToContentDp(frame, k, scrollX, scrollZ, 0);
  return { translateX: screen.width / 2 - at.x, translateY: screen.height * MAP_AIM_ROW - at.y };
}

/** Bornes du point suivi : le rectangle des points de niveau, avec la marge de la caméra. */
export function nodeScrollBounds(nodes: Nodes): Bounds {
  const xs = nodes.map((n) => n.x);
  const zs = nodes.map((n) => n.z);
  return {
    minX: Math.min(...xs) - CAMERA_MARGIN,
    maxX: Math.max(...xs) + CAMERA_MARGIN,
    minZ: Math.min(...zs) - CAMERA_MARGIN,
    maxZ: Math.max(...zs) + CAMERA_MARGIN,
  };
}

/**
 * Rectangle du plan image que la caméra peut montrer, [xMin, xMax, vMin, vMax] en mètres : les
 * bornes des niveaux, plus un demi-écran de chaque côté, sur l'écran le plus haut prévu. C'est ce
 * que Blender rend (mapExport).
 */
export function renderedRectOf(nodes: Nodes): [number, number, number, number] {
  const bounds = nodeScrollBounds(nodes);
  const height = MAP_VISIBLE_WIDTH * TALLEST_SCREEN;
  return [
    bounds.minX - MAP_VISIBLE_WIDTH / 2,
    bounds.maxX + MAP_VISIBLE_WIDTH / 2,
    bounds.minZ * SIN - MAP_AIM_ROW * height,
    bounds.maxZ * SIN + (1 - MAP_AIM_ROW) * height,
  ];
}

/** Intervalle borné ; inversé (image plus petite que l'écran), il devient son milieu. */
const span = (min: number, max: number): [number, number] =>
  min <= max ? [min, max] : [(min + max) / 2, (min + max) / 2];

/**
 * Bornes du point suivi pour que l'écran ne sorte jamais de l'image rendue : au-delà, rien n'est
 * dessiné. Une image plus petite que l'écran sur un axe y reste centrée.
 */
export function imageScrollBounds(frame: ImageFrame, screen: ScreenSize, k: number): Bounds {
  const halfWidth = screen.width / 2 / k;
  const above = (screen.height * MAP_AIM_ROW) / k;
  const below = (screen.height * (1 - MAP_AIM_ROW)) / k;
  const [minX, maxX] = span(frame.x0 + halfWidth, frame.x0 + frame.width / frame.ppm - halfWidth);
  const [minV, maxV] = span(frame.v0 + above, frame.v0 + frame.height / frame.ppm - below);
  return { minX, maxX, minZ: minV / SIN, maxZ: maxV / SIN };
}

/** Point suivi ramené dans des bornes : l'élastique du doigt s'arrête au bord de l'image. */
export function clampScroll(x: number, z: number, bounds: Bounds): { x: number; z: number } {
  'worklet';
  return {
    x: Math.min(bounds.maxX, Math.max(bounds.minX, x)),
    z: Math.min(bounds.maxZ, Math.max(bounds.minZ, z)),
  };
}

/** Bornes des niveaux ramenées dans celles de l'image : la caméra ne s'y pose jamais hors du rendu. */
export function boundsInside(bounds: Bounds, outer: Bounds): Bounds {
  const low = clampScroll(bounds.minX, bounds.minZ, outer);
  const high = clampScroll(bounds.maxX, bounds.maxZ, outer);
  return { minX: low.x, maxX: high.x, minZ: low.z, maxZ: high.z };
}

/**
 * Bornes du point suivi sur une carte pré-rendue : les points de niveau avec la marge de la caméra,
 * ramenés dans l'image pour que l'écran n'en sorte jamais.
 */
export function tiledScrollBounds(
  nodes: Nodes,
  frame: ImageFrame,
  screen: ScreenSize,
  k: number,
): Bounds {
  return boundsInside(nodeScrollBounds(nodes), imageScrollBounds(frame, screen, k));
}

/**
 * Place d'une image du rendu (tuile, sous-couche) dans le contenu, en dp : sa place en pixels du
 * rendu, à l'échelle de l'image (`imageScale`). Une tuile porte déjà sa marge (`bleed`) dans son
 * rectangle : deux voisines se recouvrent ainsi de pixels identiques, et aucun joint n'apparaît.
 */
export function tileRect(
  rect: PixelRect,
  scale: number,
): { left: number; top: number; width: number; height: number } {
  return {
    left: rect.x * scale,
    top: rect.y * scale,
    width: rect.width * scale,
    height: rect.height * scale,
  };
}

/** Rangs des images du rendu qui touchent l'écran, quand le contenu est déplacé de `shift` (dp). */
export function tilesInView(
  rects: readonly PixelRect[],
  scale: number,
  shift: Translation,
  screen: ScreenSize,
): number[] {
  const seen: number[] = [];
  rects.forEach((rect, index) => {
    const { left, top, width, height } = tileRect(rect, scale);
    const x = left + shift.translateX;
    const y = top + shift.translateY;
    if (x < screen.width && x + width > 0 && y < screen.height && y + height > 0) seen.push(index);
  });
  return seen;
}

/** Valeur arrondie au pixel physique le plus proche (`ratio` : pixels par dp) : l'image reste nette. */
export function snapToPixel(value: number, ratio: number): number {
  'worklet';
  return Math.round(value * ratio) / ratio;
}
