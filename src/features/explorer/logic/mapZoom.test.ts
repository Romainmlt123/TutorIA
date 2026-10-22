import {
  clampPointToScreen,
  clampZoom,
  introAt,
  overviewFrame,
  overviewZoom,
  nodesOverview,
  nearestPointOnPolygon,
  pinchZoom,
  pointUnderFocus,
  zoomScrollBounds,
} from './mapZoom';
import {
  dpPerMeter,
  imageV,
  tiledScrollBounds,
  type ImageFrame,
  type ScreenSize,
} from './mapProjection';
import { MAP_ELEVATION } from './shots';
import { islandOf } from '../content';
import { buildRegionMap } from './regionMap';
import { PRERENDERED_MAPS } from '../tiles';

const FRAME: ImageFrame = { ppm: 100, x0: -2, v0: -1, width: 800, height: 1000 };
const SCREEN: ScreenSize = { width: 400, height: 800 };
const K = dpPerMeter(SCREEN.width);
const NODES = [
  { x: -1, z: 2 },
  { x: 2, z: 4 },
  { x: 5, z: 7 },
];

describe('zoom de la carte pré-rendue', () => {
  it('fait tenir toute l’image dans la zone avec une petite marge, sans dépasser 1', () => {
    const tiles = { ...FRAME, width: 2000, height: 1000 };
    const expanded = overviewFrame(tiles);
    const zoom = overviewZoom(expanded, { width: 400, height: 300 }, 100);
    expect(expanded.width).toBe(3200);
    expect(expanded.height).toBe(1600);
    expect(expanded.x0).toBe(tiles.x0 - 6);
    expect(expanded.v0).toBe(tiles.v0 - 3);
    expect(zoom).toBeCloseTo(0.11875, 12);
    expect((expanded.width / expanded.ppm) * 100 * zoom).toBeLessThan(400);
    expect((expanded.height / expanded.ppm) * 100 * zoom).toBeLessThan(300);
    expect(overviewZoom(FRAME, { width: 1000, height: 1200 }, 100)).toBe(1);
  });

  it('garde le contexte prévu pour le zoom minimal par pincement', () => {
    const context = overviewFrame(FRAME, 0.18);
    const zoom = overviewZoom(context, SCREEN, K);
    const widthFill = ((context.width / context.ppm) * K * zoom) / SCREEN.width;
    const tileFill = (FRAME.width / context.width) * widthFill;
    expect(context.x0 + context.width / context.ppm / 2).toBeCloseTo(
      FRAME.x0 + FRAME.width / FRAME.ppm / 2,
    );
    expect(tileFill).toBeCloseTo(0.7, 1);
  });

  it('cadre le parcours Nombres et garde tous ses nœuds visibles', () => {
    const map = buildRegionMap(islandOf('maths')!, 'maths-nombres', new Map())!;
    const tiles = PRERENDERED_MAPS['maths-nombres']!;
    const frame: ImageFrame = {
      ppm: tiles.ppm,
      x0: tiles.x0,
      v0: tiles.v0,
      width: tiles.width,
      height: tiles.height,
    };
    const zone = { width: 350, height: 476 };
    const k = dpPerMeter(390);
    const state = nodesOverview(map.nodes, zone, k);
    const previous = overviewZoom(overviewFrame(frame, 0.18), zone, k);

    expect(state.zoom).toBeGreaterThan(previous);
    for (const node of map.nodes) {
      const x = zone.width / 2 + (node.x - state.point.x) * k * state.zoom;
      const y = zone.height / 2 + (imageV(node.z, 0) - imageV(state.point.z, 0)) * k * state.zoom;
      expect(x).toBeGreaterThanOrEqual(0);
      expect(x).toBeLessThanOrEqual(zone.width);
      expect(y).toBeGreaterThanOrEqual(0);
      expect(y).toBeLessThanOrEqual(zone.height);
    }
  });

  it('borne le zoom inférieur au minimum et supérieur au maximum net', () => {
    expect(clampZoom(0.2, 0.45)).toBe(0.45);
    expect(clampZoom(1.4, 0.45)).toBe(1);
    expect(clampZoom(0.7, 0.45)).toBe(0.7);
  });

  it('garde le point sous les doigts en place pendant le pincement', () => {
    const focus = { x: 275, y: 400 };
    const frame = { ...FRAME, height: 1600 };
    const before = { zoom: 0.7, point: { x: 2, z: 4 } };
    const world = pointUnderFocus(before.point, focus, SCREEN, K, before.zoom);
    const after = pinchZoom(NODES, frame, SCREEN, K, before, 1.25, focus, focus, 0.4);
    const nextWorld = pointUnderFocus(after.point, focus, SCREEN, K, after.zoom);
    expect(after.zoom).toBeCloseTo(0.875, 12);
    expect(nextWorld.x).toBeCloseTo(world.x, 9);
    expect(nextWorld.z).toBeCloseTo(world.z, 9);
  });

  it('place un nom au plus près du centre tout en le gardant dans sa silhouette', () => {
    const polygon = [
      [0, 0],
      [4, 0],
      [4, 4],
      [0, 4],
    ];
    const nearest = nearestPointOnPolygon(polygon, { x: -2, z: 2 });
    expect(nearest.x).toBeCloseTo(0.3, 12);
    expect(nearest.z).toBeCloseTo(2, 12);
    expect(nearestPointOnPolygon(polygon, { x: 2, z: 2 })).toEqual({ x: 2, z: 2 });
  });

  it('borne le point d’une étiquette à la marge visible de l’écran', () => {
    const bounded = clampPointToScreen(
      { x: 50, z: 0 },
      { x: 0, z: 0 },
      { width: 100, height: 100 },
      2,
      1,
      20,
      10,
    );
    expect(bounded.x).toBe(15);
    expect(50 + bounded.x * 2).toBe(80);
    expect(bounded.z).toBe(0);
  });

  it('utilise les bornes de la carte au zoom et centre les axes où elle tient', () => {
    const zoom = 0.5;
    const bounds = zoomScrollBounds(NODES, FRAME, SCREEN, K, zoom);
    const sin = Math.sin((MAP_ELEVATION * Math.PI) / 180);
    expect(bounds.minX).toBe(FRAME.x0 + FRAME.width / FRAME.ppm / 2);
    expect(bounds.maxX).toBe(bounds.minX);
    expect(bounds.minZ).toBeCloseTo((FRAME.v0 + FRAME.height / FRAME.ppm / 2) / sin, 12);
    expect(bounds.maxZ).toBe(bounds.minZ);
    expect(zoomScrollBounds(NODES, FRAME, SCREEN, K, 1)).toEqual(
      tiledScrollBounds(NODES, FRAME, SCREEN, K),
    );
  });

  it('interpole le zoom en logarithme et le point suivi en ligne droite', () => {
    const from = { zoom: 0.25, point: { x: -4, z: 2 } };
    const to = { zoom: 1, point: { x: 8, z: 6 } };
    expect(introAt(0, from, to)).toEqual(from);
    expect(introAt(1, from, to)).toEqual(to);
    expect(introAt(0.5, from, to)).toEqual({
      zoom: 0.5,
      point: { x: 2, z: 4 },
    });
  });
});
