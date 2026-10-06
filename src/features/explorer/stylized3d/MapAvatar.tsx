import { useFrame } from '@react-three/fiber';
import { useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';

import { Avatar3D, AvatarLights, type AvatarAnimation } from '@/features/avatar/avatar3d/Avatar3D';
import type { AvatarLook } from '@/features/avatar/logic/avatarLook';

import { pointAlong, turnToward, walkRoute, walkSeconds, type Route } from '../logic/avatarWalk';
import type { RegionMap } from '../logic/regionMap';
import { groundShadows } from './groundShadows';

/*
 * L'avatar de l'élève sur la carte d'une région, à la place du pion : il salue quand on entre dans
 * la région, attend sur le niveau à jouer, et, quand le pion avance, marche le long du chemin
 * jusqu'au nouveau niveau puis saute en arrivant. Avec « Réduire les animations », il est posé,
 * immobile, sur son niveau.
 */

/**
 * Taille de la figurine sur la carte (1 m à l'échelle 1) : vue de haut, plus petite, elle ne
 * montrerait que ses cheveux. Elle reste moins haute que les monuments (environ 1,2 m).
 */
const MAP_SCALE = 0.9;
/** Hauteur des pieds : sur les points de niveau, au-dessus du chemin pavé. */
const FEET = 0.1;
/** Durées des animations jouées une fois (tools/avatar-3d/avatar.py) : salut et saut. */
const WAVE_SECONDS = 1.6;
const JUMP_SECONDS = 1.2;
/** La marche est jouée plus vite que nature : la figurine avance vite sur la carte. */
const WALK_PLAYBACK = 1.7;

/**
 * Dernier niveau où l'avatar a été vu, par région, le temps de la session : au retour sur la carte
 * (après un niveau joué, ou quand la scène est recréée), il marche depuis là.
 */
const SEEN_LEVEL = new Map<string, string>();

type Phase = 'wave' | 'walk' | 'jump' | 'idle';

type Choreo = {
  levelId: string | null;
  phase: Phase;
  since: number;
  route: Route | null;
  duration: number;
  x: number;
  z: number;
  yaw: number;
};

const ANIMATION: Record<Phase, AvatarAnimation> = {
  wave: 'salut',
  walk: 'marche',
  jump: 'saut',
  idle: 'attente',
};

function createChoreo(): Choreo {
  return { levelId: null, phase: 'idle', since: 0, route: null, duration: 0, x: 0, z: 0, yaw: 0 };
}

/** Le niveau du pion a changé (ou la carte vient de s'ouvrir) : marche, salut ou simple arrêt. */
function plan(c: Choreo, map: RegionMap, now: number, animated: boolean) {
  const target = map.nodes[map.pawnIndex]!;
  const opening = c.levelId === null;
  const previous = c.levelId ?? SEEN_LEVEL.get(map.regionId);
  const from = map.nodes.findIndex((n) => n.levelId === previous);
  SEEN_LEVEL.set(map.regionId, target.levelId);
  c.levelId = target.levelId;
  c.since = now;
  if (animated && from >= 0 && from !== map.pawnIndex) {
    c.route = walkRoute(map.path, from, map.pawnIndex);
    c.duration = walkSeconds(c.route);
    c.phase = 'walk';
    const start = pointAlong(c.route, 0);
    c.x = start.x;
    c.z = start.z;
    return;
  }
  c.route = null;
  c.x = target.x;
  c.z = target.z;
  c.phase = animated && opening ? 'wave' : 'idle';
}

/** Une image : avance la chorégraphie, place la figurine et son ombre ; rend l'animation à jouer. */
function tick(
  c: Choreo,
  map: RegionMap,
  now: number,
  delta: number,
  animated: boolean,
  figure: THREE.Group | null,
  shadow: THREE.Object3D,
): AvatarAnimation {
  if (c.levelId !== map.nodes[map.pawnIndex]?.levelId) plan(c, map, now, animated);
  const elapsed = now - c.since;
  let heading = 0;
  if (c.phase === 'walk' && c.route) {
    const progress = c.duration > 0 ? Math.min(elapsed / c.duration, 1) : 1;
    const at = pointAlong(c.route, progress * c.route.length);
    c.x = at.x;
    c.z = at.z;
    heading = at.heading;
    if (progress >= 1) {
      c.phase = 'jump';
      c.since = now;
    }
  } else if (c.phase === 'jump' && elapsed >= JUMP_SECONDS) {
    c.phase = 'idle';
  } else if (c.phase === 'wave' && elapsed >= WAVE_SECONDS) {
    c.phase = 'idle';
  }
  // En marchant, la figurine regarde où elle va ; arrêtée, elle se tourne vers l'élève (+z).
  const k = animated ? 1 - Math.exp(-delta * (c.phase === 'walk' ? 12 : 5)) : 1;
  c.yaw += turnToward(c.yaw, heading) * k;
  if (figure) {
    figure.position.set(c.x, FEET, c.z);
    figure.rotation.y = c.yaw;
  }
  shadow.position.set(c.x, 0, c.z);
  return ANIMATION[c.phase];
}

type Props = { map: RegionMap; look: AvatarLook; animated: boolean };

export function MapAvatar({ map, look, animated }: Props) {
  const figure = useRef<THREE.Group>(null);
  const choreo = useMemo(() => createChoreo(), []);
  const shadow = useMemo(() => groundShadows([{ x: 0, z: 0, radius: 0.28, height: 0.6 }]), []);
  useEffect(
    () => () => {
      shadow.geometry.dispose();
      (shadow.material as THREE.Material).dispose();
    },
    [shadow],
  );
  const [animation, setAnimation] = useState<AvatarAnimation>('attente');
  useFrame(({ clock }, delta) => {
    const next = tick(choreo, map, clock.elapsedTime, delta, animated, figure.current, shadow);
    if (next !== animation) setAnimation(next);
  });
  return (
    <>
      <AvatarLights />
      <primitive object={shadow} />
      <group ref={figure} scale={MAP_SCALE}>
        <Avatar3D
          look={look}
          animation={animation}
          animated={animated}
          speed={animation === 'marche' ? WALK_PLAYBACK : 1}
        />
      </group>
    </>
  );
}
