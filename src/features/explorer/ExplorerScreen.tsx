import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo, useRef, useState, useSyncExternalStore } from 'react';
import { Platform, StyleSheet, useWindowDimensions, View } from 'react-native';
import { Gesture, GestureHandlerRootView } from 'react-native-gesture-handler';
import { useReducedMotion } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { GradientSurface } from '@/components/GradientSurface';
import { useBottomNavLayout } from '@/components/navigation/useBottomNavLayout';
import { theme } from '@/theme';
import { explorerArt } from '@/theme/explorerArt';

import { CarouselHud } from './components/CarouselHud';
import { IslandStage, type ScreenPoint, type StageAnchor } from './components/IslandStage';
import { CENTRE_ID, edgeId, RegionSigns } from './components/RegionSigns';
import { RegionPlaceholderHud, RegionsHud } from './components/RegionsHud';
import { StageFallback } from './components/StageFallback';
import { ISLANDS } from './content';
import { SceneBoundary } from './hd2d/SceneBoundary';
import { canUseWebGL } from './hd2d/webgl';
import { useExplorer } from './hooks/useExplorer';
import { useIslandRegions } from './hooks/useIslandRegions';
import { useSceneActive } from './hooks/useSceneActive';
import { useScreenReader } from './hooks/useScreenReader';
import { useViewBack } from './hooks/useViewBack';
import { paramsOf, upOf, viewFromParams, type ExplorerView } from './logic/explorerView';
import { beginDrag, createOrbit, drag, release } from './logic/orbit';
import { edgeOf, ISLET, PLATEAU_REGIONS, signOf } from './logic/regions';
import { shotFor } from './logic/shots';
import { DEFAULT_FRAME, frameFor } from './logic/stageFrame';
import type { RegionLook } from './stylized3d/regionTint';

const SKY = explorerArt.post.natural.sky;
const noSubscription = () => () => undefined;
/**
 * Rotation de l'île au doigt : modifiée par le geste, lue à chaque image par la caméra
 * (IslandStage). Un objet de module, comme l'horloge de l'eau, et non une ref React.
 */
const STAGE_ORBIT = createOrbit();
/** Hauteur au-dessus du plateau où se termine le trait d'un panneau (mètres). */
const GROUND = 0.12;

/**
 * Points que la caméra projette à l'écran : le centre de l'île, et pour chaque région de la terre
 * le point où son trait se termine et le bord de l'île dans sa direction (le panneau se pose
 * au-delà). Le panneau de l'îlot se pose juste à côté de lui.
 */
const ANCHORS: readonly StageAnchor[] = [
  { id: CENTRE_ID, position: [0, 0, 0] },
  ...PLATEAU_REGIONS.flatMap((id) => {
    const [x, z] = signOf(id)!;
    const [ex, ez] = edgeOf(id)!;
    return [
      { id, position: [x, GROUND, z] as const },
      { id: edgeId(id), position: [ex, GROUND, ez] as const },
    ];
  }),
  { id: ISLET.region, position: ISLET.sign },
  { id: edgeId(ISLET.region), position: ISLET.sign },
];

/**
 * L'onglet Explorer : un seul écran et une seule scène 3D pour les trois vues (carrousel des îles,
 * régions d'une île, carte d'une région). La vue est dans l'adresse (`?ile=…&region=…`) ; chaque
 * vue a son cadrage de caméra et son interface, et la caméra glisse de l'un à l'autre. Sans WebGL,
 * ou si la scène échoue, une image fixe remplace la 3D.
 */
export function ExplorerScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ ile?: string; region?: string }>();
  const view = viewFromParams(params, ISLANDS);
  const insets = useSafeAreaInsets();
  const { clearance } = useBottomNavLayout();
  const explorer = useExplorer();
  // Pour l'instant, seules les îles déjà construites en 3D sont proposées (les Maths).
  const slides = explorer.slides.filter((s) => s.available);
  const [index, setIndex] = useState(0);
  const screen = useWindowDimensions();
  const zoneRef = useRef<View>(null);
  const [frame, setFrame] = useState(DEFAULT_FRAME);
  // La zone de l'île (entre la banderole et les points) est mesurée dans la fenêtre : l'île s'y
  // cadre quels que soient l'écran, la zone sûre et la taille du texte.
  const measureZone = () =>
    zoneRef.current?.measureInWindow((_x, y, _width, zoneHeight) =>
      setFrame(frameFor({ top: y, height: zoneHeight }, screen)),
    );
  const active = useSceneActive();
  const animated = !useReducedMotion();
  const screenReader = useScreenReader();
  // Faux au rendu serveur (web) : pas de WebGL côté serveur, pas de décalage à l'hydratation.
  const webgl = useSyncExternalStore(noSubscription, canUseWebGL, () => false);

  const slide = slides[index] ?? slides[0];
  const subjectId = view.kind === 'carousel' ? (slide?.subjectId ?? 'maths') : view.subjectId;
  const { regions, markSeen } = useIslandRegions(subjectId);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [points, setPoints] = useState<ScreenPoint[] | null>(null);
  const selected = regions.find((r) => r.regionId === selectedId) ?? null;

  const open = (next: ExplorerView) => {
    if (next.kind === 'carousel') setSelectedId(null);
    router.setParams(paramsOf(next));
  };
  const up = upOf(view);
  useViewBack(up !== null, () => up && open(up));

  const select = (regionId: string) => {
    markSeen(regionId);
    setSelectedId(regionId);
  };
  const enter = (regionId: string) => {
    markSeen(regionId);
    open({ kind: 'region', subjectId, regionId });
  };

  // Teinte des régions, région choisie et brume sur celles que l'élève n'a pas encore visitées.
  const look = useMemo<RegionLook>(
    () => ({
      mix: view.kind === 'carousel' ? 0 : 1,
      focus: selectedId,
      mist: regions.filter((r) => r.status === 'discover').map((r) => r.regionId),
    }),
    [view.kind, selectedId, regions],
  );
  const focusPoint = useMemo<readonly [number, number] | null>(() => {
    if (!selectedId) return null;
    if (selectedId === ISLET.region) return [ISLET.sign[0], ISLET.sign[2]];
    return signOf(selectedId);
  }, [selectedId]);

  if (!slide) return null;
  // Glisser le doigt fait tourner l'île (on change d'île avec les flèches), dans la plage de la vue.
  const shot = shotFor(view, frame, focusPoint);
  const rotate = Gesture.Pan()
    .runOnJS(true)
    .activeOffsetX([-8, 8])
    .onBegin(() => beginDrag(STAGE_ORBIT))
    .onUpdate((event) => drag(STAGE_ORBIT, event.translationX, shot.azimuthRange))
    .onFinalize((event) => release(STAGE_ORBIT, event.velocityX, animated));

  // Sous la banderole et la consigne, au-dessus du panneau de région.
  const signsTop = (Platform.OS === 'web' ? 56 : insets.top + theme.layout.screenTopGap) + 100;
  const listMode = !webgl || screenReader;
  const signs = view.kind === 'regions' && !listMode ? points : null;

  return (
    <GestureHandlerRootView style={styles.screen}>
      <GradientSurface
        gradient={{ colors: [SKY.top, SKY.middle, SKY.horizon], locations: [0, 0.55, 1] }}
        angle={180}
        style={StyleSheet.absoluteFill}
      />
      {webgl ? (
        <SceneBoundary fallback={<StageFallback slide={slide} frame={frame} />}>
          <IslandStage
            slides={slides}
            index={index}
            shot={shot}
            orbit={STAGE_ORBIT}
            regions={look}
            anchors={ANCHORS}
            onProject={setPoints}
            active={active}
            animated={animated}
          />
        </SceneBoundary>
      ) : (
        <StageFallback slide={slide} frame={frame} />
      )}
      {signs ? (
        <RegionSigns
          points={signs}
          regions={regions}
          selectedId={selectedId}
          onSelect={select}
          screen={screen}
          bounds={{ top: signsTop, bottom: screen.height * 0.57 }}
        />
      ) : null}
      <View
        pointerEvents="box-none"
        style={[
          styles.content,
          {
            paddingTop: Platform.OS === 'web' ? 56 : insets.top + theme.layout.screenTopGap,
            paddingBottom: clearance,
          },
        ]}>
        {view.kind === 'carousel' ? (
          <CarouselHud
            explorer={explorer}
            slides={slides}
            index={index}
            onIndex={setIndex}
            rotate={rotate}
            zoneRef={zoneRef}
            onZoneLayout={measureZone}
            animated={animated}
            onExplore={() => open({ kind: 'regions', subjectId: slide.subjectId })}
          />
        ) : view.kind === 'regions' ? (
          <RegionsHud
            subjectId={view.subjectId}
            regions={regions}
            selected={selected}
            onSelect={select}
            onEnter={enter}
            onBack={() => up && open(up)}
            rotate={rotate}
            listMode={listMode}
          />
        ) : (
          <RegionPlaceholderHud
            region={regions.find((r) => r.regionId === view.regionId)}
            onBack={() => up && open(up)}
          />
        )}
      </View>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: theme.colors.bg },
  content: {
    flex: 1,
    paddingHorizontal: theme.layout.screenPadding,
    gap: theme.space[2],
  },
});
