import { Canvas, useThree, type RootState } from '@react-three/fiber';
import { useLocalSearchParams } from 'expo-router';
import { useEffect, useState, useSyncExternalStore } from 'react';
import { PixelRatio, ScrollView, StyleSheet, useWindowDimensions, View } from 'react-native';
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';
import { useSharedValue } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as THREE from 'three';

import { Switch } from '@/components/form/Switch';
import { Icon } from '@/components/Icon';
import { PressableBase } from '@/components/PressableBase';
import { Text } from '@/components/Text';
import { fr } from '@/i18n/fr';
import { FrameDriver } from '@/lib/three/FrameDriver';
import { setPerfHud, usePerfHud } from '@/lib/three/perfHudFlag';
import { SceneBoundary } from '@/lib/three/SceneBoundary';
import { canUseWebGL } from '@/lib/three/webgl';
import { theme } from '@/theme';
import { explorerArt } from '@/theme/explorerArt';

import { IslandArt } from '../art/IslandArt';
import { distanceToFit, orbit } from '../hd2d/camera';
import { Hd2dPost } from '../hd2d/Hd2dPost';
import { MathsIslandHD } from '../hd2d/MathsIslandHD';
import { Clouds, type CloudSpec } from '../stylized3d/Clouds';
import { MathsIsland3D } from '../stylized3d/MathsIsland3D';

import { readGlCapabilities, type GlCapabilities } from './glCapabilities';

const TARGET: [number, number, number] = [0, -0.9, 0];
const FOV = 26;
const t = fr.dev.perf;

/** Rappel des scènes de l'atelier : les capacités lues sur leur contexte 3D, une fois créé. */
type GlProbe = { onGl: (caps: GlCapabilities) => void };
const probeGl = (onGl: GlProbe['onGl']) => (state: RootState) =>
  onGl(readGlCapabilities(state.gl.getContext()));

/**
 * Caméra et brume : la brume commence juste derrière l'île (distance de la caméra + 4) pour ne
 * noyer que les îles lointaines, quel que soit le format de l'écran.
 */
function placeCamera(
  camera: THREE.PerspectiveCamera,
  scene: THREE.Scene,
  aspect: number,
  azimuth: number,
  elevation: number,
) {
  const distance = distanceToFit(7.4, FOV, aspect, 1.02);
  camera.position.set(...orbit(TARGET, distance, elevation, azimuth));
  camera.lookAt(new THREE.Vector3(...TARGET));
  camera.far = distance * 4;
  camera.updateProjectionMatrix();
  scene.fog = new THREE.Fog(explorerArt.fog, distance + 4, distance + 30);
}

/** Caméra placée et orientée à chaque changement (glisser fait tourner la vue). */
function CameraRig({ azimuth, elevation }: { azimuth: number; elevation: number }) {
  const camera = useThree((s) => s.camera);
  const scene = useThree((s) => s.scene);
  const size = useThree((s) => s.size);
  useEffect(() => {
    placeCamera(
      camera as THREE.PerspectiveCamera,
      scene,
      size.width / size.height,
      azimuth,
      elevation,
    );
  }, [azimuth, elevation, camera, scene, size.width, size.height]);
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

/** Glisser horizontalement fait tourner la caméra autour de l'île. */
function useOrbitGesture(initial: number) {
  const [azimuth, setAzimuth] = useState(initial);
  const start = useSharedValue(0);
  const pan = Gesture.Pan()
    .runOnJS(true)
    .onBegin(() => {
      start.value = azimuth;
    })
    .onUpdate((e) => setAzimuth(start.value - e.translationX / 180));
  return { azimuth, pan };
}

function Hd2dView({ onGl }: GlProbe) {
  const { azimuth, pan } = useOrbitGesture(-0.35);
  return (
    <GestureDetector gesture={pan}>
      <View style={styles.screen} collapsable={false}>
        <Canvas
          onCreated={probeGl(onGl)}
          dpr={[1, 2]}
          shadows
          flat
          gl={{ antialias: false, alpha: true }}
          camera={{ fov: FOV }}>
          <CameraRig azimuth={azimuth} elevation={33} />
          <Lights />
          <MathsIslandHD />
          <Hd2dPost focus={0.5} band={0.42} />
        </Canvas>
      </View>
    </GestureDetector>
  );
}

const ATELIER_CLOUDS: readonly CloudSpec[] = [
  { x: -4.6, y: 1.9, z: -3.8, scale: 1.1, seed: 3, drift: 0.07 },
  { x: 4.3, y: 2.8, z: -5.2, scale: 1.4, seed: 4, drift: 0.1 },
  { x: 4.0, y: -2.4, z: 1.2, scale: 0.85, seed: 5, drift: 0.13 },
  { x: -4.3, y: -3.4, z: 0.6, scale: 0.75, seed: 6, drift: 0.16 },
];
const ATELIER_WRAP = [-6.5, 6.5] as const;

/**
 * 3D stylisée : tout est cuit dans le modèle, aucune lumière ni ombre en temps réel. Les images
 * passent par FrameDriver, comme dans Explorer : l'eau, l'herbe et les nuages suivent son horloge.
 */
function Stylized3dView({ onGl }: GlProbe) {
  const { azimuth, pan } = useOrbitGesture(-0.2);
  return (
    <GestureDetector gesture={pan}>
      <View style={styles.screen} collapsable={false}>
        <Canvas
          onCreated={probeGl(onGl)}
          frameloop="never"
          dpr={[1, 2]}
          flat
          gl={{ antialias: false, alpha: true }}
          camera={{ fov: FOV }}>
          <FrameDriver active animated />
          <CameraRig azimuth={azimuth} elevation={24} />
          <Clouds clouds={ATELIER_CLOUDS} wrap={ATELIER_WRAP} />
          <MathsIsland3D />
          <Hd2dPost focus={0.5} band={0.62} look={explorerArt.post.natural} />
        </Canvas>
      </View>
    </GestureDetector>
  );
}

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

/** Capacités du contexte 3D, telles que le téléphone les donne. */
function CapsList({ caps }: { caps: GlCapabilities }) {
  const c = t.caps;
  const rows = [
    [c.webAssembly, caps.webAssembly],
    [c.pixelRatio, PixelRatio.get()],
    [c.maxTextureSize, caps.maxTextureSize],
    [c.maxRenderbufferSize, caps.maxRenderbufferSize],
    [c.maxSamples, caps.maxSamples],
    [c.renderer, caps.renderer],
    [c.vendor, caps.vendor],
    [c.version, caps.version],
  ] as const;
  return (
    <>
      {rows.map(([label, value]) => (
        <Text key={label} variant="caption">
          {c.row(label, value === null ? t.unknown : String(value))}
        </Text>
      ))}
      <Text variant="caption" weight="bold">
        {c.extensions(caps.extensions.length)}
      </Text>
      <Text variant="caption" color="textSecondary">
        {caps.extensions.join(', ')}
      </Text>
    </>
  );
}

/**
 * Réglages de mesure : le compteur de performance d'Explorer et, repliées par défaut pour laisser
 * voir l'île, les capacités GL de la scène affichée.
 */
function MeasurePanel({ scene, caps }: { scene: boolean; caps: GlCapabilities | null }) {
  const insets = useSafeAreaInsets();
  const { height } = useWindowDimensions();
  const perfHud = usePerfHud();
  const [open, setOpen] = useState(false);
  return (
    <View style={[styles.panel, { paddingBottom: insets.bottom + theme.space[2] }]}>
      <View style={styles.row}>
        <Text variant="bodySm" weight="bold" style={styles.rowLabel}>
          {t.hudSwitch}
        </Text>
        <Switch value={perfHud} onValueChange={setPerfHud} accessibilityLabel={t.hudSwitch} />
      </View>
      <PressableBase
        onPress={() => setOpen((wasOpen) => !wasOpen)}
        accessibilityRole="button"
        aria-expanded={open}
        accessibilityLabel={open ? t.capsHide : t.capsShow}
        style={styles.row}>
        <Text variant="bodySm" weight="bold" style={styles.rowLabel}>
          {t.capsTitle}
        </Text>
        <Icon
          name={open ? 'chevron-bas' : 'chevron-haut'}
          size={20}
          color={theme.colors.textSecondary}
        />
      </PressableBase>
      {open ? (
        <ScrollView style={{ maxHeight: height * 0.35 }} contentContainerStyle={styles.caps}>
          {!scene ? (
            <Text variant="caption" color="textSecondary">
              {t.capsNoScene}
            </Text>
          ) : caps ? (
            <CapsList caps={caps} />
          ) : (
            <Text variant="caption" color="textSecondary">
              {t.capsWaiting}
            </Text>
          )}
        </ScrollView>
      ) : null}
    </View>
  );
}

const LABELS = {
  '3d': 'Atelier · île des Maths (3D)',
  hd2d: 'Atelier · île des Maths (HD-2D)',
  vecteur: 'Atelier · île des Maths (vecteur)',
} as const;

/**
 * Atelier (développement seulement) : l'île des Maths en 3D stylisée (par défaut), en HD-2D
 * (?vue=hd2d) ou en illustration vectorielle (?vue=vecteur). Sans WebGL, ou si la scène échoue,
 * le repli 2D s'affiche.
 */
export function AtelierScreen() {
  const { vue } = useLocalSearchParams<{ vue?: string }>();
  // Faux au rendu serveur (web) : pas de WebGL côté serveur, pas de décalage à l'hydratation.
  const webgl = useSyncExternalStore(noSubscription, canUseWebGL, () => false);
  const view = vue === 'hd2d' || vue === 'vecteur' ? vue : '3d';
  const scene = webgl && view !== 'vecteur';
  const label = webgl ? LABELS[view] : 'Atelier · WebGL indisponible : repli 2D';
  const [caps, setCaps] = useState<GlCapabilities | null>(null);
  return (
    <GestureHandlerRootView style={styles.screen}>
      {scene ? (
        <SceneBoundary scope="explorer.atelier" fallback={<VectorView />}>
          {view === 'hd2d' ? <Hd2dView onGl={setCaps} /> : <Stylized3dView onGl={setCaps} />}
        </SceneBoundary>
      ) : (
        <VectorView />
      )}
      <View style={styles.hud} pointerEvents="none">
        <Text variant="caption" weight="bold">
          {label}
        </Text>
      </View>
      <MeasurePanel scene={scene} caps={caps} />
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
  panel: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    borderTopLeftRadius: theme.radius['3xl'],
    borderTopRightRadius: theme.radius['3xl'],
    paddingTop: theme.space[2],
    paddingHorizontal: theme.layout.screenPadding,
    backgroundColor: theme.colors.surface,
  },
  caps: { gap: theme.space[1], paddingBottom: theme.space[2] },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.space[3],
    minHeight: theme.space[12],
  },
  rowLabel: { flex: 1 },
});
