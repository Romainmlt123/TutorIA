import { useCallback, useEffect, useMemo, useRef } from 'react';
import { Gesture } from 'react-native-gesture-handler';
import { runOnJS, useFrameCallback, useSharedValue, type FrameInfo } from 'react-native-reanimated';
import { scheduleOnUI } from 'react-native-worklets';

import {
  beginScroll,
  coastScroll,
  createScroll,
  dragScroll,
  goTo as goToPoint,
  isCoasting,
  jumpTo as jumpToPoint,
  releaseScroll,
  setBounds as setScrollBounds,
  settleScroll,
  type Bounds,
  type MapScroll,
} from '../logic/mapScroll';
import { MAP_ELEVATION } from '../logic/shots';
import { MAP_SCROLL_X, MAP_SCROLL_Z } from './mapScrollValue';

const SIN = Math.sin((MAP_ELEVATION * Math.PI) / 180);

type Options = {
  /** Échelle de la carte : dp par mètre selon x (dpPerMeter). La vue plongeante raccourcit z. */
  k: number;
  /** Faux avec « Réduire les animations » : ni élan, ni glissement, la carte se pose d'un coup. */
  animated: boolean;
  /** Vrai quand la carte se voit et que l'onglet est affiché : seulement alors elle peut glisser. */
  running: boolean;
};

/** Point suivi publié pour ceux qui le lisent (contenu de la carte, en-tête, boutons). */
function publish(scroll: MapScroll) {
  'worklet';
  MAP_SCROLL_X.value = scroll.x;
  MAP_SCROLL_Z.value = scroll.z;
}

/**
 * Défilement d'une carte pré-rendue sur le fil de l'interface, sans repasser par le fil JS : le
 * geste tire le sol, et un rappel d'image (`useFrameCallback`) fait glisser la carte après le lâcher.
 * Ce rappel ne tourne que pendant que la carte glisse : au repos, il s'arrête, et la carte ne
 * demande plus aucune image.
 * Les règles sont celles de la carte 3D (`mapScroll`), donc la même sensation : élan, élastique d'un
 * tiers au-delà des bords, retour en douceur. Le point suivi est publié dans MAP_SCROLL_X/Z.
 *
 * Avec « Réduire les animations », la carte n'a aucun élan et se pose d'un coup (but atteint, bord
 * retrouvé) : le rappel d'image ne tourne jamais.
 */
export function useMapPan({ k, animated, running }: Options) {
  const scroll = useSharedValue<MapScroll>(createScroll());
  const kz = k * SIN;
  // Le rappel d'image a demandé à s'arrêter : il ne le redemande pas à chaque image.
  const stopping = useSharedValue(false);
  // Le rappel d'image lui-même, que `sleep` arrête (il n'existe qu'après `coast`, qui appelle `sleep`).
  const coasterRef = useRef<{ setActive: (active: boolean) => void } | null>(null);
  const sleep = useCallback(() => coasterRef.current?.setActive(false), []);

  // Une image : la carte glisse sur son élan, vers son but ou vers le bord, puis s'arrête.
  const coast = useCallback(
    (frame: FrameInfo) => {
      'worklet';
      if (!isCoasting(scroll.value)) {
        if (!stopping.get()) {
          stopping.set(true);
          runOnJS(sleep)();
        }
        return;
      }
      // Première image après le réveil : pas d'intervalle connu, celui d'un écran à 60 Hz.
      const delta = (frame.timeSincePreviousFrame ?? 1000 / 60) / 1000;
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
  // Réveille le rappel d'image : la carte va glisser (lâcher avec élan, ville visée, bords changés).
  // S'il n'y a rien à faire, il s'arrête dès sa première image.
  const wake = useCallback(() => {
    if (!glides) return;
    stopping.set(false);
    coaster.setActive(true);
  }, [coaster, glides, stopping]);
  useEffect(() => {
    if (glides) wake();
    else coaster.setActive(false);
  }, [coaster, glides, wake]);

  const gesture = useMemo(
    () =>
      Gesture.Pan()
        .minDistance(8)
        .onBegin(() => {
          'worklet';
          scroll.modify((s) => {
            'worklet';
            beginScroll(s);
            return s;
          });
        })
        .onUpdate((event) => {
          'worklet';
          scroll.modify((s) => {
            'worklet';
            dragScroll(s, event.translationX, event.translationY, k, kz);
            return s;
          });
          publish(scroll.value);
        })
        .onFinalize((event) => {
          'worklet';
          scroll.modify((s) => {
            'worklet';
            releaseScroll(s, event.velocityX, event.velocityY, k, kz, animated);
            if (!animated) settleScroll(s);
            return s;
          });
          publish(scroll.value);
          if (isCoasting(scroll.value)) runOnJS(wake)();
        }),
    [scroll, k, kz, animated, wake],
  );

  /** Rectangle du point suivi (le point est ramené dedans). */
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

  /** Pose la carte sur un point, sans glisser (ouverture d'une région). */
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

  /** Fait glisser la carte jusqu'à un point (ville précédente ou suivante), d'un coup sans animation. */
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

  return { gesture, setBounds, jumpTo, goTo };
}
