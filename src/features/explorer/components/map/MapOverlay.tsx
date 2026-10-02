import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { runOnJS, useAnimatedReaction, useAnimatedStyle } from 'react-native-reanimated';

import { Icon, type IconName } from '@/components/Icon';
import { PressableBase } from '@/components/PressableBase';
import { fr } from '@/i18n/fr';
import { theme } from '@/theme';
import { explorerArt } from '@/theme/explorerArt';

import { MAP_SCROLL_X, MAP_SCROLL_Z } from '../../hooks/mapScrollValue';
import type { LevelType } from '../../content';
import type { MapCity, MapNode, RegionMap } from '../../logic/regionMap';
import type { ScreenPoint } from '../IslandStage';
import { GameText } from '../hud/GameText';

const HUD = explorerArt.hud;
const TARGET = 48;
/** Demi-étendue de la carte, en mètres autour de la caméra, où les boutons sont montés (x puis z). */
const WINDOW_X = 5;
const WINDOW_Z = 9;
/** La fenêtre est recalculée quand la caméra change de case de 1,5 m. */
const BUCKET = 1.5;

/** Identifiant du point où se pose le bandeau d'une ville. */
export const cityAnchorId = (cityId: string) => `city:${cityId}`;

const TYPE_ICON: Record<LevelType, IconName> = {
  lecon: 'livre',
  exercices: 'cible',
  evaluation: 'medaille',
};

export function nodeLabel(node: MapNode): string {
  return fr.explorer.levelLabel(
    fr.explorer.levelTypes[node.type],
    node.title,
    fr.explorer.levelState[node.state],
    node.stars,
  );
}

/** Position de la caméra quand les points ont été projetés. */
type CameraAt = { x: number; z: number };

/**
 * Placement sur l'écran pendant le déplacement : la caméra est presque sans perspective et ne fait
 * que glisser au-dessus de l'île, donc la position d'un point est une droite de la position de la
 * caméra, avec `k` et `kz` en pixels par mètre selon x et z à la profondeur du point. Calculée sur
 * le fil de l'interface, sans repasser par React.
 */
function usePlacement(point: ScreenPoint, camera0: CameraAt, offsetX: number, offsetY: number) {
  return useAnimatedStyle(() => ({
    transform: [
      { translateX: point.x - point.k * (MAP_SCROLL_X.value - camera0.x) + offsetX },
      { translateY: point.y - point.kz * (MAP_SCROLL_Z.value - camera0.z) + offsetY },
    ],
  }));
}

function NodeButton({
  node,
  point,
  camera0,
  onPress,
}: {
  node: MapNode;
  point: ScreenPoint;
  camera0: CameraAt;
  onPress: () => void;
}) {
  const placement = usePlacement(point, camera0, -TARGET / 2, -TARGET / 2);
  const icon: IconName = node.state === 'locked' ? 'cadenas' : TYPE_ICON[node.type];
  return (
    <Animated.View style={[styles.node, placement]}>
      <PressableBase
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={nodeLabel(node)}
        style={styles.nodeButton}>
        <Icon
          name={icon}
          size={node.type === 'evaluation' ? 26 : 22}
          strokeWidth={2.4}
          color={HUD.white}
        />
      </PressableBase>
      {node.stars > 0 ? (
        <View style={styles.stars} pointerEvents="none">
          {[1, 2, 3].map((n) => (
            <Icon
              key={n}
              name="etoile"
              variant="fill"
              size={11}
              color={n <= node.stars ? HUD.gold.face[1] : HUD.wood.groove}
            />
          ))}
        </View>
      ) : null}
    </Animated.View>
  );
}

const CITY_COLORS = {
  done: HUD.status.done.face,
  current: HUD.status.current.face,
  consolidate: HUD.status.consolidate.face,
  locked: explorerArt.map.node.locked,
} as const;

function CityBanner({
  city,
  point,
  camera0,
  onPress,
}: {
  city: MapCity;
  point: ScreenPoint;
  camera0: CameraAt;
  onPress: () => void;
}) {
  const placement = usePlacement(point, camera0, 0, 0);
  return (
    <Animated.View style={[styles.banner, placement]} pointerEvents="box-none">
      <PressableBase
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={fr.explorer.cityBanner(city.name, fr.explorer.cityStatus[city.status])}
        style={[styles.bannerBody, { borderColor: CITY_COLORS[city.status] }]}>
        <GameText size={12} stroke={2} drop={1} numberOfLines={1}>
          {city.name}
        </GameText>
      </PressableBase>
    </Animated.View>
  );
}

type Props = {
  map: RegionMap;
  points: readonly ScreenPoint[];
  /** Position de la caméra quand `points` a été projeté. */
  camera0: CameraAt;
  onNode: (node: MapNode) => void;
  onCity: (city: MapCity) => void;
};

/** Case de 1,5 m de la caméra, sous forme d'un seul nombre (comparable sur le fil de l'interface). */
const bucketOf = (x: number, z: number) => Math.round(x / BUCKET) * 10000 + Math.round(z / BUCKET);
const columnOf = (bucket: number) => Math.round(bucket / 10000);
const rowOf = (bucket: number) => bucket - columnOf(bucket) * 10000;

/**
 * Boutons de niveau (48 px, avec leur libellé complet) et bandeaux de ville posés sur la carte 3D.
 * Seuls ceux proches de la caméra sont montés : une carte peut faire plusieurs écrans de large.
 */
export function MapOverlay({ map, points, camera0, onNode, onCity }: Props) {
  const [bucket, setBucket] = useState(() => bucketOf(camera0.x, camera0.z));
  useAnimatedReaction(
    () => Math.round(MAP_SCROLL_X.value / BUCKET) * 10000 + Math.round(MAP_SCROLL_Z.value / BUCKET),
    (value, previous) => {
      if (value !== previous) runOnJS(setBucket)(value);
    },
  );
  const centreX = columnOf(bucket) * BUCKET;
  const centreZ = rowOf(bucket) * BUCKET;
  const near = (x: number, z: number) =>
    Math.abs(x - centreX) <= WINDOW_X && Math.abs(z - centreZ) <= WINDOW_Z;
  const at = new Map(points.map((p) => [p.id, p]));
  return (
    <View pointerEvents="box-none" style={StyleSheet.absoluteFill}>
      {map.nodes.map((node) => {
        const point = at.get(node.levelId);
        if (!point || !near(node.x, node.z)) return null;
        return (
          <NodeButton
            key={node.levelId}
            node={node}
            point={point}
            camera0={camera0}
            onPress={() => onNode(node)}
          />
        );
      })}
      {map.cities.map((city) => {
        const point = at.get(cityAnchorId(city.id));
        if (!point || !near(city.center.x, city.center.z)) return null;
        return (
          <CityBanner
            key={city.id}
            city={city}
            point={point}
            camera0={camera0}
            onPress={() => onCity(city)}
          />
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  node: { position: 'absolute', left: 0, top: 0, width: TARGET, height: TARGET },
  nodeButton: { width: TARGET, height: TARGET, alignItems: 'center', justifyContent: 'center' },
  stars: {
    position: 'absolute',
    top: TARGET - 6,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 1,
  },
  banner: { position: 'absolute', left: 0, top: 0, alignItems: 'center' },
  bannerBody: {
    transform: [{ translateX: '-50%' }, { translateY: '-100%' }],
    minHeight: TARGET,
    justifyContent: 'center',
    paddingHorizontal: theme.space[3],
    borderRadius: theme.radius['2xl'],
    borderWidth: 3,
    backgroundColor: HUD.wood.frame,
  },
});
