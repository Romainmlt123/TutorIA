import {
  clampScroll,
  imageV,
  tiledScrollBounds,
  MAP_AIM_ROW,
  type ImageFrame,
  type ScreenSize,
} from './mapProjection';
import type { Bounds } from './mapScroll';
import { MAP_ELEVATION } from './shots';

const SIN = Math.sin((MAP_ELEVATION * Math.PI) / 180);
const FIT_MARGIN = 0.95;
export const TAP_ZOOM = 0.6;
export const TAP_ZOOM_MS = 400;

export type MapPoint = { x: number; z: number };
export type ZoomState = { zoom: number; point: MapPoint };
export type Focus = { x: number; y: number };
export type Zone = { width: number; height: number };

/** Cadre les tuiles pour calculer le zoom minimal par pincement. */
export function overviewFrame(tiles: ImageFrame, padding = 0.3): ImageFrame {
  const centerX = tiles.width / 2;
  const centerY = tiles.height / 2;
  const halfWidth = tiles.width * (0.5 + padding);
  const halfHeight = tiles.height * (0.5 + padding);
  const left = centerX - halfWidth;
  const top = centerY - halfHeight;
  const width = halfWidth * 2;
  const height = halfHeight * 2;
  return {
    ...tiles,
    x0: tiles.x0 + left / tiles.ppm,
    v0: tiles.v0 + top / tiles.ppm,
    width,
    height,
  };
}

/** Échelle la plus large qui laisse une marge autour de la carte et de son contexte. */
export function overviewZoom(tiles: ImageFrame, zone: Zone, k: number): number {
  const fit = Math.min(
    zone.width / ((tiles.width / tiles.ppm) * k),
    zone.height / ((tiles.height / tiles.ppm) * k),
  );
  return fit >= 1 ? 1 : fit * FIT_MARGIN;
}

/** Cadre le parcours et garde un espace autour de ses nœuds, sans dépendre de l'étendue du rendu. */
export function nodesOverview(
  nodes: readonly MapPoint[],
  zone: Zone,
  k: number,
  padding = 1.2,
): ZoomState {
  const [first, ...rest] = nodes;
  if (!first) return { zoom: 1, point: { x: 0, z: 0 } };

  const firstV = imageV(first.z, 0);
  let minX = first.x;
  let maxX = minX;
  let minV = firstV;
  let maxV = firstV;
  for (const node of rest) {
    const v = imageV(node.z, 0);
    minX = Math.min(minX, node.x);
    maxX = Math.max(maxX, node.x);
    minV = Math.min(minV, v);
    maxV = Math.max(maxV, v);
  }
  minX -= padding;
  maxX += padding;
  minV -= padding;
  maxV += padding;
  const fit = Math.min(zone.width / ((maxX - minX) * k), zone.height / ((maxV - minV) * k));
  return {
    zoom: Math.min(1, fit * FIT_MARGIN),
    point: {
      x: (minX + maxX) / 2,
      z: (minV + maxV) / (2 * SIN),
    },
  };
}

/** Garde le zoom dans l'intervalle utilisable par les tuiles. */
export function clampZoom(zoom: number, min: number): number {
  'worklet';
  return Math.min(1, Math.max(min, zoom));
}

/** Bornes de la caméra au zoom demandé, centrées sur l'image quand elle tient sur un axe. */
export function zoomScrollBounds(
  nodes: readonly MapPoint[],
  tiles: ImageFrame,
  screen: ScreenSize,
  k: number,
  zoom: number,
  overview: ImageFrame = tiles,
): Bounds {
  'worklet';
  const bounds = tiledScrollBounds(nodes, tiles, screen, k * zoom);
  const width = (overview.width / overview.ppm) * k * zoom;
  const height = (overview.height / overview.ppm) * k * zoom;
  if (width <= screen.width) {
    const center = overview.x0 + overview.width / overview.ppm / 2;
    bounds.minX = center;
    bounds.maxX = center;
  }
  if (height <= screen.height) {
    const center = (overview.v0 + overview.height / overview.ppm / 2) / SIN;
    bounds.minZ = center;
    bounds.maxZ = center;
  }
  return bounds;
}

/** Point de la carte sous un point de l'écran. */
export function pointUnderFocus(
  point: MapPoint,
  focus: Focus,
  screen: ScreenSize,
  k: number,
  zoom: number,
): MapPoint {
  'worklet';
  return {
    x: point.x + (focus.x - screen.width / 2) / (k * zoom),
    z: point.z + (focus.y - screen.height * MAP_AIM_ROW) / (k * zoom * SIN),
  };
}

/** Point suivi qui replace un point de carte sous le point d'écran choisi. */
export function pointForFocus(
  world: MapPoint,
  focus: Focus,
  screen: ScreenSize,
  k: number,
  zoom: number,
): MapPoint {
  'worklet';
  return {
    x: world.x - (focus.x - screen.width / 2) / (k * zoom),
    z: world.z - (focus.y - screen.height * MAP_AIM_ROW) / (k * zoom * SIN),
  };
}

/** Applique un pincement en gardant le point sous les doigts à la même place. */
export function pinchZoom(
  nodes: readonly MapPoint[],
  tiles: ImageFrame,
  screen: ScreenSize,
  k: number,
  state: ZoomState,
  factor: number,
  from: Focus,
  to: Focus,
  min: number,
  overview: ImageFrame = tiles,
): ZoomState {
  'worklet';
  const zoom = clampZoom(state.zoom * factor, min);
  const world = pointUnderFocus(state.point, from, screen, k, state.zoom);
  const point = pointForFocus(world, to, screen, k, zoom);
  return {
    zoom,
    point: clampScroll(point.x, point.z, zoomScrollBounds(nodes, tiles, screen, k, zoom, overview)),
  };
}

function pointAt(polygon: readonly (readonly number[])[], index: number): MapPoint {
  'worklet';
  const coordinates = polygon[index];
  const x = coordinates?.[0];
  const z = coordinates?.[1];
  if (
    typeof x !== 'number' ||
    !Number.isFinite(x) ||
    typeof z !== 'number' ||
    !Number.isFinite(z)
  ) {
    throw new Error('Coordonnée invalide dans un polygone de région');
  }
  return { x, z };
}

function containsPoint(polygon: readonly (readonly number[])[], point: MapPoint): boolean {
  'worklet';
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const { x: xi, z: zi } = pointAt(polygon, i);
    const { x: xj, z: zj } = pointAt(polygon, j);
    if (zi > point.z !== zj > point.z) {
      const crossingX = ((xj - xi) * (point.z - zi)) / (zj - zi) + xi;
      if (point.x < crossingX) inside = !inside;
    }
  }
  return inside;
}

export function nearestPointOnPolygon(
  polygon: readonly (readonly number[])[],
  point: MapPoint,
): MapPoint {
  'worklet';
  if (polygon.length === 0 || containsPoint(polygon, point)) return point;

  let centerX = 0;
  let centerZ = 0;
  for (const vertex of polygon) {
    const [x, z] = vertex;
    if (
      typeof x !== 'number' ||
      !Number.isFinite(x) ||
      typeof z !== 'number' ||
      !Number.isFinite(z)
    ) {
      throw new Error('Coordonnée invalide dans un polygone de région');
    }
    centerX += x;
    centerZ += z;
  }
  centerX /= polygon.length;
  centerZ /= polygon.length;

  let nearest = pointAt(polygon, 0);
  let nearestDistance = Number.POSITIVE_INFINITY;
  for (let i = 0; i < polygon.length; i += 1) {
    const start = pointAt(polygon, i);
    const end = pointAt(polygon, (i + 1) % polygon.length);
    const dx = end.x - start.x;
    const dz = end.z - start.z;
    const projectedZ = dz * SIN;
    const denominator = dx * dx + projectedZ * projectedZ;
    const amount = denominator
      ? Math.max(
          0,
          Math.min(
            1,
            (dx * (point.x - start.x) + projectedZ * (point.z - start.z) * SIN) / denominator,
          ),
        )
      : 0;
    const candidate = { x: start.x + dx * amount, z: start.z + dz * amount };
    const candidateX = candidate.x - point.x;
    const candidateZ = (candidate.z - point.z) * SIN;
    const distance = candidateX * candidateX + candidateZ * candidateZ;
    if (distance < nearestDistance) {
      nearest = candidate;
      nearestDistance = distance;
    }
  }

  const inset = {
    x: nearest.x + (centerX - nearest.x) * 0.15,
    z: nearest.z + (centerZ - nearest.z) * 0.15,
  };
  return containsPoint(polygon, inset) ? inset : nearest;
}

export function clampPointToScreen(
  point: MapPoint,
  center: MapPoint,
  screen: ScreenSize,
  k: number,
  zoom: number,
  marginX: number,
  marginY: number,
): MapPoint {
  'worklet';
  const x = screen.width / 2 + (point.x - center.x) * k * zoom;
  const y = screen.height / 2 + (point.z - center.z) * k * zoom * SIN;
  const minX = Math.min(marginX, screen.width / 2 - 1);
  const minY = Math.min(marginY, screen.height / 2 - 1);
  const boundedX = Math.max(minX, Math.min(screen.width - minX, x));
  const boundedY = Math.max(minY, Math.min(screen.height - minY, y));
  return {
    x: point.x + (boundedX - x) / (k * zoom),
    z: point.z + (boundedY - y) / (k * zoom * SIN),
  };
}

/** Interpole une arrivée : échelle logarithmique, point suivi linéaire. */
export function introAt(progress: number, from: ZoomState, to: ZoomState): ZoomState {
  'worklet';
  const p = Math.min(1, Math.max(0, progress));
  return {
    zoom: Math.exp(Math.log(from.zoom) + (Math.log(to.zoom) - Math.log(from.zoom)) * p),
    point: {
      x: from.point.x + (to.point.x - from.point.x) * p,
      z: from.point.z + (to.point.z - from.point.z) * p,
    },
  };
}
