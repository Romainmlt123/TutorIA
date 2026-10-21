import { cancelAnimation, Easing, withTiming, type SharedValue } from 'react-native-reanimated';

import { clampScroll, type ImageFrame, type ScreenSize } from '../logic/mapProjection';
import { clampZoom, type MapPoint, type ZoomState, zoomScrollBounds } from '../logic/mapZoom';
import {
  jumpTo as jumpToPoint,
  setBounds as setScrollBounds,
  type MapScroll,
} from '../logic/mapScroll';
import { MAP_SCROLL_X, MAP_SCROLL_Z, MAP_ZOOM } from './mapScrollValue';

export function publish(scroll: MapScroll) {
  'worklet';
  MAP_SCROLL_X.value = scroll.x;
  MAP_SCROLL_Z.value = scroll.z;
}

export function applyZoomState(
  scroll: SharedValue<MapScroll>,
  nodes: readonly MapPoint[],
  frame: ImageFrame,
  screen: ScreenSize,
  k: number,
  state: ZoomState,
) {
  'worklet';
  const bounds = zoomScrollBounds(nodes, frame, screen, k, state.zoom);
  MAP_ZOOM.set(state.zoom);
  scroll.modify((s) => {
    'worklet';
    setScrollBounds(s, bounds);
    jumpToPoint(s, state.point.x, state.point.z);
    return s;
  });
  publish(scroll.value);
}

export function startMotion(
  progress: SharedValue<number>,
  fromValue: SharedValue<ZoomState>,
  toValue: SharedValue<ZoomState>,
  isIntro: SharedValue<boolean>,
  scroll: SharedValue<MapScroll>,
  nodes: readonly MapPoint[],
  frame: ImageFrame,
  screen: ScreenSize,
  k: number,
  from: ZoomState | null,
  to: ZoomState,
  duration: number,
  animated: boolean,
  intro: boolean,
  minZoom: number,
) {
  'worklet';
  cancelAnimation(progress);
  const current = scroll.value;
  const start = from ?? {
    zoom: MAP_ZOOM.value,
    point: { x: current.x, z: current.z },
  };
  const zoom = clampZoom(to.zoom, minZoom);
  const bounds = zoomScrollBounds(nodes, frame, screen, k, zoom);
  const target = {
    zoom,
    point: clampScroll(to.point.x, to.point.z, bounds),
  };
  fromValue.set(start);
  toValue.set(target);
  isIntro.set(intro);
  if (!animated) {
    progress.set(-1);
    applyZoomState(scroll, nodes, frame, screen, k, target);
    isIntro.set(false);
    return;
  }
  progress.set(0);
  progress.set(withTiming(1, { duration, easing: Easing.inOut(Easing.cubic) }));
}
