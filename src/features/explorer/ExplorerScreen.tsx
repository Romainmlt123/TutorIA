import { useLocalSearchParams, useNavigation, useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react';
import { Platform, StyleSheet, useWindowDimensions, View } from 'react-native';
import { Gesture, GestureHandlerRootView } from 'react-native-gesture-handler';
import Animated, { runOnJS, useAnimatedReaction, useReducedMotion } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useBottomNavLayout } from '@/components/navigation/useBottomNavLayout';
import type { SubjectId } from '@/data/types';
import { preloadAvatar } from '@/features/avatar/avatar3d/Avatar3D';
import { WardrobeNews } from '@/features/avatar/components/WardrobeNews';
import { useStudentLook } from '@/features/avatar/hooks/useAvatarLook';
import { useAvatarOfferOnVisit } from '@/features/avatar/hooks/useAvatarOfferOnVisit';
import { useStudyRules } from '@/lib/session/useStudyRules';
import { requestSceneFrames } from '@/lib/three/FrameDriver';
import { PerfHud } from '@/lib/three/PerfHud';
import { usePerfHud } from '@/lib/three/perfHudFlag';
import { useSceneActive } from '@/lib/three/useSceneActive';
import { canUseWebGL } from '@/lib/three/webgl';
import { theme } from '@/theme';
import { explorerArt } from '@/theme/explorerArt';

import { CarouselHud } from './components/CarouselHud';
import { CinemaFrame } from './components/CinemaFrame';
import { WindStreaks } from './components/WindStreaks';
import { type ScreenPoint, type StageAnchor } from './components/IslandStage';
import { LevelSheet } from './components/level/LevelSheet';
import { MapAvatarView } from './components/map/MapAvatarView';
import { cityAnchorId, MapOverlay } from './components/map/MapOverlay';
import { RegionMapHud } from './components/map/RegionMapHud';
import { RegionMapMarkers } from './components/map/RegionMapMarkers';
import { RegionMapWorld } from './components/map/RegionMapWorld';
import { RegionsHud } from './components/RegionsHud';
import { SkyBackdrop } from './components/SkyBackdrop';
import { SkyVeil } from './components/SkyVeil';
import { useSkyVeil } from './hooks/useSkyVeil';
import { StageFallback } from './components/StageFallback';
import { ISLANDS } from './content';
import { useDiscTouch } from './hooks/useDiscTouch';
import { useExplorer } from './hooks/useExplorer';
import { useIslandRegions } from './hooks/useIslandRegions';
import { useMapCelebration } from './hooks/useMapCelebration';
import { MAP_SCROLL, MAP_ZOOM } from './hooks/mapScrollValue';
import { useRegionCinematic } from './hooks/useRegionCinematic';
import { useRegionMap } from './hooks/useRegionMap';
import { useScreenReader } from './hooks/useScreenReader';
import { useViewBack } from './hooks/useViewBack';
import { paramsOf, upOf, viewFromParams, type ExplorerView } from './logic/explorerView';
import { PRESS_DIP_SECONDS } from './logic/juice';
import { TAP_ZOOM } from './logic/mapZoom';
import { beginScroll, dragScroll, goTo, releaseScroll } from './logic/mapScroll';
import { beginDrag, createOrbit, drag, release } from './logic/orbit';
import type { MapCity, MapNode } from './logic/regionMap';
import { focusOf } from './logic/regions';
import { cityBannerAnchor } from './logic/mapMarkers';
import { dpPerMeter } from './logic/mapProjection';
import { SEEN_LEVEL } from './stylized3d/avatarChoreo';
import { preloadRegion } from './stylized3d/RegionWorld';
import { TERRAIN_SCALES } from './stylized3d/terrainScales';
import { diveShot, MAP_ELEVATION, shotFor } from './logic/shots';
import { DEFAULT_FRAME, frameFor } from './logic/stageFrame';
import { ExplorerStage } from './stage/ExplorerStage';
import { useTabShown } from './stage/useTabShown';
import type { RegionLook } from './stylized3d/regionTint';
import { PRERENDERED_MAPS } from './tiles';

const noSubscription = () => () => undefined;
/**
 * Rotation de l'île au doigt : modifiée par le geste, lue à chaque image par la caméra
 * (IslandStage). Un objet de module, comme l'horloge de l'eau, et non une ref React.
 */
const STAGE_ORBIT = createOrbit();
/** Positions à l'écran des points de la carte, prises quand la caméra s'est posée sur une région. */
type MapSnapshot = { points: ScreenPoint[]; camera: { x: number; z: number }; regionId: string };

/** Au-delà de la marche la plus longue vers un niveau touché (2,5 s), la fiche s'ouvre sans attendre. */
const ARRIVAL_TIMEOUT_MS = 3500;
/**
 * L'onglet Explorer : un seul écran et une seule scène 3D pour les trois vues (carrousel des îles,
 * régions d'une île, carte d'une région). La vue est dans l'adresse (`?ile=…&region=…`) ; chaque
 * vue a son cadrage de caméra et son interface, et la caméra glisse de l'un à l'autre. Sans WebGL,
 * ou si la scène échoue, une image fixe remplace la 3D.
 *
 * Sur Android, la scène est dessinée sous la pile de navigation, par l'hôte de la racine (`stage/`),
 * qui garde son contexte 3D d'une visite à l'autre : l'écran lui confie ses props (`ExplorerStage`),
 * dont `shown` (hors de l'onglet, elle se cache), et reste transparent là où elle se voit. Sur iOS
 * et le web, `ExplorerStage` la dessine ici.
 *
 * La carte d'une région pré-rendue (`PRERENDERED_MAPS`) n'est pas en 3D : ses tuiles, son chemin et
 * ses niveaux sont dessinés par React Native (`RegionMapWorld`, ses boutons dans `RegionMapMarkers`)
 * et déplacés sur le fil de l'interface (`useMapPan`). Seul l'avatar y est en 3D, dans une petite vue
 * posée dans la carte (`MapAvatarView`). La scène de l'île reste alors montée, cachée et en pause,
 * prête pour le retour. Au retour d'un niveau qui fait progresser, la carte le célèbre (étoiles,
 * ville, chemin, niveau ouvert) avant que l'avatar ne rejoigne son niveau (`useMapCelebration`).
 */
export function ExplorerScreen() {
  const router = useRouter();
  const navigation = useNavigation();
  const params = useLocalSearchParams<{ ile?: string; region?: string }>();
  const view = viewFromParams(params, ISLANDS);
  const open = useCallback((next: ExplorerView) => router.setParams(paramsOf(next)), [router]);
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
  // L'onglet est affiché et l'app au premier plan : la scène calcule des images.
  const active = useSceneActive();
  // L'onglet est choisi, même sous un niveau ou l'avatar : la scène se voit.
  const shown = useTabShown();
  // Première visite sans avatar : l'éditeur « Crée ton avatar » est proposé une fois.
  useAvatarOfferOnVisit(active && view.kind === 'carousel');
  // L'avatar de l'élève tient lieu de pion sur la carte d'une région.
  const avatarLook = useStudentLook();
  const animated = !useReducedMotion();
  const screenReader = useScreenReader();
  // Faux au rendu serveur (web) : pas de WebGL côté serveur, pas de décalage à l'hydratation.
  const webgl = useSyncExternalStore(noSubscription, canUseWebGL, () => false);
  // Compteur de performance (développement seulement), allumé depuis l'atelier d'Explorer.
  const perfHud = usePerfHud();

  const slide = slides[index] ?? slides[0];
  const subjectId: SubjectId =
    view.kind === 'carousel' ? (slide?.subjectId ?? 'maths') : view.subjectId;
  const { regions, markSeen } = useIslandRegions(subjectId);
  // Région choisie dans le carrousel de X2a ; par défaut celle où l'élève doit jouer ensuite.
  const [choice, setChoice] = useState<string | null>(null);
  const selectedId =
    choice ?? regions.find((r) => r.next)?.regionId ?? regions[0]?.regionId ?? null;
  const focusPoint = useMemo(() => (selectedId ? focusOf(selectedId) : null), [selectedId]);
  const select = useCallback(
    (regionId: string) => {
      markSeen(regionId);
      setChoice(regionId);
    },
    [markSeen, setChoice],
  );
  const veil = useSkyVeil(animated);
  const [showList, setShowList] = useState(false);
  const [sheet, setSheet] = useState<MapNode | null>(null);
  const [walkTo, setWalkTo] = useState<{ regionId: string; levelId: string } | null>(null);
  const [arriving, setArriving] = useState<MapNode | null>(null);
  const walkDelay = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  // Carte de la région ouverte (X2b) : positions à l'écran de ses points quand la caméra s'est posée.
  const { map, loaded: mapLoaded } = useRegionMap(
    subjectId,
    view.kind === 'region' ? view.regionId : null,
  );
  const tiles = view.kind === 'region' ? PRERENDERED_MAPS[view.regionId] : undefined;
  const [snapshot, setSnapshot] = useState<MapSnapshot | null>(null);
  const discTouch = useDiscTouch(animated);
  const mapZoneRef = useRef<View>(null);
  const [mapZone, setMapZone] = useState<{
    left: number;
    top: number;
    width: number;
    height: number;
  } | null>(null);
  const measureMapZone = () =>
    mapZoneRef.current?.measureInWindow((left, top, width, height) =>
      setMapZone({ left, top, width, height }),
    );
  const pxPerMeterX = dpPerMeter(screen.width);
  const cinematic = useRegionCinematic({
    view,
    subjectId,
    index,
    focusPoint,
    frame,
    screen: { width: screen.width, height: screen.height },
    zone: mapZone,
    map,
    tiles,
    animated,
    active,
    webgl,
    veil,
    open,
    select,
  });
  const {
    cameraFlight,
    cinematicActive,
    cinemaProgress,
    diving,
    enter,
    goBack: goBackRegion,
    hudStyle,
    intro,
    onExplore,
    onTilesReady,
    skipCinema,
    tiledPan,
    tiledPlace,
  } = cinematic;
  useEffect(() => {
    navigation.setOptions({ tabBarStyle: cinematicActive ? { display: 'none' } : undefined });
  }, [cinematicActive, navigation]);
  const celebration = useMapCelebration({
    map: mapLoaded ? map : null,
    active: active && !intro && !cinematicActive,
    animated,
  });
  const viewport = { width: screen.width, height: screen.height };
  const [markersTouchable, setMarkersTouchable] = useState(true);
  useAnimatedReaction(
    () => MAP_ZOOM.value >= TAP_ZOOM,
    (touchable, previous) => {
      if (touchable !== previous) runOnJS(setMarkersTouchable)(touchable);
    },
    [],
  );
  useEffect(() => () => clearTimeout(walkDelay.current), []);
  // Si l'arrivée n'est jamais annoncée (scène en panne), la fiche s'ouvre quand même.
  useEffect(() => {
    if (!arriving) return;
    const timer = setTimeout(() => {
      setArriving(null);
      setSheet(arriving);
    }, ARRIVAL_TIMEOUT_MS);
    return () => clearTimeout(timer);
  }, [arriving]);
  const voiceEnabled = useStudyRules().data?.voiceEnabled ?? true;
  const mapAnchors = useMemo<readonly StageAnchor[]>(
    () =>
      map
        ? [
            ...map.nodes.map((n) => ({ id: n.levelId, position: [n.x, 0.06, n.z] as const })),
            ...map.cities.map((c) => ({ id: cityAnchorId(c.id), position: cityBannerAnchor(c) })),
          ]
        : [],
    [map],
  );

  const up = upOf(view);
  const goBack = useCallback(() => {
    if (sheet) {
      setSheet(null);
      return;
    }
    goBackRegion();
  }, [goBackRegion, setSheet, sheet]);
  useViewBack(up !== null || sheet !== null, goBack);

  // Teinte des régions : la région choisie est allumée, les autres sont grises.
  const look: RegionLook = { mix: view.kind === 'carousel' ? 0 : 1, focus: selectedId };
  // Les modèles de la région choisie se chargent pendant qu'on la regarde et pendant le plongeon
  // (une carte pré-rendue n'a besoin que de la figurine de l'avatar).
  useEffect(() => {
    if (!webgl || view.kind !== 'regions' || !selectedId) return;
    if (PRERENDERED_MAPS[selectedId]) preloadAvatar();
    else preloadRegion(selectedId);
  }, [webgl, view.kind, selectedId]);
  const diveFocus = diving ? focusOf(diving) : null;

  if (!slide) return null;
  // Échelle à l'écran : la vue plongeante raccourcit l'axe z du sinus de l'élévation.
  const pxPerMeterZ = pxPerMeterX * Math.sin((MAP_ELEVATION * Math.PI) / 180);
  // Glisser le doigt sur la carte d'une région la déplace dans tous les sens, avec de l'élan. Le
  // geste réveille la scène, endormie quand les animations sont réduites (FrameDriver) ; la caméra
  // redemande ensuite des images tant qu'elle n'est pas au repos.
  const pan = Gesture.Pan()
    .runOnJS(true)
    .minDistance(8)
    .onBegin(() => {
      beginScroll(MAP_SCROLL);
      requestSceneFrames();
    })
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
    .onBegin(() => {
      beginDrag(STAGE_ORBIT);
      requestSceneFrames();
    })
    .onUpdate((event) => drag(STAGE_ORBIT, event.translationX, shot.azimuthRange))
    .onFinalize((event) => release(STAGE_ORBIT, event.velocityX, animated));

  const mapListMode = !webgl || screenReader || showList;
  // Carte 3D : les boutons attendent les points projetés par la scène. Une carte pré-rendue place les
  // siens par le calcul (RegionMapMarkers).
  const readyMap =
    !map || mapListMode || tiles ? null : snapshot?.regionId === map.regionId ? snapshot : null;
  const showMarkers = tiles !== undefined && tiledPlace !== null && !mapListMode;
  // L'avatar se tient sur le niveau touché, sinon sur celui à jouer.
  const avatarLevelId = map
    ? walkTo?.regionId === map.regionId
      ? walkTo.levelId
      : (map.nodes[map.pawnIndex]?.levelId ?? null)
    : null;
  const canWalk = animated && webgl && !mapListMode && avatarLook !== null;
  // Sur une carte pré-rendue, l'avatar attend la fin de la célébration d'un niveau terminé là où il
  // s'est arrêté (le dernier niveau atteint, `SEEN_LEVEL`, immobile pendant l'attente) : il n'est pas
  // encore sur son niveau.
  const avatarHeld = tiles !== undefined && webgl && avatarLook !== null && celebration.holding;
  const avatarSpot =
    map && avatarHeld ? (SEEN_LEVEL.get(map.regionId) ?? avatarLevelId) : avatarLevelId;
  // Un niveau ouvert : l'avatar y marche d'abord, comme sur la carte d'un jeu, une fois le disque
  // enfoncé (une célébration en cours le laisse partir). Un niveau fermé, celui où se tient l'avatar,
  // ou sans animation : la fiche s'ouvre tout de suite. Le disque touché répond dans tous les cas.
  const openNode = (node: MapNode) => {
    clearTimeout(walkDelay.current);
    if (map) discTouch.press(map.nodes.findIndex((n) => n.levelId === node.levelId));
    if (node.state === 'locked' || !map) {
      setSheet(node);
      return;
    }
    const target = { regionId: map.regionId, levelId: node.levelId };
    const { release } = celebration;
    setArriving(null);
    if (!canWalk || node.levelId === avatarSpot) {
      release();
      setWalkTo(target);
      setSheet(node);
      return;
    }
    walkDelay.current = setTimeout(() => {
      release();
      setWalkTo(target);
      setArriving(node);
    }, PRESS_DIP_SECONDS * 1000);
  };
  const onAvatarArrive = (levelId: string) => {
    if (arriving?.levelId !== levelId) return;
    setArriving(null);
    setSheet(arriving);
  };
  // La discussion d'un niveau s'ouvre par-dessus l'onglet ; la fiche se referme derrière elle. Au
  // retour, l'avatar rejoint le niveau à jouer (le suivant, si celui-ci est franchi).
  const playLevel = (node: MapNode, mode: 'ecrit' | 'voix') => {
    setSheet(null);
    setWalkTo(null);
    router.push({ pathname: '/niveau', params: { id: node.levelId, mode } });
  };
  const goToCity = (city: MapCity) => {
    if (tiles) {
      tiledPan.goTo(city.center.x, city.center.z);
      return;
    }
    goTo(MAP_SCROLL, city.center.x, city.center.z);
    requestSceneFrames();
  };
  // Les points projetés servent aux boutons et bandeaux posés sur la carte d'une région.
  const onProject = (projected: ScreenPoint[] | null, camera: { x: number; z: number }) => {
    if (view.kind === 'region' && projected) {
      setSnapshot({ points: projected, camera, regionId: view.regionId });
    }
  };

  return (
    <GestureHandlerRootView style={styles.screen}>
      {webgl ? (
        <ExplorerStage
          stage={{
            slides,
            index,
            shot,
            orbit: STAGE_ORBIT,
            regions: look,
            anchors: mapAnchors,
            onProject,
            region:
              map && view.kind === 'region' && !tiles
                ? {
                    map,
                    color: explorerArt.regions[view.regionId as keyof typeof explorerArt.regions],
                    scroll: MAP_SCROLL,
                    avatar:
                      avatarLook && avatarLevelId
                        ? {
                            look: avatarLook,
                            levelId: avatarLevelId,
                            quick: arriving !== null,
                            onArrive: onAvatarArrive,
                          }
                        : null,
                  }
                : null,
            // Carte pré-rendue affichée : la scène ne calcule plus d'images et se cache, comme hors
            // de l'onglet (le ciel des tuiles laisserait sinon voir l'île).
            active: active && !tiles,
            animated,
            flight: cameraFlight,
            probe: perfHud,
          }}
          fallback={{ slide, frame }}
          shown={shown && !tiles}
        />
      ) : null}
      {!webgl && !tiles ? (
        <>
          <SkyBackdrop />
          <StageFallback slide={slide} frame={frame} />
        </>
      ) : null}
      {tiles ? (
        <>
          <SkyBackdrop />
          {map && tiledPlace ? (
            <RegionMapWorld
              key={map.regionId}
              tiles={tiles}
              screen={viewport}
              map={map}
              start={tiledPlace.start}
              terrainScale={TERRAIN_SCALES[map.regionId]}
              // La liste couvre la carte : nuages, reflets et halo s'arrêtent.
              ambient={active && animated && !mapListMode}
              probe={perfHud}
              celebration={celebration.shown}
              touch={discTouch.values}
              onReady={onTilesReady}>
              {webgl && avatarLook ? (
                <MapAvatarView
                  map={map}
                  tiles={tiles}
                  screen={viewport}
                  look={avatarLook}
                  levelId={avatarLevelId}
                  quick={arriving !== null}
                  active={active && !mapListMode}
                  animated={animated}
                  probe={perfHud}
                  hold={avatarHeld}
                  onArrive={onAvatarArrive}
                />
              ) : null}
            </RegionMapWorld>
          ) : null}
        </>
      ) : null}
      <Animated.View
        style={[StyleSheet.absoluteFill, hudStyle]}
        pointerEvents={cinematicActive ? 'none' : 'box-none'}>
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
              onExplore={onExplore}
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
              pan={tiles ? tiledPan.gesture : pan}
              listMode={mapListMode}
              onToggleList={() => setShowList((value) => !value)}
              onNode={openNode}
              onCity={goToCity}
              onGoToCity={goToCity}
              onRecenter={
                tiles
                  ? () => {
                      const node = map.nodes.find((item) => item.levelId === avatarSpot);
                      if (node) tiledPan.recenter(node.x, node.z);
                    }
                  : undefined
              }
              zoneRef={mapZoneRef}
              onZoneLayout={measureMapZone}
            />
          ) : null}
        </View>
        {sheet && map && view.kind === 'region' ? (
          <LevelSheet
            map={map}
            node={map.nodes.find((n) => n.levelId === sheet.levelId) ?? sheet}
            bottom={clearance}
            voiceEnabled={voiceEnabled}
            onWrite={() => playLevel(sheet, 'ecrit')}
            onVoice={() => playLevel(sheet, 'voix')}
            onClose={() => setSheet(null)}
          />
        ) : null}
      </Animated.View>
      {map && mapZone && (readyMap || showMarkers) ? (
        <View
          pointerEvents="box-none"
          style={[
            styles.mapClip,
            {
              top: mapZone.top,
              height: mapZone.height,
              overflow: cinematicActive ? 'visible' : 'hidden',
            },
          ]}>
          <View
            pointerEvents="box-none"
            style={[styles.mapClipInner, { top: -mapZone.top, height: screen.height }]}>
            {tiles ? (
              <RegionMapMarkers
                key={map.regionId}
                map={map}
                tiles={tiles}
                screen={viewport}
                avatarLevelId={avatarSpot}
                onNode={openNode}
                onCity={goToCity}
                celebration={celebration.shown}
                touchable={markersTouchable}
              />
            ) : readyMap ? (
              <MapOverlay
                map={map}
                points={readyMap.points}
                camera0={readyMap.camera}
                avatarLevelId={avatarLevelId}
                onNode={openNode}
                onCity={goToCity}
              />
            ) : null}
          </View>
        </View>
      ) : null}
      <SkyVeil style={veil.style} />
      {animated ? <WindStreaks progress={cinematic.windProgress} /> : null}
      {perfHud ? <PerfHud /> : null}
      {/* Les objets de la garde-robe gagnés depuis la dernière visite. */}
      <WardrobeNews visible={active && !diving} />
      <CinemaFrame progress={cinemaProgress} active={cinematicActive} onSkip={skipCinema} />
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  // Transparent : sur Android, la scène 3D, montée sous la pile de navigation, se voit à travers.
  screen: { flex: 1 },
  mapClip: { position: 'absolute', left: 0, right: 0, overflow: 'hidden' },
  mapClipInner: { position: 'absolute', left: 0, right: 0 },
  content: {
    flex: 1,
    paddingHorizontal: theme.layout.screenPadding,
    gap: theme.space[2],
  },
});
