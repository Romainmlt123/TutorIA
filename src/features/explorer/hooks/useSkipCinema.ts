import { useCallback, type Dispatch, type MutableRefObject, type SetStateAction } from 'react';
import { Easing, withTiming, type SharedValue } from 'react-native-reanimated';

import type { useSkyVeil } from './useSkyVeil';
import { ISLAND_SPACING } from '../components/IslandStage';
import type { ExplorerView } from '../logic/explorerView';
import { CINEMA_FRAME_MS, type CinematicKind } from '../logic/cinematics';
import type { IslandFrame } from '../logic/stageFrame';
import { focusOf } from '../logic/regions';
import { diveShot, shotFor } from '../logic/shots';
import { PRERENDERED_MAPS } from '../tiles';
import type { useCinematicCamera } from './useCinematicCamera';

type ActiveCinema = { id: number; kind: CinematicKind; finalView: ExplorerView } | null;
type Options = {
  activeCinemaRef: MutableRefObject<ActiveCinema>;
  cinemaExitTimerRef: MutableRefObject<ReturnType<typeof setTimeout> | undefined>;
  cinemaProgress: SharedValue<number>;
  cinemaStartTimerRef: MutableRefObject<ReturnType<typeof setTimeout> | undefined>;
  finalZoom: () => void;
  finishMapIntro: () => void;
  focusPoint: readonly [number, number] | null;
  frame: IslandFrame;
  hudProgress: SharedValue<number>;
  index: number;
  introReadyWaiterRef: MutableRefObject<(() => void) | null>;
  open: (view: ExplorerView) => void;
  resetWind: () => void;
  setCinematicActive: Dispatch<SetStateAction<boolean>>;
  setDiving: Dispatch<SetStateAction<string | null>>;
  skipArrivalIntroRef: MutableRefObject<boolean>;
  snapCamera: ReturnType<typeof useCinematicCamera>['snapCamera'];
  veil: ReturnType<typeof useSkyVeil>;
  view: ExplorerView;
  webgl: boolean;
};

export function useSkipCinema({
  activeCinemaRef,
  cinemaExitTimerRef,
  cinemaProgress,
  cinemaStartTimerRef,
  finalZoom,
  finishMapIntro,
  focusPoint,
  frame,
  hudProgress,
  index,
  introReadyWaiterRef,
  open,
  resetWind,
  setCinematicActive,
  setDiving,
  skipArrivalIntroRef,
  snapCamera,
  veil,
  view,
  webgl,
}: Options) {
  return useCallback(() => {
    const sequence = activeCinemaRef.current;
    if (!sequence) return;
    clearTimeout(cinemaStartTimerRef.current);
    activeCinemaRef.current = null;
    resetWind();
    veil.finish();
    cinemaProgress.set(
      withTiming(0, { duration: CINEMA_FRAME_MS, easing: Easing.out(Easing.cubic) }),
    );
    hudProgress.set(withTiming(1, { duration: CINEMA_FRAME_MS, easing: Easing.out(Easing.cubic) }));
    const finalView = sequence.finalView;
    if (sequence.kind === 'regions-to-region') {
      if (view.kind !== 'region') skipArrivalIntroRef.current = true;
      introReadyWaiterRef.current?.();
      introReadyWaiterRef.current = null;
      finishMapIntro();
      setDiving(null);
      finalZoom();
    } else if (sequence.kind === 'region-to-regions') {
      finalZoom();
    }
    open(finalView);
    if (webgl) {
      snapCamera({
        x: index * ISLAND_SPACING,
        z: 0,
        shot:
          finalView.kind === 'region' && PRERENDERED_MAPS[finalView.regionId]
            ? diveShot(focusOf(finalView.regionId) ?? [0, 0])
            : shotFor(finalView, frame, focusPoint),
      });
    }
    cinemaExitTimerRef.current = setTimeout(() => setCinematicActive(false), CINEMA_FRAME_MS);
  }, [
    activeCinemaRef,
    cinemaExitTimerRef,
    cinemaProgress,
    cinemaStartTimerRef,
    finalZoom,
    finishMapIntro,
    focusPoint,
    frame,
    hudProgress,
    index,
    introReadyWaiterRef,
    open,
    resetWind,
    setCinematicActive,
    setDiving,
    skipArrivalIntroRef,
    snapCamera,
    veil,
    view,
    webgl,
  ]);
}
