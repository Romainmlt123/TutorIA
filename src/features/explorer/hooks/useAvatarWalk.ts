import { useEffect, useEffectEvent, useMemo, useRef } from 'react';
import {
  Easing,
  runOnJS,
  useSharedValue,
  withTiming,
  type SharedValue,
} from 'react-native-reanimated';

import type { Route } from '../logic/avatarWalk';
import type { Vec } from '../logic/mapLayout';
import type { RegionMap } from '../logic/regionMap';
import {
  advanceChoreo,
  createChoreo,
  planChoreo,
  SEEN_LEVEL,
  type Choreo,
} from '../stylized3d/avatarChoreo';

type Options = {
  map: RegionMap;
  /** Niveau où l'avatar doit se tenir (celui du pion, ou celui que l'élève vient de toucher). */
  levelId: string | null;
  /** Marche courte : l'élève a touché un niveau et attend sa fiche. */
  quick: boolean;
  /** Faux avec « Réduire les animations » : l'avatar change de niveau d'un coup. */
  animated: boolean;
  /**
   * Vrai quand la carte se voit et que la figurine est prête : seulement alors l'avatar part vers
   * son niveau (au retour d'un niveau joué, la marche se fait sous les yeux de l'élève).
   */
  running: boolean;
  /** Le niveau est atteint (ou l'avatar y a été posé) : la fiche du niveau touché peut s'ouvrir. */
  onArrive: (levelId: string) => void;
};

export type AvatarWalk = {
  /** Chorégraphie (phase, cap), lue à chaque image par la figurine (MapAvatarCanvas). */
  choreo: Choreo;
  /** Trajet en cours (un seul point à l'arrêt) et part parcourue, de 0 à 1, sur le fil de l'interface. */
  route: SharedValue<Route>;
  progress: SharedValue<number>;
};

/**
 * Horloge de la marche (secondes) : le temps réel, celui de l'animation qui déplace l'avatar sur le
 * fil de l'interface. La figurine y lit sa phase et son cap, au même rythme que sa position.
 */
export function walkClock(): number {
  return performance.now() / 1000;
}

/** Trajet d'un seul point : l'avatar arrêté. */
function standingAt(point: Vec): Route {
  return { points: [{ x: point.x, z: point.z }], at: [0], length: 0 };
}

/**
 * Marche de l'avatar sur une carte pré-rendue (X2b). La chorégraphie (avatarChoreo, comme sur la
 * carte 3D) est prévue ici, sur le fil JS, chaque fois que le niveau de l'avatar change ; le trajet
 * part alors sur le fil de l'interface, qui avance la position à chaque image (`withTiming`) et
 * prévient le fil JS à l'arrivée. Aucun rendu React pendant la marche : la vue de l'avatar lit
 * `route` et `progress` sur le fil de l'interface, la figurine lit `choreo` à chaque image.
 */
export function useAvatarWalk({
  map,
  levelId,
  quick,
  animated,
  running,
  onArrive,
}: Options): AvatarWalk {
  const found = map.nodes.findIndex((n) => n.levelId === levelId);
  const to = found >= 0 ? found : map.pawnIndex;
  const choreo = useMemo(() => createChoreo(), []);
  // Avant de partir, il attend là où il s'est arrêté la dernière fois, sinon sur son niveau.
  const seen = animated
    ? map.nodes.find((n) => n.levelId === SEEN_LEVEL.get(map.regionId))
    : undefined;
  const route = useSharedValue<Route>(standingAt(seen ?? map.nodes[to] ?? { x: 0, z: 0 }));
  const progress = useSharedValue(0);
  // Niveau vers lequel il marche, jusqu'à son arrivée.
  const walkingTo = useRef<string | null>(null);
  const arrive = useEffectEvent((reached: string) => {
    SEEN_LEVEL.set(map.regionId, reached);
    onArrive(reached);
  });

  useEffect(() => {
    const target = map.nodes[to];
    if (!running || !target) return;
    // Déjà sur ce niveau (par exemple renvoyé, pendant une célébration, vers celui qu'il n'a pas
    // quitté) : son arrivée est annoncée tout de suite. En route vers lui, elle le sera à la fin de
    // la marche.
    if (choreo.levelId === target.levelId) {
      if (walkingTo.current !== target.levelId) arrive(target.levelId);
      return;
    }
    const now = walkClock();
    // Une marche en cours : sa position à cette heure (image de durée nulle, le cap ne bouge pas),
    // d'où repart la nouvelle.
    advanceChoreo(choreo, now, 0, animated);
    planChoreo(choreo, map, to, now, animated, quick);
    const walking = choreo.phase === 'walk' ? choreo.route : null;
    if (!walking) {
      walkingTo.current = null;
      route.set(standingAt(target));
      progress.set(0);
      arrive(target.levelId);
      return;
    }
    const finish = () => {
      walkingTo.current = null;
      arrive(target.levelId);
    };
    walkingTo.current = target.levelId;
    route.set(walking);
    progress.set(0);
    progress.set(
      withTiming(1, { duration: choreo.duration * 1000, easing: Easing.linear }, (finished) => {
        if (finished) runOnJS(finish)();
      }),
    );
  }, [running, map, to, quick, animated, choreo, route, progress]);

  return { choreo, route, progress };
}
