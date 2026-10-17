import { useCallback, useEffect, useMemo } from 'react';
import { Gesture } from 'react-native-gesture-handler';
import { runOnUI, useFrameCallback, useSharedValue, type FrameInfo } from 'react-native-reanimated';

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
 * Les règles sont celles de la carte 3D (`mapScroll`), donc la même sensation : élan, élastique d'un
 * tiers au-delà des bords, retour en douceur. Le point suivi est publié dans MAP_SCROLL_X/Z.
 *
 * Avec « Réduire les animations », la carte n'a aucun élan et se pose d'un coup (but atteint, bord
 * retrouvé) : le rappel d'image ne tourne jamais.
 */
export function useMapPan({ k, animated, running }: Options) {
  const scroll = useSharedValue<MapScroll>(createScroll());
  const kz = k * SIN;

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
        }),
    [scroll, k, kz, animated],
  );

  // Une image : la carte glisse sur son élan, vers son but ou vers le bord, puis s'arrête.
  const coast = useCallback(
    (frame: FrameInfo) => {
      'worklet';
      if (!isCoasting(scroll.value)) return;
      const delta = (frame.timeSincePreviousFrame ?? 0) / 1000;
      scroll.modify((s) => {
        'worklet';
        coastScroll(s, delta);
        return s;
      });
      publish(scroll.value);
    },
    [scroll],
  );
  const coaster = useFrameCallback(coast, false);
  const coasting = running && animated;
  useEffect(() => {
    coaster.setActive(coasting);
  }, [coaster, coasting]);

  /** Rectangle du point suivi (le point est ramené dedans). */
  const setBounds = useCallback(
    (bounds: Bounds) => {
      runOnUI((next: Bounds) => {
        'worklet';
        scroll.modify((s) => {
          'worklet';
          setScrollBounds(s, next);
          return s;
        });
        publish(scroll.value);
      })(bounds);
    },
    [scroll],
  );

  /** Pose la carte sur un point, sans glisser (ouverture d'une région). */
  const jumpTo = useCallback(
    (x: number, z: number) => {
      runOnUI((toX: number, toZ: number) => {
        'worklet';
        scroll.modify((s) => {
          'worklet';
          jumpToPoint(s, toX, toZ);
          return s;
        });
        publish(scroll.value);
      })(x, z);
    },
    [scroll],
  );

  /** Fait glisser la carte jusqu'à un point (ville précédente ou suivante), d'un coup sans animation. */
  const goTo = useCallback(
    (x: number, z: number) => {
      runOnUI((toX: number, toZ: number) => {
        'worklet';
        scroll.modify((s) => {
          'worklet';
          goToPoint(s, toX, toZ);
          if (!animated) settleScroll(s);
          return s;
        });
        publish(scroll.value);
      })(x, z);
    },
    [scroll, animated],
  );

  return { gesture, setBounds, jumpTo, goTo };
}
