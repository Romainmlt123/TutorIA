import { Canvas, useFrame } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import { StyleSheet } from 'react-native';
import * as THREE from 'three';

import { explorerArt } from '@/theme/explorerArt';

import { distanceToFit, orbit } from '../hd2d/camera';
import { Hd2dPost } from '../hd2d/Hd2dPost';
import { Clouds, type CloudSpec } from '../stylized3d/Clouds';
import { coastScroll, type MapScroll } from '../logic/mapScroll';
import { coast, type Orbit } from '../logic/orbit';
import type { RegionMap } from '../logic/regionMap';
import { easeShot, type Shot } from '../logic/shots';
import { MAP_SCROLL_X, MAP_SCROLL_Z } from '../hooks/mapScrollValue';
import { IsletAlgo } from '../stylized3d/IsletAlgo';
import { MathsIsland3D } from '../stylized3d/MathsIsland3D';
import type { RegionLook } from '../stylized3d/regionTint';
import { RegionWorld } from '../stylized3d/RegionWorld';

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

/** Nuages sous l'île d'une région : on la voit de haut, ils ne doivent pas la cacher. */
function mapClouds(bounds: RegionMap['bounds']): {
  clouds: CloudSpec[];
  wrap: readonly [number, number];
} {
  const width = bounds.maxX - bounds.minX + 16;
  const depth = bounds.maxZ - bounds.minZ + 16;
  const count = Math.ceil((width * depth) / 40);
  const clouds = Array.from({ length: count }, (_, i) => ({
    x: bounds.minX - 8 + ((i * 0.618034) % 1) * width,
    y: -2.6 - (i % 4) * 0.5,
    z: bounds.minZ - 8 + ((i * 0.381966 + 0.2) % 1) * depth,
    scale: 0.9 + (i % 4) * 0.2,
    seed: i + 3,
    drift: 0.06 + (i % 5) * 0.02,
  }));
  return { clouds, wrap: [bounds.minX - 10, bounds.maxX + 10] };
}

/** État lissé de la caméra : position sur la rangée d'îles, cadrage courant, et si elle est au repos. */
type CameraState = { x: number; z: number; shot: Shot; settled: boolean };

/** Point de la scène (repère de l'île) où l'interface pose un panneau, avec son identifiant. */
export type StageAnchor = { id: string; position: readonly [number, number, number] };
/**
 * Position à l'écran (pixels) d'un point d'ancrage, et `k` et `kz` : pixels par mètre selon x et
 * selon z à sa profondeur (pour placer une interface sur la carte d'une région pendant le
 * déplacement : la caméra est presque sans perspective, la position est donc une droite du déplacement).
 */
export type ScreenPoint = { id: string; x: number; y: number; k: number; kz: number };

/** Projection des points d'ancrage à l'écran, caméra comprise (décalage de vue inclus). */
function projectAnchors(
  camera: THREE.Camera,
  anchors: readonly StageAnchor[],
  origin: number,
  size: { width: number; height: number },
): ScreenPoint[] {
  const point = new THREE.Vector3();
  const toScreen = (v: THREE.Vector3) => ({
    x: (v.x * 0.5 + 0.5) * size.width,
    y: (1 - (v.y * 0.5 + 0.5)) * size.height,
  });
  return anchors.map((anchor) => {
    const [ax, ay, az] = anchor.position;
    const here = toScreen(point.set(ax + origin, ay, az).project(camera));
    const meterRight = toScreen(point.set(ax + origin + 1, ay, az).project(camera));
    const meterNear = toScreen(point.set(ax + origin, ay, az + 1).project(camera));
    return {
      id: anchor.id,
      x: here.x,
      y: here.y,
      k: meterRight.x - here.x,
      kz: meterNear.y - here.y,
    };
  });
}

const EPSILON = 0.002;

/** Vrai quand la caméra a rattrapé son but (position et cadrage) et que l'île ne tourne plus. */
function isSettled(
  now: { x: number; z: number; shot: Shot },
  goal: { x: number; z: number; shot: Shot },
  orbitState: Orbit,
): boolean {
  const a = now.shot;
  const b = goal.shot;
  return (
    !orbitState.dragging &&
    orbitState.velocity === 0 &&
    Math.abs(now.x - goal.x) < EPSILON &&
    Math.abs(now.z - goal.z) < EPSILON &&
    Math.abs(a.fov - b.fov) < 0.05 &&
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
  target: { x: number; z: number; shot: Shot },
  orbitState: Orbit,
  scroll: MapScroll | null,
  delta: number,
  animated: boolean,
): CameraState {
  coast(orbitState, delta, target.shot.azimuthRange);
  // Carte d'une région : la caméra suit le défilement à la lettre, sans lissage (le doigt la mène).
  if (scroll) {
    coastScroll(scroll, delta, animated);
    MAP_SCROLL_X.value = scroll.x;
    MAP_SCROLL_Z.value = scroll.z;
  }
  const camera = state.camera as THREE.PerspectiveCamera;
  const { width, height } = state.size;
  const k = 1 - Math.exp(-delta * 5);
  const x = scroll
    ? scroll.x
    : current === null || !animated
      ? target.x
      : current.x + (target.x - current.x) * k;
  const z = scroll ? scroll.z : target.z;
  const shot =
    current === null ? target.shot : easeShot(current.shot, target.shot, delta, animated);
  const distance = distanceToFit(7.4, shot.fov, width / height, shot.fill);
  const aim: [number, number, number] = [x + shot.lookX, shot.lookY, z + shot.lookZ];
  camera.fov = shot.fov;
  camera.position.set(...orbit(aim, distance, shot.elevation, shot.azimuth ?? orbitState.azimuth));
  camera.lookAt(new THREE.Vector3(...aim));
  camera.far = distance * 4;
  // Très loin, un plan proche à 0,1 m ferait trembler les surfaces posées l'une sur l'autre.
  camera.near = shot.fov < 10 ? distance * 0.6 : 0.1;
  camera.setViewOffset(width, height, 0, (0.5 - shot.aimY) * height, width, height);
  camera.updateProjectionMatrix();
  // À jour tout de suite : la projection des points d'ancrage se fait avant le rendu de l'image.
  camera.updateMatrixWorld();
  state.scene.userData.focus = 1 - shot.aimY;
  if (state.scene.fog instanceof THREE.Fog) {
    state.scene.fog.near = distance + 4;
    state.scene.fog.far = distance + 30;
  } else {
    state.scene.fog = new THREE.Fog(explorerArt.fog, distance + 4, distance + 30);
  }
  // Sur une carte de région la caméra suit le défilement : sa position est toujours son but.
  const goal = scroll ? { x, z, shot: target.shot } : target;
  // Sur la carte, la caméra n'est au repos qu'une fois le doigt levé et l'élan éteint : c'est alors
  // que les positions à l'écran sont relevées (elles servent d'origine aux boutons pendant le déplacement).
  const still = !scroll || (!scroll.dragging && scroll.vx === 0 && scroll.vz === 0 && !scroll.goal);
  return { x, z, shot, settled: still && isSettled({ x, z, shot }, goal, orbitState) };
}

type CameraProps = {
  index: number;
  shot: Shot;
  orbit: Orbit;
  animated: boolean;
  anchors: readonly StageAnchor[];
  /** Défilement de la carte d'une région, ou null sur l'île. */
  scroll: MapScroll | null;
  /**
   * Appelée quand la caméra se met au repos (avec les positions à l'écran, et la position de la
   * caméra sur la carte) ou se remet en route (null).
   */
  onProject?: (points: ScreenPoint[] | null, camera: { x: number; z: number }) => void;
};

function StageCamera({
  index,
  shot,
  orbit: orbitState,
  animated,
  anchors,
  scroll,
  onProject,
}: CameraProps) {
  const current = useRef<CameraState | null>(null);
  // Dernière projection : quels points, et d'où. Une nouvelle liste (autre vue, autre région), ou une
  // caméra posée ailleurs, se projette à nouveau : la caméra peut arriver en une seule image (animations
  // réduites, image très lente) sans jamais être vue en mouvement.
  const projected = useRef<{ anchors: readonly StageAnchor[]; x: number; z: number } | null>(null);
  // Entrer dans une région ou en sortir est une coupure, cachée par le voile : la caméra ne traverse
  // pas la scène, elle se pose directement sur son nouveau cadrage.
  const hadScroll = useRef(scroll !== null);
  useFrame((state, delta) => {
    if (hadScroll.current !== (scroll !== null)) {
      hadScroll.current = scroll !== null;
      current.current = null;
    }
    const before = current.current?.settled ?? false;
    const next = moveCamera(
      state,
      current.current,
      { x: index * SPACING, z: 0, shot },
      orbitState,
      scroll,
      delta,
      animated,
    );
    current.current = next;
    const last = projected.current;
    const stale =
      !last ||
      last.anchors !== anchors ||
      Math.abs(last.x - next.x) > EPSILON ||
      Math.abs(last.z - next.z) > EPSILON;
    if (next.settled && stale) {
      projected.current = { anchors, x: next.x, z: next.z };
      onProject?.(projectAnchors(state.camera, anchors, scroll ? 0 : index * SPACING, state.size), {
        x: next.x + next.shot.lookX,
        z: next.z + next.shot.lookZ,
      });
    } else if (!next.settled && before) {
      projected.current = null;
      onProject?.(null, { x: next.x + next.shot.lookX, z: next.z + next.shot.lookZ });
    }
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
  onProject?: (points: ScreenPoint[] | null, camera: { x: number; z: number }) => void;
  /** Carte de la région ouverte (X2b), sa couleur et son déplacement : elle remplace l'île à l'écran. */
  region?: { map: RegionMap; color: string; scroll: MapScroll } | null;
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
  region = null,
  active,
  animated,
}: Props) {
  const bounds = region?.map.bounds;
  const { clouds, wrap } = useMemo(
    () => (bounds ? mapClouds(bounds) : stageClouds(slides.length)),
    [bounds, slides.length],
  );
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
        scroll={region?.scroll ?? null}
        onProject={onProject}
      />
      <Clouds clouds={clouds} wrap={wrap} animated={animated} />
      {mathsIndex >= 0 ? (
        <group position={[mathsIndex * SPACING, 0, 0]} visible={!region}>
          <MathsIsland3D animated={animated} regions={regions} />
          <IsletAlgo mix={regions.mix} animated={animated} />
        </group>
      ) : null}
      {region ? (
        <RegionWorld map={region.map} regionColor={region.color} animated={animated} />
      ) : null}
      <Hd2dPost focus={1 - shot.aimY} band={0.62} look={explorerArt.post.natural} />
    </Canvas>
  );
}
