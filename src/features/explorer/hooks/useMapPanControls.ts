import { useCallback } from 'react';
import { type SharedValue } from 'react-native-reanimated';
import { scheduleOnUI } from 'react-native-worklets';

import type { ImageFrame, ScreenSize } from '../logic/mapProjection';
import {
  goTo as goToPoint,
  jumpTo as jumpToPoint,
  setBounds as setScrollBounds,
  settleScroll,
  type Bounds,
  type MapScroll,
} from '../logic/mapScroll';
import { TAP_ZOOM_MS, type MapPoint, type ZoomState } from '../logic/mapZoom';
import { publish, startMotion } from './mapPanMotion';
import { useMapPanMotions } from './useMapPanMotions';

type Options = Parameters<typeof useMapPanMotions>[0] & { wake: () => void };

/** Expose les commandes de défilement et de cadrage de la carte. */
export function useMapPanControls(options: Options) {
  const {
    wake,
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
  } = options;
  const motions = useMapPanMotions(options);

  const setBounds = useCallback(
    (bounds: Bounds) => {
      scheduleOnUI((next: Bounds) => {
        'worklet';
        scroll.modify((s) => {
          'worklet';
          setScrollBounds(s, next);
          return s;
        });
        publish(scroll.value);
      }, bounds);
      wake();
    },
    [scroll, wake],
  );

  const jumpTo = useCallback(
    (x: number, z: number) => {
      scheduleOnUI(
        (toX: number, toZ: number) => {
          'worklet';
          scroll.modify((s) => {
            'worklet';
            jumpToPoint(s, toX, toZ);
            return s;
          });
          publish(scroll.value);
        },
        x,
        z,
      );
    },
    [scroll],
  );

  const goTo = useCallback(
    (x: number, z: number) => {
      scheduleOnUI(
        (toX: number, toZ: number) => {
          'worklet';
          scroll.modify((s) => {
            'worklet';
            goToPoint(s, toX, toZ);
            if (!animated) settleScroll(s);
            return s;
          });
          publish(scroll.value);
        },
        x,
        z,
      );
      wake();
    },
    [scroll, animated, wake],
  );

  const recenter = useCallback(
    (x: number, z: number) => {
      if (!frame) return;
      scheduleOnUI(
        (
          target: MapPoint,
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
            null,
            { zoom: 1, point: target },
            TAP_ZOOM_MS,
            targetAnimated,
            false,
            targetMin,
          );
        },
        { x, z },
        motionProgress,
        motionFrom,
        motionTo,
        motionIsIntro,
        scroll,
        nodes,
        frame,
        screen,
        k,
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

  return { setBounds, jumpTo, goTo, ...motions, recenter };
}
