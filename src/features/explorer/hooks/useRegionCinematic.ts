import { useCallback, useEffect, useRef, useState } from 'react';
import { Easing, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

import type { SubjectId } from '@/data/types';

import type { useSkyVeil } from './useSkyVeil';
import type { ExplorerView } from '../logic/explorerView';
import { CINEMA_FRAME_MS, type CinematicKind } from '../logic/cinematics';
import type { ScreenSize } from '../logic/mapProjection';
import type { RegionMap } from '../logic/regionMap';
import type { IslandFrame } from '../logic/stageFrame';
import type { MapTiles } from '../tiles';
import { useCinematicCamera } from './useCinematicCamera';
import { useCinematicWind } from './useCinematicWind';
import { useMapIntro } from './useMapIntro';
import { useRegionArrival } from './useRegionArrival';
import { useRegionNavigation } from './useRegionNavigation';
import { useSkipCinema } from './useSkipCinema';

type Zone = { left: number; top: number; width: number; height: number };
type Options = {
  view: ExplorerView;
  subjectId: SubjectId;
  index: number;
  focusPoint: readonly [number, number] | null;
  frame: IslandFrame;
  screen: ScreenSize;
  zone: Zone | null;
  map: RegionMap | null;
  tiles?: MapTiles;
  animated: boolean;
  active: boolean;
  webgl: boolean;
  veil: ReturnType<typeof useSkyVeil>;
  open: (next: ExplorerView) => void;
  select: (regionId: string) => void;
};

export function useRegionCinematic({
  view,
  subjectId,
  index,
  focusPoint,
  frame,
  screen,
  zone,
  map,
  tiles,
  animated,
  active,
  webgl,
  veil,
  open,
  select,
}: Options) {
  const [diving, setDiving] = useState<string | null>(null);
  const [cinematicActive, setCinematicActive] = useState(false);
  const cinemaProgress = useSharedValue(0);
  const hudProgress = useSharedValue(1);
  const wind = useCinematicWind();
  const {
    cameraFlight,
    cancel: cancelCameraFlight,
    snapCamera,
    startCameraFlight,
  } = useCinematicCamera();
  const hudStyle = useAnimatedStyle(() => ({ opacity: hudProgress.value }));
  const cinemaId = useRef(0);
  const cinemaStartTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const cinemaExitTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const activeCinema = useRef<{ id: number; kind: CinematicKind; finalView: ExplorerView } | null>(
    null,
  );
  const mapIntro = useMapIntro({
    active,
    activeCinema,
    animated,
    map,
    regionId: view.kind === 'region' ? view.regionId : null,
    screen,
    tiles,
    veil,
    zone,
  });
  const {
    finishMapIntro,
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
    worldReady,
  } = mapIntro;
  const resetWind = wind.reset;
  const beginCinema = useCallback(
    (kind: CinematicKind, finalView: ExplorerView) => {
      clearTimeout(cinemaStartTimer.current);
      clearTimeout(cinemaExitTimer.current);
      const id = ++cinemaId.current;
      activeCinema.current = { id, kind, finalView };
      setCinematicActive(true);
      cinemaProgress.set(0);
      cinemaProgress.set(
        withTiming(1, { duration: CINEMA_FRAME_MS, easing: Easing.out(Easing.cubic) }),
      );
      hudProgress.set(
        withTiming(0, { duration: CINEMA_FRAME_MS, easing: Easing.out(Easing.cubic) }),
      );
      return id;
    },
    [cinemaProgress, hudProgress],
  );
  const finishCinema = useCallback(
    (id: number) => {
      if (activeCinema.current?.id !== id) return;
      clearTimeout(cinemaStartTimer.current);
      activeCinema.current = null;
      resetWind();
      veil.finish();
      cinemaProgress.set(
        withTiming(0, { duration: CINEMA_FRAME_MS, easing: Easing.out(Easing.cubic) }),
      );
      hudProgress.set(
        withTiming(1, { duration: CINEMA_FRAME_MS, easing: Easing.out(Easing.cubic) }),
      );
      cinemaExitTimer.current = setTimeout(() => setCinematicActive(false), CINEMA_FRAME_MS);
    },
    [cinemaProgress, hudProgress, resetWind, veil],
  );
  const finalZoom = useCallback(() => {
    if (!tiledPlace) return;
    const final = { zoom: 1, point: tiledPlace.start };
    openTiledAt(final, final, false);
  }, [openTiledAt, tiledPlace]);

  const { enter } = useRegionArrival({
    activeCinema,
    animated,
    beginCinema,
    cinemaStartTimerRef: cinemaStartTimer,
    finishCinema,
    index,
    introEndWaiterRef: introEndWaiter,
    introReadyWaiterRef: introReadyWaiter,
    onOpenAt: openTiledAt,
    open,
    pendingIntroRef: pendingIntro,
    select,
    setDiving,
    setIntro,
    startCameraFlight,
    startIntro,
    subjectId,
    startWind: wind.start,
    veil,
    webgl,
    worldReadyRef: worldReady,
  });
  const skipCinema = useSkipCinema({
    activeCinemaRef: activeCinema,
    cinemaExitTimerRef: cinemaExitTimer,
    cinemaProgress,
    cinemaStartTimerRef: cinemaStartTimer,
    finalZoom,
    finishMapIntro,
    focusPoint,
    frame,
    hudProgress,
    index,
    introReadyWaiterRef: introReadyWaiter,
    open,
    resetWind,
    setCinematicActive,
    setDiving,
    skipArrivalIntroRef: skipArrivalIntro,
    snapCamera,
    veil,
    view,
    webgl,
  });

  const { goBack, onExplore } = useRegionNavigation({
    animated,
    activeCinema,
    beginCinema,
    finishCinema,
    finishMapIntro,
    focusPoint,
    frame,
    index,
    k,
    map,
    open,
    startCameraFlight,
    subjectId,
    tiles,
    animateMapTo: tiledPan.animateTo,
    veil,
    view,
    webgl,
    worldReadyRef: worldReady,
    zone,
  });

  useEffect(
    () => () => {
      clearTimeout(cinemaStartTimer.current);
      clearTimeout(cinemaExitTimer.current);
      resetWind();
      cancelCameraFlight();
    },
    [resetWind, cancelCameraFlight],
  );

  return {
    cameraFlight,
    cinematicActive,
    cinemaProgress,
    diving,
    enter,
    finishMapIntro,
    goBack,
    hudStyle,
    intro,
    onExplore,
    onTilesReady,
    skipCinema,
    tiledPan,
    tiledPlace,
    windProgress: wind.progress,
  };
}
