import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { runOnJS, useAnimatedReaction, useAnimatedStyle } from 'react-native-reanimated';

import { Icon, type IconName } from '@/components/Icon';
import { PressableBase } from '@/components/PressableBase';
import { fr } from '@/i18n/fr';
import { theme } from '@/theme';
import { explorerArt } from '@/theme/explorerArt';

import { MAP_SCROLL_X } from '../../hooks/mapScrollValue';
import type { LevelType } from '../../content';
import type { MapCity, MapNode, RegionMap } from '../../logic/regionMap';
import type { ScreenPoint } from '../IslandStage';
import { GameText } from '../hud/GameText';

const HUD = explorerArt.hud;
const TARGET = 48;
/** Largeur de carte, en mètres, autour de la caméra où les boutons sont montés (±3 écrans environ). */
const WINDOW = 4.5;
/** La fenêtre est recalculée quand la caméra change de tranche de 1,5 m. */
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

/**
 * Placement sur l'écran pendant le défilement : la caméra ne fait que glisser le long de la bande,
 * donc la position d'un point est une droite de la position de la caméra (x0 - k × déplacement),
 * avec `k` en pixels par mètre à la profondeur du point. Calculée sur le fil de l'interface, sans
 * repasser par React.
 */
function usePlacement(point: ScreenPoint, cameraX0: number, offsetX: number, offsetY: number) {
  return useAnimatedStyle(() => ({
    transform: [
      { translateX: point.x - point.k * (MAP_SCROLL_X.value - cameraX0) + offsetX },
      { translateY: point.y + offsetY },
    ],
  }));
}

function NodeButton({
  node,
  point,
  cameraX0,
  onPress,
}: {
  node: MapNode;
  point: ScreenPoint;
  cameraX0: number;
  onPress: () => void;
}) {
  const placement = usePlacement(point, cameraX0, -TARGET / 2, -TARGET / 2);
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
  cameraX0,
  onPress,
}: {
  city: MapCity;
  point: ScreenPoint;
  cameraX0: number;
  onPress: () => void;
}) {
  const placement = usePlacement(point, cameraX0, 0, 0);
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
  cameraX0: number;
  onNode: (node: MapNode) => void;
  onCity: (city: MapCity) => void;
};

/**
 * Boutons de niveau (48 px, avec leur libellé complet) et bandeaux de ville posés sur la carte 3D.
 * Seuls ceux proches de la caméra sont montés : la carte d'une région peut faire plusieurs dizaines
 * d'écrans de long.
 */
export function MapOverlay({ map, points, cameraX0, onNode, onCity }: Props) {
  const [bucket, setBucket] = useState(() => Math.round(cameraX0 / BUCKET));
  useAnimatedReaction(
    () => Math.round(MAP_SCROLL_X.value / BUCKET),
    (value, previous) => {
      if (value !== previous) runOnJS(setBucket)(value);
    },
  );
  const centre = bucket * BUCKET;
  const at = new Map(points.map((p) => [p.id, p]));
  return (
    <View pointerEvents="box-none" style={StyleSheet.absoluteFill}>
      {map.nodes.map((node) => {
        const point = at.get(node.levelId);
        if (!point || Math.abs(node.x - centre) > WINDOW) return null;
        return (
          <NodeButton
            key={node.levelId}
            node={node}
            point={point}
            cameraX0={cameraX0}
            onPress={() => onNode(node)}
          />
        );
      })}
      {map.cities.map((city) => {
        const point = at.get(cityAnchorId(city.id));
        if (!point || Math.abs(city.monumentX - centre) > WINDOW) return null;
        return (
          <CityBanner
            key={city.id}
            city={city}
            point={point}
            cameraX0={cameraX0}
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
