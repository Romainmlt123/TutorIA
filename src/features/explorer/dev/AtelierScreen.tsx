import { Canvas, useThree } from '@react-three/fiber';
import { useLocalSearchParams } from 'expo-router';
import { useEffect, useState, useSyncExternalStore } from 'react';
import { StyleSheet, useWindowDimensions, View } from 'react-native';
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';
import { useSharedValue } from 'react-native-reanimated';
import * as THREE from 'three';

import { Text } from '@/components/Text';
import { theme } from '@/theme';
import { explorerArt } from '@/theme/explorerArt';

import { IslandArt } from '../art/IslandArt';
import { distanceToFit, orbit } from '../hd2d/camera';
import { Hd2dPost } from '../hd2d/Hd2dPost';
import { MathsIslandHD } from '../hd2d/MathsIslandHD';
import { SceneBoundary } from '../hd2d/SceneBoundary';
import { canUseWebGL } from '../hd2d/webgl';

const TARGET: [number, number, number] = [0, -0.9, 0];
const FOV = 26;

/**
 * Caméra et brume : la brume commence juste derrière l'île (distance de la caméra + 4) pour ne
 * noyer que les îles lointaines, quel que soit le format de l'écran.
 */
function placeCamera(
  camera: THREE.PerspectiveCamera,
  scene: THREE.Scene,
  aspect: number,
  azimuth: number,
) {
  const distance = distanceToFit(7.4, FOV, aspect, 1.02);
  camera.position.set(...orbit(TARGET, distance, 33, azimuth));
  camera.lookAt(new THREE.Vector3(...TARGET));
  camera.far = distance * 4;
  camera.updateProjectionMatrix();
  scene.fog = new THREE.Fog(explorerArt.fog, distance + 4, distance + 30);
}

/** Caméra placée et orientée à chaque changement (glisser fait tourner la vue). */
function CameraRig({ azimuth }: { azimuth: number }) {
  const camera = useThree((s) => s.camera);
  const scene = useThree((s) => s.scene);
  const size = useThree((s) => s.size);
  useEffect(() => {
    placeCamera(camera as THREE.PerspectiveCamera, scene, size.width / size.height, azimuth);
  }, [azimuth, camera, scene, size.width, size.height]);
  return null;
}

/** Lumière de fin d'après-midi : soleil chaud qui projette les ombres, ciel froid, contre-jour. */
function Lights() {
  return (
    <>
      <hemisphereLight args={[explorerArt.light.skyFill, explorerArt.light.groundFill, 1.35]} />
      <directionalLight
        position={[5, 9, 6]}
        intensity={3.0}
        color={explorerArt.light.sun}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-camera-left={-6}
        shadow-camera-right={6}
        shadow-camera-top={6}
        shadow-camera-bottom={-6}
        shadow-bias={-0.0008}
      />
      <directionalLight position={[-6, 3, -7]} intensity={0.8} color={explorerArt.light.rim} />
    </>
  );
}

function Hd2dView() {
  const [azimuth, setAzimuth] = useState(-0.35);
  const start = useSharedValue(0);
  const pan = Gesture.Pan()
    .runOnJS(true)
    .onBegin(() => {
      start.value = azimuth;
    })
    .onUpdate((e) => setAzimuth(start.value - e.translationX / 180));
  return (
    <GestureDetector gesture={pan}>
      <View style={styles.screen} collapsable={false}>
        <Canvas
          dpr={[1, 2]}
          shadows
          flat
          gl={{ antialias: false, alpha: true }}
          camera={{ fov: FOV }}>
          <CameraRig azimuth={azimuth} />
          <Lights />
          <MathsIslandHD />
          <Hd2dPost focus={0.5} band={0.42} />
        </Canvas>
      </View>
    </GestureDetector>
  );
}

/**
 * Atelier (développement seulement) : l'île des Maths en HD-2D (par défaut) ou en illustration
 * vectorielle, le repli 2D (?vue=vecteur).
 */
const noSubscription = () => () => undefined;

/** Repli 2D : l'illustration vectorielle, centrée. */
function VectorView() {
  const { width } = useWindowDimensions();
  return (
    <View style={styles.center}>
      <IslandArt width={Math.min(370, width - 20)} />
    </View>
  );
}

/**
 * Atelier (développement seulement) : l'île des Maths en HD-2D (par défaut) ou en illustration
 * vectorielle (?vue=vecteur). Sans WebGL, ou si la scène échoue, le repli 2D s'affiche.
 */
export function AtelierScreen() {
  const { vue } = useLocalSearchParams<{ vue?: string }>();
  // Faux au rendu serveur (web) : pas de WebGL côté serveur, pas de décalage à l'hydratation.
  const webgl = useSyncExternalStore(noSubscription, canUseWebGL, () => false);
  const hd2d = vue !== 'vecteur' && webgl;
  const label = hd2d
    ? 'Atelier · île des Maths (HD-2D)'
    : webgl
      ? 'Atelier · île des Maths (vecteur)'
      : 'Atelier · WebGL indisponible : repli 2D';
  return (
    <GestureHandlerRootView style={styles.screen}>
      {hd2d ? (
        <SceneBoundary fallback={<VectorView />}>
          <Hd2dView />
        </SceneBoundary>
      ) : (
        <VectorView />
      )}
      <View style={styles.hud} pointerEvents="none">
        <Text variant="caption" weight="bold">
          {label}
        </Text>
      </View>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: theme.colors.bg },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  hud: {
    position: 'absolute',
    top: theme.space[12],
    left: theme.space[4],
    paddingVertical: theme.space[2],
    paddingHorizontal: theme.space[3],
    borderRadius: theme.radius['2xl'],
    backgroundColor: theme.colors.surface,
  },
});
