import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type MutableRefObject,
} from 'react';

import { requestSceneFrames } from '@/lib/three/FrameDriver';

import type { useSkyVeil } from './useSkyVeil';
import { MAP_SCROLL, MAP_ZOOM } from './mapScrollValue';
import type { ExplorerView } from '../logic/explorerView';
import { OVERVIEW_HOLD_MS, type CinematicKind } from '../logic/cinematics';
import { jumpTo, setBounds } from '../logic/mapScroll';
import { clampScroll, dpPerMeter, nodeScrollBounds } from '../logic/mapProjection';
import type { ImageFrame, ScreenSize } from '../logic/mapProjection';
import { nodesOverview, overviewFrame, zoomScrollBounds, type ZoomState } from '../logic/mapZoom';
import type { RegionMap } from '../logic/regionMap';
import { PRERENDERED_MAPS, type MapTiles } from '../tiles';
import { useMapPan } from './useMapPan';

const EMPTY_NODES: readonly { x: number; z: number }[] = [];

type Zone = { left: number; top: number; width: number; height: number };
type ActiveCinema = { id: number; kind: CinematicKind; finalView: ExplorerView } | null;
type Options = {
  active: boolean;
  activeCinema: MutableRefObject<ActiveCinema>;
  animated: boolean;
  map: RegionMap | null;
  regionId: string | null;
  screen: ScreenSize;
  tiles?: MapTiles;
  veil: ReturnType<typeof useSkyVeil>;
  zone: Zone | null;
};

function homeOf(map: RegionMap) {
  return (
    map.cities.find((city) => city.id === map.nodes[map.pawnIndex]?.cityId)?.center ?? {
      x: 0,
      z: 0,
    }
  );
}

function useCurrentIntro(startIntro: (from: ZoomState, to: ZoomState) => void) {
  const latest = useRef(startIntro);
  useLayoutEffect(() => {
    latest.current = startIntro;
  }, [startIntro]);
  return useCallback((from: ZoomState, to: ZoomState) => latest.current(from, to), []);
}

export function useMapIntro({
  active,
  activeCinema,
  animated,
  map,
  regionId,
  screen,
  tiles,
  veil,
  zone,
}: Options) {
  const introTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const skipArrivalIntro = useRef(false);
  const [intro, setIntro] = useState(
    () => regionId !== null && animated && PRERENDERED_MAPS[regionId] !== undefined,
  );
  const openedRegion = useRef<string | null>(null);
  const pendingIntro = useRef<{ from: ZoomState; to: ZoomState } | null>(null);
  const introReadyWaiter = useRef<(() => void) | null>(null);
  const introEndWaiter = useRef<(() => void) | null>(null);
  const worldReady = useRef(false);
  const k = dpPerMeter(screen.width);
  const viewport = useMemo(
    () => ({ width: screen.width, height: screen.height }),
    [screen.width, screen.height],
  );
  const imageFrame = useMemo<ImageFrame | null>(
    () =>
      tiles
        ? {
            ppm: tiles.ppm,
            x0: tiles.x0,
            v0: tiles.v0,
            width: tiles.width,
            height: tiles.height,
          }
        : null,
    [tiles],
  );
  const contextFrame = useMemo(
    () => (imageFrame ? overviewFrame(imageFrame, 0.18) : null),
    [imageFrame],
  );
  const tiledPlace = useMemo(() => {
    if (!map || !tiles) return null;
    const bounds = zoomScrollBounds(map.nodes, tiles, viewport, k, 1);
    return { bounds, start: clampScroll(homeOf(map).x, homeOf(map).z, bounds) };
  }, [k, map, tiles, viewport]);
  const finishMapIntro = useCallback(() => {
    clearTimeout(introTimer.current);
    introTimer.current = undefined;
    pendingIntro.current = null;
    setIntro(false);
    introEndWaiter.current?.();
    introEndWaiter.current = null;
  }, []);
  const tiledPan = useMapPan({
    k,
    animated,
    running: active && tiles !== undefined,
    frame: imageFrame,
    overview: contextFrame,
    nodes: map?.nodes ?? EMPTY_NODES,
    screen: viewport,
    zone,
    onIntroEnd: finishMapIntro,
  });
  const { setBounds: setTiledBounds, openAt: openTiledAt } = tiledPan;
  const startIntro = useCurrentIntro(tiledPan.startIntro);
  const scheduleIntro = useCallback(() => {
    const pending = pendingIntro.current;
    if (!pending || introTimer.current) return;
    pendingIntro.current = null;
    introTimer.current = setTimeout(() => {
      introTimer.current = undefined;
      startIntro(pending.from, pending.to);
    }, OVERVIEW_HOLD_MS);
  }, [startIntro]);

  const onTilesReady = useCallback(() => {
    worldReady.current = true;
    veil.ready();
    if (activeCinema.current?.kind !== 'regions-to-region') scheduleIntro();
  }, [activeCinema, scheduleIntro, veil]);

  useEffect(() => {
    if (!map) {
      openedRegion.current = null;
      pendingIntro.current = null;
      worldReady.current = false;
      clearTimeout(introTimer.current);
      introTimer.current = undefined;
      return;
    }
    const opening = openedRegion.current !== map.regionId;
    if (tiles && tiledPlace && imageFrame) {
      if (opening && !zone) return;
      openedRegion.current = map.regionId;
      if (opening && zone) {
        const final = { zoom: 1, point: tiledPlace.start };
        if (skipArrivalIntro.current) {
          skipArrivalIntro.current = false;
          pendingIntro.current = null;
          openTiledAt(final, final, false);
          setIntro(false);
        } else if (animated) {
          const from = nodesOverview(map.nodes, zone, k);
          pendingIntro.current = { from, to: final };
          introReadyWaiter.current?.();
          introReadyWaiter.current = null;
          openTiledAt(from, final, true);
          if (worldReady.current && activeCinema.current?.kind !== 'regions-to-region') {
            scheduleIntro();
          }
        } else {
          pendingIntro.current = null;
          openTiledAt(final, final, false);
        }
      } else {
        setTiledBounds(zoomScrollBounds(map.nodes, imageFrame, viewport, k, MAP_ZOOM.value));
      }
      return;
    }
    openedRegion.current = map.regionId;
    setBounds(MAP_SCROLL, nodeScrollBounds(map.nodes));
    if (opening) {
      const home = homeOf(map);
      jumpTo(MAP_SCROLL, home.x, home.z);
    }
    requestSceneFrames();
  }, [
    activeCinema,
    animated,
    contextFrame,
    imageFrame,
    k,
    map,
    openTiledAt,
    scheduleIntro,
    setTiledBounds,
    tiles,
    tiledPlace,
    viewport,
    zone,
  ]);

  useEffect(() => () => clearTimeout(introTimer.current), []);

  return {
    contextFrame,
    finishMapIntro,
    imageFrame,
    intro,
    introEndWaiter,
    introReadyWaiter,
    k,
    onTilesReady,
    openTiledAt,
    pendingIntro,
    setIntro,
    skipArrivalIntro,
    startIntro,
    tiledPan,
    tiledPlace,
    viewport,
    worldReady,
  };
}
