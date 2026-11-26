import { useFrame } from '@react-three/fiber';
import { useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';

import { Avatar3D, AvatarLights, type AvatarAnimation } from '@/features/avatar/avatar3d/Avatar3D';
import type { AvatarLook } from '@/features/avatar/logic/avatarLook';
import { SCENE_TIME } from '@/lib/three/sceneClock';

import type { RegionMap } from '../logic/regionMap';
import {
  createChoreo,
  FEET,
  MAP_AVATAR_SHADOW,
  MAP_SCALE,
  takeArrival,
  tick,
  WALK_PLAYBACK,
} from './avatarChoreo';
import { groundShadows } from './groundShadows';

/*
 * L'avatar de l'élève sur la carte 3D d'une région, à la place du pion : il salue quand on entre
 * dans la région et attend sur son niveau (celui à jouer, ou celui que l'élève a touché). Quand ce
 * niveau change, il marche le long du chemin jusqu'à lui puis saute en arrivant (avatarChoreo).
 * Avec « Réduire les animations », il est posé, immobile, sur son niveau.
 */

/** L'avatar posé sur la carte : son apparence, son niveau, et l'annonce de son arrivée. */
export type AvatarOnMap = {
  look: AvatarLook;
  /** Niveau où il se tient (celui du pion, ou celui que l'élève vient de toucher). */
  levelId: string;
  /** Marche courte : l'élève a touché un niveau et attend sa fiche. */
  quick: boolean;
  onArrive: (levelId: string) => void;
};

type Props = { map: RegionMap; avatar: AvatarOnMap; animated: boolean };

export function MapAvatar({ map, avatar, animated }: Props) {
  const { look, levelId, quick, onArrive } = avatar;
  const found = map.nodes.findIndex((n) => n.levelId === levelId);
  const to = found >= 0 ? found : map.pawnIndex;
  const figure = useRef<THREE.Group>(null);
  const choreo = useMemo(() => createChoreo(), []);
  const shadow = useMemo(() => groundShadows([{ x: 0, z: 0, ...MAP_AVATAR_SHADOW }]), []);
  useEffect(
    () => () => {
      shadow.geometry.dispose();
      (shadow.material as THREE.Material).dispose();
    },
    [shadow],
  );
  const [animation, setAnimation] = useState<AvatarAnimation>('attente');
  useFrame((_, delta) => {
    const next = tick(choreo, map, to, quick, SCENE_TIME.value, delta, animated);
    const placed = figure.current;
    if (placed) {
      placed.position.set(choreo.x, FEET, choreo.z);
      placed.rotation.y = choreo.yaw;
    }
    shadow.position.set(choreo.x, 0, choreo.z);
    if (next !== animation) setAnimation(next);
    const arrived = takeArrival(choreo);
    if (arrived) onArrive(arrived);
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
