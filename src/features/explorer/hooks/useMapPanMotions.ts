import { useCallback } from 'react';
import { cancelAnimation, type SharedValue } from 'react-native-reanimated';
import { scheduleOnUI } from 'react-native-worklets';

import type { ImageFrame, ScreenSize } from '../logic/mapProjection';
import type { MapScroll } from '../logic/mapScroll';
import type { MapPoint, ZoomState } from '../logic/mapZoom';
import { INTRO_MS } from '../logic/cinematics';
import { applyZoomState, startMotion } from './mapPanMotion';

type Options = {
  animated: boolean;
  frame: ImageFrame | null;
  k: number;
  minZoom: number;
  motionFrom: SharedValue<ZoomState>;
  motionIsIntro: SharedValue<boolean>;
  motionProgress: SharedValue<number>;
  motionTo: SharedValue<ZoomState>;
  nodes: readonly MapPoint[];
  screen: ScreenSize;
  scroll: SharedValue<MapScroll>;
};

/** Anime les recadrages du pinçage, de l'arrivée et du recentrage. */
export function useMapPanMotions({
  animated,
  frame,
  k,
  minZoom,
  motionFrom,
  motionIsIntro,
  motionProgress,
  motionTo,
  nodes,
  screen,
  scroll,
}: Options) {
  const openAt = useCallback(
    (from: ZoomState, to: ZoomState, intro: boolean) => {
      if (!frame) return;
      scheduleOnUI(
        (
          start: ZoomState,
          target: ZoomState,
          targetFrame: ImageFrame,
          targetNodes: readonly MapPoint[],
          targetScreen: ScreenSize,
          targetK: number,
          targetScroll: SharedValue<MapScroll>,
          targetProgress: SharedValue<number>,
          targetTo: SharedValue<ZoomState>,
          isIntro: SharedValue<boolean>,
          shouldIntro: boolean,
        ) => {
          'worklet';
          cancelAnimation(targetProgress);
          targetProgress.set(-1);
          targetTo.set(target);
          isIntro.set(shouldIntro);
          applyZoomState(targetScroll, targetNodes, targetFrame, targetScreen, targetK, start);
        },
        from,
        to,
        frame,
        nodes,
        screen,
        k,
        scroll,
        motionProgress,
        motionTo,
        motionIsIntro,
        intro,
      );
    },
    [frame, k, motionIsIntro, motionProgress, motionTo, nodes, screen, scroll],
  );

  const animateTo = useCallback(
    (to: ZoomState, duration: number) => {
      if (!frame) return;
      scheduleOnUI(
        (
          target: ZoomState,
          targetProgress: SharedValue<number>,
          targetFrom: SharedValue<ZoomState>,
          targetTo: SharedValue<ZoomState>,
          isIntro: SharedValue<boolean>,
          targetScroll: SharedValue<MapScroll>,
          targetNodes: readonly MapPoint[],
          targetFrame: ImageFrame,
          targetScreen: ScreenSize,
          targetK: number,
          targetDuration: number,
          targetAnimated: boolean,
          targetMin: number,
        ) => {
          'worklet';
          startMotion(
            targetProgress,
            targetFrom,
            targetTo,
            isIntro,
            targetScroll,
            targetNodes,
            targetFrame,
            targetScreen,
            targetK,
            null,
            target,
            targetDuration,
            targetAnimated,
            false,
            targetMin,
          );
        },
        to,
        motionProgress,
        motionFrom,
        motionTo,
        motionIsIntro,
        scroll,
        nodes,
        frame,
        screen,
        k,
        duration,
        animated,
        minZoom,
      );
    },
    [
      animated,
      frame,
      k,
      minZoom,
      motionFrom,
      motionIsIntro,
      motionProgress,
      motionTo,
      nodes,
      screen,
      scroll,
    ],
  );

  const startIntro = useCallback(
    (from: ZoomState, to: ZoomState) => {
      if (!frame) return;
      scheduleOnUI(
        (
          start: ZoomState,
          target: ZoomState,
          targetProgress: SharedValue<number>,
          targetFrom: SharedValue<ZoomState>,
          targetTo: SharedValue<ZoomState>,
          isIntro: SharedValue<boolean>,
          targetScroll: SharedValue<MapScroll>,
          targetNodes: readonly MapPoint[],
          targetFrame: ImageFrame,
          targetScreen: ScreenSize,
          targetK: number,
          targetAnimated: boolean,
          targetMin: number,
        ) => {
          'worklet';
          startMotion(
            targetProgress,
            targetFrom,
            targetTo,
            isIntro,
            targetScroll,
            targetNodes,
            targetFrame,
            targetScreen,
            targetK,
            start,
            target,
            INTRO_MS,
            targetAnimated,
            true,
            targetMin,
          );
        },
        from,
        to,
        motionProgress,
        motionFrom,
        motionTo,
        motionIsIntro,
        scroll,
        nodes,
        frame,
        screen,
        k,
        true,
        minZoom,
      );
    },
    [frame, k, minZoom, motionFrom, motionIsIntro, motionProgress, motionTo, nodes, screen, scroll],
  );

  return { openAt, animateTo, startIntro };
}
