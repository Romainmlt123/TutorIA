import { Canvas, useFrame } from '@react-three/fiber';
import { useMemo, useRef, useState } from 'react';
import { StyleSheet } from 'react-native';
import * as THREE from 'three';

import { Avatar3D, AvatarLights, type AvatarAnimation } from '@/features/avatar/avatar3d/Avatar3D';
import type { AvatarLook } from '@/features/avatar/logic/avatarLook';
import { FrameDriver } from '@/lib/three/FrameDriver';
import { PerfProbe } from '@/lib/three/PerfProbe';

import { SsaaResolve } from '../hd2d/SsaaResolve';
import { walkClock } from '../hooks/useAvatarWalk';
import type { AvatarFrame } from '../logic/avatarFrame';
import { MAP_ELEVATION } from '../logic/shots';
import { advanceChoreo, FEET, MAP_SCALE, WALK_PLAYBACK, type Choreo } from './avatarChoreo';
import { SUN_DIRECTION } from './sun';

/** Images par seconde : la figurine qui bouge (marche, salut, saut), puis celle qui attend. */
const MOVING_FPS = 60;
const IDLE_FPS = 30;
/** Distance de la caméra aux pieds (m) : sans effet sur l'image, la projection est orthographique. */
const CAMERA_DISTANCE = 10;

/**
 * Caméra orthographique de la carte pré-rendue (52° d'élévation, comme Blender), cadrée autour des
 * pieds de la figurine (origine de la scène) : la vue de l'avatar a l'échelle exacte des tuiles.
 */
function mapCamera(frustum: AvatarFrame['frustum']): THREE.OrthographicCamera {
  const camera = new THREE.OrthographicCamera(
    frustum.left,
    frustum.right,
    frustum.top,
    frustum.bottom,
    0.1,
    2 * CAMERA_DISTANCE,
  );
  const elevation = (MAP_ELEVATION * Math.PI) / 180;
  camera.position.set(
    0,
    CAMERA_DISTANCE * Math.sin(elevation),
    CAMERA_DISTANCE * Math.cos(elevation),
  );
  camera.lookAt(0, 0, 0);
  camera.updateProjectionMatrix();
  // R3F ne recadre pas une caméra « manuelle » quand la vue change de taille.
  return Object.assign(camera, { manual: true });
}

type FigureProps = {
  look: AvatarLook;
  choreo: Choreo;
  active: boolean;
  animated: boolean;
};

/**
 * La figurine, à sa place dans la vue (ses pieds sur l'origine) : sa position sur la carte est
 * tenue par la vue qui la porte. À chaque image, elle lit sa phase et son cap dans la chorégraphie,
 * à l'heure de la marche (`walkClock`), sans rendu React de l'écran.
 */
function Figure({ look, choreo, active, animated }: FigureProps) {
  const figure = useRef<THREE.Group>(null);
  const [animation, setAnimation] = useState<AvatarAnimation>('attente');
  useFrame((_, delta) => {
    const next = advanceChoreo(choreo, walkClock(), delta, animated);
    if (figure.current) figure.current.rotation.y = choreo.yaw;
    if (next !== animation) setAnimation(next);
  });
  return (
    <>
      <FrameDriver
        active={active}
        animated={animated}
        fps={animation === 'attente' ? IDLE_FPS : MOVING_FPS}
      />
      <group ref={figure} position={[0, FEET, 0]} scale={MAP_SCALE}>
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

type Props = FigureProps & {
  frame: AvatarFrame;
  /** La figurine s'est montrée pour la première fois (modèle chargé, première image dessinée). */
  onShown: () => void;
  /** Sonde du compteur de performance (développement seulement, `usePerfHud`). */
  probe?: boolean;
};

/**
 * L'avatar de l'élève sur une carte pré-rendue (X2b) : seule 3D en temps réel de la carte, dans une
 * petite vue transparente posée dans le contenu qui défile (MapAvatarView), qui la déplace avec les
 * tuiles. La scène ne contient que la figurine, éclairée par le soleil de la cuisson, rendue en
 * projection orthographique (`flat`, sans tonemapping) puis suréchantillonnée et étalonnée comme
 * les tuiles (SsaaResolve). Les images sont plafonnées (FrameDriver) : 60 par seconde quand elle
 * bouge, 30 quand elle attend, aucune au repos avec « Réduire les animations ».
 */
export function MapAvatarCanvas({ look, choreo, active, animated, frame, onShown, probe }: Props) {
  const camera = useMemo(() => mapCamera(frame.frustum), [frame.frustum]);
  return (
    <Canvas
      style={styles.canvas}
      frameloop="never"
      dpr={[1, 2]}
      flat
      gl={{ antialias: false, alpha: true }}
      camera={camera}>
      <AvatarLights sun={SUN_DIRECTION} />
      <Figure look={look} choreo={choreo} active={active} animated={animated} />
      <SsaaResolve onShown={onShown} />
      {probe ? <PerfProbe /> : null}
    </Canvas>
  );
}

const styles = StyleSheet.create({
  // La vue n'écoute aucun toucher, même sur le web, où R3F pose sinon `pointer-events: auto`.
  canvas: { ...StyleSheet.absoluteFill, pointerEvents: 'none' },
});
