import { useCallback, useEffect, useRef } from 'react';
import {
  cancelAnimation,
  runOnJS,
  useAnimatedReaction,
  useFrameCallback,
  useSharedValue,
  type FrameInfo,
} from 'react-native-reanimated';

import { coastScroll, createScroll, isCoasting, type MapScroll } from '../logic/mapScroll';
import {
  introAt,
  overviewFrame,
  overviewZoom,
  type MapPoint,
  type ZoomState,
} from '../logic/mapZoom';
import type { ImageFrame, ScreenSize } from '../logic/mapProjection';
import { OVERVIEW_MIN_FACTOR } from '../logic/cinematics';
import { applyZoomState, publish } from './mapPanMotion';
import { useMapPanControls } from './useMapPanControls';
import { useMapPanGestures, type MapZone } from './useMapPanGestures';

const FALLBACK_MIN_ZOOM = 0.05;

type Options = {
  /** Échelle de la carte : dp par mètre selon x. */
  k: number;
  /** Faux avec « Réduire les animations » : ni élan, ni glissement, la carte se pose d'un coup. */
  animated: boolean;
  /** Vrai quand la carte se voit et que l'onglet est affiché : seulement alors elle peut glisser. */
  running: boolean;
  frame: ImageFrame | null;
  overview?: ImageFrame | null;
  nodes: readonly MapPoint[];
  screen: ScreenSize;
  zone: MapZone | null;
  onIntroEnd: () => void;
};

/** Défilement d'une carte pré-rendue sur le fil UI, partagé par ses couches et son avatar. */
export function useMapPan({
  k,
  animated,
  running,
  frame,
  overview,
  nodes,
  screen,
  zone,
  onIntroEnd,
}: Options) {
  const scroll = useSharedValue<MapScroll>(createScroll());
  const motionProgress = useSharedValue(-1);
  const motionFrom = useSharedValue<ZoomState>({ zoom: 1, point: { x: 0, z: 0 } });
  const motionTo = useSharedValue<ZoomState>({ zoom: 1, point: { x: 0, z: 0 } });
  const motionIsIntro = useSharedValue(false);
  const minZoom =
    frame && zone
      ? overviewZoom(
          overview ?? overviewFrame(frame),
          { width: zone.width, height: zone.height },
          k,
        ) * OVERVIEW_MIN_FACTOR
      : FALLBACK_MIN_ZOOM;

  useAnimatedReaction(
    () => motionProgress.value,
    (progress) => {
      if (progress < 0 || !frame) return;
      applyZoomState(
        scroll,
        nodes,
        frame,
        screen,
        k,
        introAt(progress, motionFrom.value, motionTo.value),
      );
      if (progress >= 1) {
        const intro = motionIsIntro.value;
        motionProgress.set(-1);
        motionIsIntro.set(false);
        if (intro) runOnJS(onIntroEnd)();
      }
    },
    [frame, nodes, screen, k, onIntroEnd],
  );

  const cancelMotion = useCallback(() => {
    'worklet';
    const intro = motionIsIntro.value;
    if (motionProgress.value < 0 && !intro) return;
    cancelAnimation(motionProgress);
    motionProgress.set(-1);
    motionIsIntro.set(false);
    if (intro && frame) {
      applyZoomState(scroll, nodes, frame, screen, k, motionTo.value);
      runOnJS(onIntroEnd)();
    }
  }, [frame, nodes, screen, k, motionProgress, motionIsIntro, motionTo, onIntroEnd, scroll]);

  const stopping = useSharedValue(false);
  const coasterRef = useRef<{ setActive: (active: boolean) => void } | null>(null);
  const sleep = useCallback(() => coasterRef.current?.setActive(false), []);
  const coast = useCallback(
    (frameInfo: FrameInfo) => {
      'worklet';
      if (!isCoasting(scroll.value)) {
        if (!stopping.get()) {
          stopping.set(true);
          runOnJS(sleep)();
        }
        return;
      }
      const delta = (frameInfo.timeSincePreviousFrame ?? 1000 / 60) / 1000;
      scroll.modify((s) => {
        'worklet';
        coastScroll(s, delta);
        return s;
      });
      publish(scroll.value);
    },
    [scroll, stopping, sleep],
  );
  const coaster = useFrameCallback(coast, false);
  useEffect(() => {
    coasterRef.current = coaster;
  }, [coaster]);
  const glides = running && animated;
  const wake = useCallback(() => {
    if (!glides) return;
    stopping.set(false);
    coaster.setActive(true);
  }, [coaster, glides, stopping]);
  useEffect(() => {
    if (glides) wake();
    else coaster.setActive(false);
  }, [coaster, glides, wake]);

  const controls = useMapPanControls({
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
    wake,
  });
  const gesture = useMapPanGestures({
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
  });

  return { gesture, ...controls };
}
