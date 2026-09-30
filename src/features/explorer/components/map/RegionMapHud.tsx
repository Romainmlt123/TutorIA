import { useCallback, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { runOnJS, useAnimatedReaction } from 'react-native-reanimated';

import { fr } from '@/i18n/fr';
import { theme } from '@/theme';

import { MAP_SCROLL_X } from '../../hooks/mapScrollValue';
import { cityAt, type MapCity, type MapNode, type RegionMap } from '../../logic/regionMap';
import { GameButton } from '../hud/GameButton';
import { GameText } from '../hud/GameText';
import { CityPanel } from './CityPanel';
import { MapListView } from './MapListView';

type Props = {
  map: RegionMap;
  regionName: string;
  onBack: () => void;
  /** Geste qui fait défiler la carte. */
  pan: ReturnType<typeof Gesture.Pan>;
  /** Liste à la place de la carte 3D (sans WebGL, lecteur d'écran, ou choix de l'élève). */
  listMode: boolean;
  onToggleList: () => void;
  onNode: (node: MapNode) => void;
  onCity: (city: MapCity) => void;
  /** Fait glisser la carte jusqu'à une ville. */
  onGoToCity: (city: MapCity) => void;
};

/**
 * Ville au centre de l'écran, pour l'en-tête et le panneau : elle suit le défilement. Seul un
 * changement de ville repasse par React, pas chaque image.
 */
function useCityInView(map: RegionMap): MapCity | undefined {
  const [id, setId] = useState(() => cityAt(map, MAP_SCROLL_X.value)?.id);
  const last = useRef(id);
  const update = useCallback(
    (x: number) => {
      const city = cityAt(map, x);
      if (city && city.id !== last.current) {
        last.current = city.id;
        setId(city.id);
      }
    },
    [map],
  );
  useAnimatedReaction(
    () => Math.round(MAP_SCROLL_X.value * 4),
    (value, previous) => {
      if (value !== previous) runOnJS(update)(value / 4);
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
}: Props) {
  const city = useCityInView(map);
  if (!city) return null;
  const position = map.cities.indexOf(city);
  const previous = map.cities[position - 1];
  const next = map.cities[position + 1];
  const nextNode = map.nodes.find((n) => n.cityId === city.id && n.state === 'active');
  return (
    <>
      <View style={styles.top}>
        <GameButton
          tone="yellow"
          round
          size={48}
          icon="chevron-gauche"
          accessibilityLabel={fr.explorer.backToRegions}
          onPress={onBack}
        />
        <View
          style={styles.titles}
          accessible
          accessibilityLabel={fr.explorer.regionMapLabel(regionName)}>
          <GameText size={13} align="center" stroke={2} drop={1} numberOfLines={1}>
            {regionName}
          </GameText>
          <GameText size={22} align="center" numberOfLines={1}>
            {city.name}
          </GameText>
        </View>
        <GameButton
          tone="green"
          round
          size={48}
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
          <View style={styles.zone} />
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

const styles = StyleSheet.create({
  top: { flexDirection: 'row', alignItems: 'center', gap: theme.space[3] },
  titles: { flex: 1, alignItems: 'center' },
  zone: { flex: 1 },
  list: { flex: 1 },
});
