import { useMemo } from 'react';
import { Gesture } from 'react-native-gesture-handler';
import { runOnJS, useSharedValue, type SharedValue } from 'react-native-reanimated';

import {
  beginScroll,
  dragScroll,
  isCoasting,
  releaseScroll,
  setBounds as setScrollBounds,
  settleScroll,
  type MapScroll,
} from '../logic/mapScroll';
import { MAP_ELEVATION } from '../logic/shots';
import {
  pinchZoom,
  pointForFocus,
  pointUnderFocus,
  TAP_ZOOM,
  TAP_ZOOM_MS,
  zoomScrollBounds,
  type Focus,
  type MapPoint,
  type ZoomState,
} from '../logic/mapZoom';
import type { ImageFrame, ScreenSize } from '../logic/mapProjection';
import { MAP_ZOOM } from './mapScrollValue';
import { applyZoomState, publish, startMotion } from './mapPanMotion';

const SIN = Math.sin((MAP_ELEVATION * Math.PI) / 180);

export type MapZone = { left: number; top: number; width: number; height: number };

type Options = {
  animated: boolean;
  cancelMotion: () => void;
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
  wake: () => void;
  zone: MapZone | null;
};

/** Compose les gestes simultanés de déplacement, pincement et zoom au toucher. */
export function useMapPanGestures({
  animated,
  cancelMotion,
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
  wake,
  zone,
}: Options) {
  const isPinching = useSharedValue(false);
  const pinchScale = useSharedValue(1);
  const pinchFocus = useSharedValue<Focus>({ x: 0, y: 0 });
  const panBase = useSharedValue<Focus>({ x: 0, y: 0 });
  const panTranslation = useSharedValue<Focus>({ x: 0, y: 0 });

  return useMemo(() => {
    const pan = Gesture.Pan()
      .minDistance(8)
      .onBegin(() => {
        'worklet';
        cancelMotion();
        panBase.set({ x: 0, y: 0 });
        panTranslation.set({ x: 0, y: 0 });
        if (frame) {
          scroll.modify((s) => {
            'worklet';
            setScrollBounds(s, zoomScrollBounds(nodes, frame, screen, k, MAP_ZOOM.value));
            beginScroll(s);
            return s;
          });
        } else {
          scroll.modify((s) => {
            'worklet';
            beginScroll(s);
            return s;
          });
        }
      })
      .onUpdate((event) => {
        'worklet';
        panTranslation.set({ x: event.translationX, y: event.translationY });
        if (isPinching.value) return;
        const zoom = MAP_ZOOM.value;
        scroll.modify((s) => {
          'worklet';
          dragScroll(
            s,
            event.translationX - panBase.value.x,
            event.translationY - panBase.value.y,
            k * zoom,
            k * zoom * SIN,
          );
          return s;
        });
        publish(scroll.value);
      })
      .onFinalize((event) => {
        'worklet';
        if (isPinching.value) return;
        const zoom = MAP_ZOOM.value;
        scroll.modify((s) => {
          'worklet';
          releaseScroll(s, event.velocityX, event.velocityY, k * zoom, k * zoom * SIN, animated);
          if (!animated) settleScroll(s);
          return s;
        });
        publish(scroll.value);
        if (isCoasting(scroll.value)) runOnJS(wake)();
      });

    const pinch = Gesture.Pinch()
      .onStart((event) => {
        'worklet';
        if (!frame) return;
        cancelMotion();
        isPinching.set(true);
        pinchScale.set(event.scale);
        pinchFocus.set({
          x: (zone?.left ?? 0) + event.focalX,
          y: (zone?.top ?? 0) + event.focalY,
        });
        panBase.set(panTranslation.value);
        scroll.modify((s) => {
          'worklet';
          beginScroll(s);
          return s;
        });
      })
      .onUpdate((event) => {
        'worklet';
        if (!frame || !isPinching.value) return;
        const focus = {
          x: (zone?.left ?? 0) + event.focalX,
          y: (zone?.top ?? 0) + event.focalY,
        };
        const scale = event.scale;
        const state = pinchZoom(
          nodes,
          frame,
          screen,
          k,
          { zoom: MAP_ZOOM.value, point: { x: scroll.value.x, z: scroll.value.z } },
          scale / pinchScale.value,
          pinchFocus.value,
          focus,
          minZoom,
        );
        applyZoomState(scroll, nodes, frame, screen, k, state);
        pinchScale.set(scale);
        pinchFocus.set(focus);
      })
      .onFinalize(() => {
        'worklet';
        if (!isPinching.value) return;
        isPinching.set(false);
        panBase.set(panTranslation.value);
        scroll.modify((s) => {
          'worklet';
          beginScroll(s);
          return s;
        });
      });

    const tap = Gesture.Tap().onEnd((event, success) => {
      'worklet';
      if (!success || !frame) return;
      cancelMotion();
      if (MAP_ZOOM.value >= TAP_ZOOM) return;
      const focus = {
        x: (zone?.left ?? 0) + event.x,
        y: (zone?.top ?? 0) + event.y,
      };
      const world = pointUnderFocus(
        { x: scroll.value.x, z: scroll.value.z },
        focus,
        screen,
        k,
        MAP_ZOOM.value,
      );
      const point = pointForFocus(world, focus, screen, k, 1);
      startMotion(
        motionProgress,
        motionFrom,
        motionTo,
        motionIsIntro,
        scroll,
        nodes,
        frame,
        screen,
        k,
        null,
        { zoom: 1, point },
        TAP_ZOOM_MS,
        animated,
        false,
        minZoom,
      );
    });
    return Gesture.Simultaneous(pan, pinch, tap);
  }, [
    animated,
    cancelMotion,
    frame,
    isPinching,
    k,
    minZoom,
    motionFrom,
    motionIsIntro,
    motionProgress,
    motionTo,
    nodes,
    panBase,
    panTranslation,
    pinchFocus,
    pinchScale,
    screen,
    scroll,
    wake,
    zone,
  ]);
}
