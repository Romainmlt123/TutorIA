import { Canvas, useFrame } from '@react-three/fiber';
import { Suspense, useMemo, useRef } from 'react';
import { StyleSheet } from 'react-native';
import * as THREE from 'three';

import { explorerArt } from '@/theme/explorerArt';

import { distanceToFit, orbit } from '../hd2d/camera';
import { Hd2dPost } from '../hd2d/Hd2dPost';
import { Clouds, type CloudSpec } from '../stylized3d/Clouds';
import { coast, type Orbit } from '../logic/orbit';
import { easeShot, type Shot } from '../logic/shots';
import { IsletAlgo } from '../stylized3d/IsletAlgo';
import { MathsIsland3D } from '../stylized3d/MathsIsland3D';
import type { RegionLook } from '../stylized3d/regionTint';

/*
 * Scène du carrousel (X1) : les îles alignées sur l'axe x, une tous les SPACING mètres, et la
 * caméra qui glisse de l'une à l'autre. Le ciel (dégradé) et l'étalonnage viennent de Hd2dPost.
 */

const SPACING = 8;
const FOV = 26;

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

/** État lissé de la caméra : position sur la rangée d'îles, cadrage courant, et si elle est au repos. */
type CameraState = { x: number; shot: Shot; settled: boolean };

/** Point de la scène (repère de l'île) où l'interface pose un panneau, avec son identifiant. */
export type StageAnchor = { id: string; position: readonly [number, number, number] };
/** Position à l'écran (pixels) d'un point d'ancrage. */
export type ScreenPoint = { id: string; x: number; y: number };

/** Projection des points d'ancrage à l'écran, caméra comprise (décalage de vue inclus). */
function projectAnchors(
  camera: THREE.Camera,
  anchors: readonly StageAnchor[],
  origin: number,
  size: { width: number; height: number },
): ScreenPoint[] {
  const point = new THREE.Vector3();
  return anchors.map((anchor) => {
    point.set(anchor.position[0] + origin, anchor.position[1], anchor.position[2]).project(camera);
    return {
      id: anchor.id,
      x: (point.x * 0.5 + 0.5) * size.width,
      y: (1 - (point.y * 0.5 + 0.5)) * size.height,
    };
  });
}

const EPSILON = 0.002;

/** Vrai quand la caméra a rattrapé son but (position et cadrage) et que l'île ne tourne plus. */
function isSettled(
  now: { x: number; shot: Shot },
  goal: { x: number; shot: Shot },
  orbitState: Orbit,
): boolean {
  const a = now.shot;
  const b = goal.shot;
  return (
    !orbitState.dragging &&
    orbitState.velocity === 0 &&
    Math.abs(now.x - goal.x) < EPSILON &&
    Math.abs(a.elevation - b.elevation) < 0.05 &&
    Math.abs(a.fill - b.fill) < EPSILON &&
    Math.abs(a.aimY - b.aimY) < EPSILON &&
    Math.abs(a.lookX - b.lookX) < 0.01 &&
    Math.abs(a.lookZ - b.lookZ) < 0.01
  );
}

/**
 * Caméra : cadrée pour que l'île (7,4 m de large) occupe `shot.fill` de la largeur de l'écran,
 * que sa visée tombe à `shot.aimY` de la hauteur et qu'elle la regarde de `shot.elevation` degrés.
 * Elle rejoint l'île choisie et le cadrage de la vue en douceur (d'un coup si les animations sont
 * réduites). La hauteur de la visée lissée est publiée dans `scene.userData.focus` pour le flou de
 * maquette de Hd2dPost.
 */
function moveCamera(
  state: { camera: THREE.Camera; scene: THREE.Scene; size: { width: number; height: number } },
  current: CameraState | null,
  target: { x: number; shot: Shot },
  orbitState: Orbit,
  delta: number,
  animated: boolean,
): CameraState {
  coast(orbitState, delta, target.shot.azimuthRange);
  const camera = state.camera as THREE.PerspectiveCamera;
  const { width, height } = state.size;
  const k = 1 - Math.exp(-delta * 5);
  const x = current === null || !animated ? target.x : current.x + (target.x - current.x) * k;
  const shot =
    current === null ? target.shot : easeShot(current.shot, target.shot, delta, animated);
  const distance = distanceToFit(7.4, FOV, width / height, shot.fill);
  const aim: [number, number, number] = [x + shot.lookX, shot.lookY, shot.lookZ];
  camera.position.set(...orbit(aim, distance, shot.elevation, orbitState.azimuth));
  camera.lookAt(new THREE.Vector3(...aim));
  camera.far = distance * 4;
  camera.setViewOffset(width, height, 0, (0.5 - shot.aimY) * height, width, height);
  camera.updateProjectionMatrix();
  state.scene.userData.focus = 1 - shot.aimY;
  if (state.scene.fog instanceof THREE.Fog) {
    state.scene.fog.near = distance + 4;
    state.scene.fog.far = distance + 30;
  } else {
    state.scene.fog = new THREE.Fog(explorerArt.fog, distance + 4, distance + 30);
  }
  return { x, shot, settled: isSettled({ x, shot }, target, orbitState) };
}

type CameraProps = {
  index: number;
  shot: Shot;
  orbit: Orbit;
  animated: boolean;
  anchors: readonly StageAnchor[];
  /** Appelée quand la caméra se met au repos (avec les positions à l'écran) ou se remet en route (null). */
  onProject?: (points: ScreenPoint[] | null) => void;
};

function StageCamera({
  index,
  shot,
  orbit: orbitState,
  animated,
  anchors,
  onProject,
}: CameraProps) {
  const current = useRef<CameraState | null>(null);
  useFrame((state, delta) => {
    const before = current.current?.settled ?? false;
    const next = moveCamera(
      state,
      current.current,
      { x: index * SPACING, shot },
      orbitState,
      delta,
      animated,
    );
    current.current = next;
    if (next.settled === before) return;
    onProject?.(
      next.settled ? projectAnchors(state.camera, anchors, index * SPACING, state.size) : null,
    );
  });
  return null;
}

type Props = {
  slides: readonly { subjectId: string }[];
  index: number;
  /** Cadrage de la vue courante : la caméra y glisse. */
  shot: Shot;
  /** Rotation au doigt, modifiée par le geste de l'écran et lue à chaque image. */
  orbit: Orbit;
  /** Teinte, région choisie et brume des régions (X2a) ; l'îlot de l'Algorithmique en dépend aussi. */
  regions: RegionLook;
  /** Points d'ancrage des panneaux, et rappel de leur position à l'écran quand la caméra est au repos. */
  anchors?: readonly StageAnchor[];
  onProject?: (points: ScreenPoint[] | null) => void;
  /** Faux quand l'onglet est caché ou l'app en arrière-plan : plus aucune image n'est calculée. */
  active: boolean;
  animated: boolean;
};

export function IslandStage({
  slides,
  index,
  shot,
  orbit,
  regions,
  anchors = [],
  onProject,
  active,
  animated,
}: Props) {
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
      <StageCamera
        index={index}
        shot={shot}
        orbit={orbit}
        animated={animated}
        anchors={anchors}
        onProject={onProject}
      />
      <Clouds clouds={clouds} wrap={wrap} animated={animated} />
      {mathsIndex >= 0 ? (
        <group position={[mathsIndex * SPACING, 0, 0]}>
          <Suspense fallback={null}>
            <MathsIsland3D animated={animated} regions={regions} />
            <IsletAlgo mix={regions.mix} animated={animated} />
          </Suspense>
        </group>
      ) : null}
      <Hd2dPost focus={1 - shot.aimY} band={0.62} look={explorerArt.post.natural} />
    </Canvas>
  );
}
