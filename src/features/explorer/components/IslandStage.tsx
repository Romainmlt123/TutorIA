import { Canvas, useFrame } from '@react-three/fiber';
import { Suspense, useMemo, useRef, type RefObject } from 'react';
import { StyleSheet } from 'react-native';
import * as THREE from 'three';

import { explorerArt } from '@/theme/explorerArt';

import { distanceToFit, orbit } from '../hd2d/camera';
import { Hd2dPost } from '../hd2d/Hd2dPost';
import { Clouds, type CloudSpec } from '../stylized3d/Clouds';
import { coast, type Orbit } from '../logic/orbit';
import type { IslandFrame } from '../logic/stageFrame';
import { MathsIsland3D } from '../stylized3d/MathsIsland3D';

/*
 * Scène du carrousel (X1) : les îles alignées sur l'axe x, une tous les SPACING mètres, et la
 * caméra qui glisse de l'une à l'autre. Le ciel (dégradé) et l'étalonnage viennent de Hd2dPost.
 */

const SPACING = 8;
const FOV = 26;
const ELEVATION = 24;

/** Nuages du ciel, répartis le long de la rangée d'îles, qui dérivent lentement. */
function skyClouds(count: number): CloudSpec[] {
  return Array.from({ length: count * 2 + 2 }, (_, i) => ({
    x: -6 + i * (SPACING / 2) + (i % 3) * 0.7,
    y: i % 2 === 0 ? 2.2 + (i % 3) * 0.4 : -3.2 - (i % 4) * 0.3,
    z: -4.5 + (i % 3) * 1.6,
    scale: 0.8 + (i % 4) * 0.18,
    seed: i + 3,
    drift: 0.06 + (i % 5) * 0.02,
  }));
}

function stageClouds(count: number): { clouds: CloudSpec[]; wrap: readonly [number, number] } {
  return { clouds: skyClouds(count), wrap: [-8, count * SPACING + 8] };
}

/**
 * Caméra : cadrée pour que l'île (7,4 m de large) occupe `frame.fill` de la largeur de l'écran et
 * que sa visée tombe à `frame.aimY` de sa hauteur ; elle rejoint l'île choisie en douceur
 * (immédiatement si les animations sont réduites).
 */
function moveCamera(
  state: { camera: THREE.Camera; scene: THREE.Scene; size: { width: number; height: number } },
  current: RefObject<number | null>,
  targetX: number,
  frame: IslandFrame,
  orbitState: Orbit,
  delta: number,
  animated: boolean,
) {
  coast(orbitState, delta);
  const camera = state.camera as THREE.PerspectiveCamera;
  const { width, height } = state.size;
  const previous = current.current;
  const x =
    previous === null || !animated
      ? targetX
      : previous + (targetX - previous) * (1 - Math.exp(-delta * 5));
  current.current = x;
  const distance = distanceToFit(7.4, FOV, width / height, frame.fill);
  const target = new THREE.Vector3(x, -0.9, 0);
  camera.position.set(...orbit([x, -0.9, 0], distance, ELEVATION, orbitState.azimuth));
  camera.lookAt(target);
  camera.far = distance * 4;
  camera.setViewOffset(width, height, 0, (0.5 - frame.aimY) * height, width, height);
  camera.updateProjectionMatrix();
  if (state.scene.fog instanceof THREE.Fog) {
    state.scene.fog.near = distance + 4;
    state.scene.fog.far = distance + 30;
  } else {
    state.scene.fog = new THREE.Fog(explorerArt.fog, distance + 4, distance + 30);
  }
}

type CameraProps = {
  index: number;
  frame: IslandFrame;
  orbit: Orbit;
  animated: boolean;
};

function StageCamera({ index, frame, orbit: orbitState, animated }: CameraProps) {
  const current = useRef<number | null>(null);
  useFrame((state, delta) =>
    moveCamera(state, current, index * SPACING, frame, orbitState, delta, animated),
  );
  return null;
}

type Props = {
  slides: readonly { subjectId: string }[];
  index: number;
  frame: IslandFrame;
  /** Rotation au doigt, modifiée par le geste de l'écran et lue à chaque image. */
  orbit: Orbit;
  /** Faux quand l'onglet est caché ou l'app en arrière-plan : plus aucune image n'est calculée. */
  active: boolean;
  animated: boolean;
};

export function IslandStage({ slides, index, frame, orbit, active, animated }: Props) {
  const { clouds, wrap } = useMemo(() => stageClouds(slides.length), [slides.length]);
  const mathsIndex = slides.findIndex((slide) => slide.subjectId === 'maths');
  return (
    <Canvas
      style={StyleSheet.absoluteFill}
      frameloop={active ? 'always' : 'never'}
      dpr={[1, 2]}
      flat
      gl={{ antialias: false, alpha: true }}
      camera={{ fov: FOV }}>
      <StageCamera index={index} frame={frame} orbit={orbit} animated={animated} />
      <Clouds clouds={clouds} wrap={wrap} animated={animated} />
      {mathsIndex >= 0 ? (
        <group position={[mathsIndex * SPACING, 0, 0]}>
          <Suspense fallback={null}>
            <MathsIsland3D animated={animated} />
          </Suspense>
        </group>
      ) : null}
      <Hd2dPost focus={1 - frame.aimY} band={0.62} look={explorerArt.post.natural} />
    </Canvas>
  );
}
