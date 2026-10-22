import { useCallback, useRef, useState, type RefObject } from 'react';
import { StyleSheet, View } from 'react-native';
import {
  GestureDetector,
  type GestureType,
  type SimultaneousGesture,
} from 'react-native-gesture-handler';
import { runOnJS, useAnimatedReaction } from 'react-native-reanimated';

import { fr } from '@/i18n/fr';
import { theme } from '@/theme';
import { explorerArt } from '@/theme/explorerArt';

import { MAP_SCROLL_X, MAP_SCROLL_Z } from '../../hooks/mapScrollValue';
import { cityAt, type MapCity, type MapNode, type RegionMap } from '../../logic/regionMap';
import { GameButton } from '@/components/game/GameButton';
import { GameText } from '@/components/game/GameText';
import { CityPanel } from './CityPanel';
import { MapListView } from './MapListView';

type Props = {
  map: RegionMap;
  regionName: string;
  onBack: () => void;
  /** Geste qui fait défiler la carte. */
  pan: GestureType | SimultaneousGesture;
  /** Liste à la place de la carte 3D (sans WebGL, lecteur d'écran, ou choix de l'élève). */
  listMode: boolean;
  onToggleList: () => void;
  onNode: (node: MapNode) => void;
  onCity: (city: MapCity) => void;
  /** Fait glisser la carte jusqu'à une ville. */
  onGoToCity: (city: MapCity) => void;
  onRecenter?: () => void;
  /** Zone libre entre l'en-tête et le panneau, mesurée par l'écran pour y rogner les boutons posés sur la carte. */
  zoneRef: RefObject<View | null>;
  onZoneLayout: () => void;
};

/**
 * Ville la plus proche du centre de l'écran, pour l'en-tête et le panneau : elle suit le déplacement. Seul un
 * changement de ville repasse par React, pas chaque image.
 */
function useCityInView(map: RegionMap): MapCity | undefined {
  const [id, setId] = useState(
    () => cityAt(map, { x: MAP_SCROLL_X.value, z: MAP_SCROLL_Z.value })?.id,
  );
  const last = useRef(id);
  const update = useCallback(
    (x: number, z: number) => {
      const city = cityAt(map, { x, z });
      if (city && city.id !== last.current) {
        last.current = city.id;
        setId(city.id);
      }
    },
    [map],
  );
  useAnimatedReaction(
    () => Math.round(MAP_SCROLL_X.value * 2) * 10000 + Math.round(MAP_SCROLL_Z.value * 2),
    (value, previous) => {
      if (value === previous) return;
      const column = Math.round(value / 10000);
      runOnJS(update)(column / 2, (value - column * 10000) / 2);
    },
    [update],
  );
  return map.cities.find((c) => c.id === id) ?? map.cities[0];
}

/** X2b · carte d'une région : retour, nom de la région et de la ville, carte défilante, panneau de ville. */
export function RegionMapHud({
  map,
  regionName,
  onBack,
  pan,
  listMode,
  onToggleList,
  onNode,
  onCity,
  onGoToCity,
  onRecenter,
  zoneRef,
  onZoneLayout,
}: Props) {
  const city = useCityInView(map);
  if (!city) return null;
  const position = map.cities.indexOf(city);
  const previous = map.cities[position - 1];
  const next = map.cities[position + 1];
  const nextNode = map.nodes.find((n) => n.cityId === city.id && n.state === 'active');
  // Un nom long (« Ville des Produits de fractions ») passe en plus petit, sur deux lignes au besoin,
  // sans jamais glisser sous les boutons.
  const long = city.name.length > TITLE_FIT;
  return (
    <>
      <View style={styles.top}>
        <GameButton
          tone="yellow"
          round
          size={explorerArt.regionMap.buttonSize}
          icon="chevron-gauche"
          accessibilityLabel={fr.explorer.backToRegions}
          onPress={onBack}
        />
        {onRecenter ? (
          <GameButton
            tone="blue"
            round
            size={explorerArt.regionMap.buttonSize}
            icon="cible"
            accessibilityLabel={fr.explorer.recenterAvatar}
            onPress={onRecenter}
          />
        ) : null}
        <View
          style={styles.titles}
          accessible
          accessibilityLabel={fr.explorer.regionMapLabel(regionName)}>
          <GameText
            size={explorerArt.regionMap.titleMeta}
            align="center"
            stroke={2}
            drop={1}
            numberOfLines={1}>
            {regionName}
          </GameText>
          <GameText
            size={long ? explorerArt.regionMap.titleCompact : explorerArt.regionMap.title}
            align="center"
            numberOfLines={long ? 2 : 1}
            style={styles.title}>
            {city.name}
          </GameText>
        </View>
        <GameButton
          tone="green"
          round
          size={explorerArt.regionMap.buttonSize}
          icon={listMode ? 'boussole' : 'revisions'}
          accessibilityLabel={listMode ? fr.explorer.viewMap : fr.explorer.viewList}
          onPress={onToggleList}
        />
      </View>
      {listMode ? (
        <View style={styles.list}>
          <MapListView map={map} onNode={onNode} onCity={onCity} />
        </View>
      ) : (
        <GestureDetector gesture={pan}>
          <View
            ref={zoneRef}
            testID="explorer-region-map-zone"
            collapsable={false}
            onLayout={onZoneLayout}
            style={styles.zone}
          />
        </GestureDetector>
      )}
      <CityPanel
        city={city}
        next={nextNode}
        onPrevious={previous ? () => onGoToCity(previous) : null}
        onNext={next ? () => onGoToCity(next) : null}
      />
    </>
  );
}

/** Nombre de lettres d'un nom de ville qui tient en grand entre les deux boutons (écran de 360 dp). */
const TITLE_FIT = 20;

const styles = StyleSheet.create({
  top: { flexDirection: 'row', alignItems: 'center', gap: theme.space[3] },
  titles: { flex: 1, alignItems: 'center' },
  // Le titre prend toute la largeur entre les boutons : un nom trop long y revient à la ligne.
  title: { alignSelf: 'stretch' },
  zone: { flex: 1 },
  list: { flex: 1 },
});
