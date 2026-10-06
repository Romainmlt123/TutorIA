import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react';
import { Platform, StyleSheet, useWindowDimensions, View } from 'react-native';
import { Gesture, GestureHandlerRootView } from 'react-native-gesture-handler';
import { useReducedMotion } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { GradientSurface } from '@/components/GradientSurface';
import { useBottomNavLayout } from '@/components/navigation/useBottomNavLayout';
import { WardrobeNews } from '@/features/avatar/components/WardrobeNews';
import { useStudentLook } from '@/features/avatar/hooks/useAvatarLook';
import { useAvatarOfferOnVisit } from '@/features/avatar/hooks/useAvatarOfferOnVisit';
import { SceneBoundary } from '@/lib/three/SceneBoundary';
import { useSceneActive } from '@/lib/three/useSceneActive';
import { useSceneKey } from '@/lib/three/useSceneKey';
import { canUseWebGL } from '@/lib/three/webgl';
import { theme } from '@/theme';
import { explorerArt } from '@/theme/explorerArt';

import { CarouselHud } from './components/CarouselHud';
import { IslandStage, type ScreenPoint, type StageAnchor } from './components/IslandStage';
import { cityAnchorId, MapOverlay } from './components/map/MapOverlay';
import { RegionMapHud } from './components/map/RegionMapHud';
import { RegionsHud } from './components/RegionsHud';
import { SkyVeil, useSkyVeil } from './components/SkyVeil';
import { StageFallback } from './components/StageFallback';
import { ISLANDS } from './content';
import { useExplorer } from './hooks/useExplorer';
import { useIslandRegions } from './hooks/useIslandRegions';
import { useRegionMap } from './hooks/useRegionMap';
import { useScreenReader } from './hooks/useScreenReader';
import { useViewBack } from './hooks/useViewBack';
import { paramsOf, upOf, viewFromParams, type ExplorerView } from './logic/explorerView';
import {
  beginScroll,
  createScroll,
  dragScroll,
  goTo,
  jumpTo,
  releaseScroll,
  setBounds,
} from './logic/mapScroll';
import { beginDrag, createOrbit, drag, release } from './logic/orbit';
import type { MapCity } from './logic/regionMap';
import { focusOf } from './logic/regions';
import { MAP_LAYOUT } from './logic/mapLayout';
import { preloadRegion } from './stylized3d/RegionWorld';
import { diveShot, MAP_ELEVATION, MAP_VISIBLE_WIDTH, shotFor } from './logic/shots';
import { DEFAULT_FRAME, frameFor } from './logic/stageFrame';
import type { RegionLook } from './stylized3d/regionTint';

const SKY = explorerArt.post.natural.sky;
const noSubscription = () => () => undefined;
/**
 * Rotation de l'île au doigt : modifiée par le geste, lue à chaque image par la caméra
 * (IslandStage). Un objet de module, comme l'horloge de l'eau, et non une ref React.
 */
const STAGE_ORBIT = createOrbit();
/** Défilement de la carte d'une région (X2b) : même principe que la rotation de l'île. */
const MAP_SCROLL = createScroll();
/** Marge de la caméra au-delà des points de niveau extrêmes (mètres) : l'île déborde un peu de l'écran. */
const CAMERA_MARGIN = 0.6;

/** Positions à l'écran des points de la carte, prises quand la caméra s'est posée sur une région. */
type MapSnapshot = { points: ScreenPoint[]; camera: { x: number; z: number }; regionId: string };

/** Délai avant que le fondu au noir commence, en plein plongeon : le fondu accompagne le zoom (ms). */
const DIVE_MS = 100;

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
  // Android : la scène est recréée à chaque retour sur l'écran (son contexte 3D a été détruit).
  const sceneKey = useSceneKey();
  // Première visite sans avatar : l'éditeur « Crée ton avatar » est proposé une fois.
  useAvatarOfferOnVisit(active && view.kind === 'carousel');
  // L'avatar de l'élève tient lieu de pion sur la carte d'une région.
  const avatarLook = useStudentLook();
  const animated = !useReducedMotion();
  const screenReader = useScreenReader();
  // Faux au rendu serveur (web) : pas de WebGL côté serveur, pas de décalage à l'hydratation.
  const webgl = useSyncExternalStore(noSubscription, canUseWebGL, () => false);

  const slide = slides[index] ?? slides[0];
  const subjectId = view.kind === 'carousel' ? (slide?.subjectId ?? 'maths') : view.subjectId;
  const { regions, markSeen } = useIslandRegions(subjectId);
  // Région choisie dans le carrousel de X2a ; par défaut celle où l'élève doit jouer ensuite.
  const [choice, setChoice] = useState<string | null>(null);
  const selectedId =
    choice ?? regions.find((r) => r.next)?.regionId ?? regions[0]?.regionId ?? null;
  // Région vers laquelle la caméra plonge après validation, le temps du zoom.
  const [diving, setDiving] = useState<string | null>(null);
  const veil = useSkyVeil(animated);
  // Carte de la région ouverte (X2b) : positions à l'écran de ses points quand la caméra s'est posée.
  const map = useRegionMap(subjectId, view.kind === 'region' ? view.regionId : null);
  const [snapshot, setSnapshot] = useState<MapSnapshot | null>(null);
  const [showList, setShowList] = useState(false);
  // Zone de la carte (entre l'en-tête et le panneau de ville) : les boutons posés dessus y sont rognés.
  const mapZoneRef = useRef<View>(null);
  const [mapZone, setMapZone] = useState<{ top: number; height: number } | null>(null);
  const measureMapZone = () =>
    mapZoneRef.current?.measureInWindow((_x, y, _width, height) => setMapZone({ top: y, height }));
  const openedRegion = useRef<string | null>(null);
  useEffect(() => {
    if (!map) {
      openedRegion.current = null;
      return;
    }
    // Bornes de la caméra : le rectangle des points de niveau, avec un peu de marge.
    const xs = map.nodes.map((n) => n.x);
    const zs = map.nodes.map((n) => n.z);
    setBounds(MAP_SCROLL, {
      minX: Math.min(...xs) - CAMERA_MARGIN,
      maxX: Math.max(...xs) + CAMERA_MARGIN,
      minZ: Math.min(...zs) - CAMERA_MARGIN,
      maxZ: Math.max(...zs) + CAMERA_MARGIN,
    });
    if (openedRegion.current !== map.regionId) {
      openedRegion.current = map.regionId;
      // On arrive centré sur la ville où se trouve le pion.
      const home = map.cities.find((c) => c.id === map.nodes[map.pawnIndex]?.cityId);
      jumpTo(MAP_SCROLL, home?.center.x ?? 0, home?.center.z ?? 0);
    }
  }, [map]);
  const mapAnchors = useMemo<readonly StageAnchor[]>(
    () =>
      map
        ? [
            ...map.nodes.map((n) => ({ id: n.levelId, position: [n.x, 0.06, n.z] as const })),
            ...map.cities.map((c) => ({
              id: cityAnchorId(c.id),
              // Le bandeau se pose derrière le cercle des niveaux, pour ne cacher aucun point.
              position: [
                c.center.x,
                0.3,
                c.center.z - (c.radius - MAP_LAYOUT.clearing) - 0.35,
              ] as const,
            })),
          ]
        : [],
    [map],
  );

  const open = (next: ExplorerView) => router.setParams(paramsOf(next));
  const up = upOf(view);
  // Entrer dans une région ou en sortir change de scène : le fondu au noir cache le changement.
  const goBack = () => {
    if (!up) return;
    if (view.kind === 'region') veil.pass(() => open(up));
    else open(up);
  };
  useViewBack(up !== null, goBack);

  const { pass } = veil;
  useEffect(() => {
    if (!diving) return;
    const timer = setTimeout(
      () =>
        pass(() => {
          setDiving(null);
          router.setParams(paramsOf({ kind: 'region', subjectId, regionId: diving }));
        }),
      DIVE_MS,
    );
    return () => clearTimeout(timer);
  }, [diving, pass, router, subjectId]);

  const select = (regionId: string) => {
    markSeen(regionId);
    setChoice(regionId);
  };
  // Valider une région : la caméra plonge vers elle, puis le voile passe sur la carte de la région.
  const enter = (regionId: string) => {
    markSeen(regionId);
    setChoice(regionId);
    if (animated && webgl) setDiving(regionId);
    else open({ kind: 'region', subjectId, regionId });
  };

  // Teinte des régions : la région choisie est allumée, les autres sont grises.
  const look = useMemo<RegionLook>(
    () => ({ mix: view.kind === 'carousel' ? 0 : 1, focus: selectedId }),
    [view.kind, selectedId],
  );
  const focusPoint = useMemo(() => (selectedId ? focusOf(selectedId) : null), [selectedId]);
  // Les modèles de la région choisie se chargent pendant qu'on la regarde et pendant le plongeon.
  useEffect(() => {
    if (webgl && view.kind === 'regions' && selectedId) preloadRegion(selectedId);
  }, [webgl, view.kind, selectedId]);
  const diveFocus = diving ? focusOf(diving) : null;

  if (!slide) return null;
  // Échelle à l'écran : la vue plongeante raccourcit l'axe z du sinus de l'élévation.
  const pxPerMeterX = screen.width / MAP_VISIBLE_WIDTH;
  const pxPerMeterZ = pxPerMeterX * Math.sin((MAP_ELEVATION * Math.PI) / 180);
  // Glisser le doigt sur la carte d'une région la déplace dans tous les sens, avec de l'élan.
  const pan = Gesture.Pan()
    .runOnJS(true)
    .minDistance(8)
    .onBegin(() => beginScroll(MAP_SCROLL))
    .onUpdate((event) =>
      dragScroll(MAP_SCROLL, event.translationX, event.translationY, pxPerMeterX, pxPerMeterZ),
    )
    .onFinalize((event) =>
      releaseScroll(
        MAP_SCROLL,
        event.velocityX,
        event.velocityY,
        pxPerMeterX,
        pxPerMeterZ,
        animated,
      ),
    );
  // Glisser le doigt fait tourner l'île (on change d'île avec les flèches), dans la plage de la vue.
  const shot = diveFocus ? diveShot(diveFocus) : shotFor(view, frame, focusPoint);
  const rotate = Gesture.Pan()
    .runOnJS(true)
    .activeOffsetX([-8, 8])
    .onBegin(() => beginDrag(STAGE_ORBIT))
    .onUpdate((event) => drag(STAGE_ORBIT, event.translationX, shot.azimuthRange))
    .onFinalize((event) => release(STAGE_ORBIT, event.velocityX, animated));

  const mapListMode = !webgl || screenReader || showList;
  const readyMap =
    map && snapshot && snapshot.regionId === map.regionId && !mapListMode ? snapshot : null;
  const openLevel = () => router.push({ pathname: '/bientot', params: { sujet: 'niveau' } });
  const goToCity = (city: MapCity) => goTo(MAP_SCROLL, city.center.x, city.center.z);
  // Les points projetés servent aux boutons et bandeaux posés sur la carte d'une région.
  const onProject = (projected: ScreenPoint[] | null, camera: { x: number; z: number }) => {
    if (view.kind === 'region' && projected) {
      setSnapshot({ points: projected, camera, regionId: view.regionId });
    }
  };

  return (
    <GestureHandlerRootView style={styles.screen}>
      <GradientSurface
        gradient={{ colors: [SKY.top, SKY.middle, SKY.horizon], locations: [0, 0.55, 1] }}
        angle={180}
        style={StyleSheet.absoluteFill}
      />
      {webgl ? (
        <SceneBoundary
          key={sceneKey}
          scope="explorer.scene"
          fallback={<StageFallback slide={slide} frame={frame} />}>
          <IslandStage
            slides={slides}
            index={index}
            shot={shot}
            orbit={STAGE_ORBIT}
            regions={look}
            anchors={mapAnchors}
            onProject={onProject}
            region={
              map && view.kind === 'region'
                ? {
                    map,
                    color: explorerArt.regions[view.regionId as keyof typeof explorerArt.regions],
                    scroll: MAP_SCROLL,
                    look: avatarLook,
                  }
                : null
            }
            active={active}
            animated={animated}
          />
        </SceneBoundary>
      ) : (
        <StageFallback slide={slide} frame={frame} />
      )}
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
            selectedId={selectedId}
            onSelect={select}
            onEnter={enter}
            onBack={goBack}
            rotate={rotate}
          />
        ) : map ? (
          <RegionMapHud
            map={map}
            regionName={regions.find((r) => r.regionId === map.regionId)?.region.name ?? ''}
            onBack={goBack}
            pan={pan}
            listMode={mapListMode}
            onToggleList={() => setShowList((value) => !value)}
            onNode={openLevel}
            onCity={goToCity}
            onGoToCity={goToCity}
            zoneRef={mapZoneRef}
            onZoneLayout={measureMapZone}
          />
        ) : null}
      </View>
      {readyMap && map && mapZone ? (
        // Les boutons suivent la 3D, y compris sous l'en-tête et le panneau : on les rogne à la zone.
        <View
          pointerEvents="box-none"
          style={[styles.mapClip, { top: mapZone.top, height: mapZone.height }]}>
          <View
            pointerEvents="box-none"
            style={[styles.mapClipInner, { top: -mapZone.top, height: screen.height }]}>
            <MapOverlay
              map={map}
              points={readyMap.points}
              camera0={readyMap.camera}
              onNode={openLevel}
              onCity={goToCity}
            />
          </View>
        </View>
      ) : null}
      <SkyVeil style={veil.style} />
      {/* Les objets de la garde-robe gagnés depuis la dernière visite. */}
      <WardrobeNews visible={active && !diving} />
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: theme.colors.bg },
  mapClip: { position: 'absolute', left: 0, right: 0, overflow: 'hidden' },
  mapClipInner: { position: 'absolute', left: 0, right: 0 },
  content: {
    flex: 1,
    paddingHorizontal: theme.layout.screenPadding,
    gap: theme.space[2],
  },
});
