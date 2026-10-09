import { ScrollView, StyleSheet, View } from 'react-native';

import { Icon } from '@/components/Icon';
import { PressableBase } from '@/components/PressableBase';
import { Text } from '@/components/Text';
import { fr } from '@/i18n/fr';
import { theme } from '@/theme';
import { explorerArt } from '@/theme/explorerArt';

import type { MapCity, MapNode, RegionMap } from '../../logic/regionMap';
import { GameText } from '@/components/game/GameText';
import { nodeLabel } from './MapOverlay';

const HUD = explorerArt.hud;
const STATE_COLOR = {
  completed: HUD.status.done.face,
  active: HUD.status.current.face,
  locked: explorerArt.map.node.locked,
} as const;

type Props = {
  map: RegionMap;
  onNode: (node: MapNode) => void;
  onCity: (city: MapCity) => void;
};

/**
 * La carte d'une région en liste : ville par ville, niveau par niveau. Elle s'ouvre d'office avec un
 * lecteur d'écran et remplace la 3D sans WebGL ; chaque ligne est un bouton de 56 px au moins.
 */
export function MapListView({ map, onNode, onCity }: Props) {
  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}>
      {map.cities.map((city) => (
        <View key={city.id} style={styles.city}>
          <PressableBase
            onPress={() => onCity(city)}
            accessibilityRole="button"
            accessibilityLabel={fr.explorer.cityBanner(
              city.name,
              fr.explorer.cityStatus[city.status],
            )}
            style={styles.cityHeader}>
            <GameText size={16} stroke={2} drop={1} numberOfLines={1}>
              {city.name}
            </GameText>
            <Text variant="caption" weight="bold" color={HUD.white}>
              {`${fr.explorer.cityLevels(city.levelsDone, city.levelsTotal)} · ${fr.explorer.cityStatus[city.status]}`}
            </Text>
          </PressableBase>
          {map.nodes
            .filter((node) => node.cityId === city.id)
            .map((node) => (
              <PressableBase
                key={node.levelId}
                onPress={() => onNode(node)}
                accessibilityRole="button"
                accessibilityLabel={nodeLabel(node)}
                style={styles.level}>
                <View style={[styles.dot, { backgroundColor: STATE_COLOR[node.state] }]} />
                <View style={styles.texts}>
                  <Text variant="bodySm" weight="bold" color={HUD.white} numberOfLines={2}>
                    {node.title}
                  </Text>
                  <Text variant="caption" color={HUD.white}>
                    {`${fr.explorer.levelTypes[node.type]} · ${fr.explorer.levelState[node.state]}`}
                  </Text>
                </View>
                {node.stars > 0 ? (
                  <View style={styles.stars}>
                    <Icon name="etoile" variant="fill" size={14} color={HUD.gold.face[1]} />
                    <Text variant="caption" weight="bold" color={HUD.white}>
                      {String(node.stars)}
                    </Text>
                  </View>
                ) : null}
              </PressableBase>
            ))}
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  content: { gap: theme.space[3], paddingBottom: theme.space[4] },
  city: {
    borderRadius: 14,
    borderWidth: 3,
    borderColor: HUD.wood.frame,
    overflow: 'hidden',
    backgroundColor: HUD.wood.groove,
  },
  cityHeader: {
    minHeight: 56,
    justifyContent: 'center',
    paddingVertical: theme.space[2],
    paddingHorizontal: theme.space[3],
    backgroundColor: HUD.wood.frame,
  },
  level: {
    minHeight: 56,
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.space[3],
    paddingVertical: theme.space[2],
    paddingHorizontal: theme.space[3],
  },
  dot: { width: 14, height: 14, borderRadius: 7, borderWidth: 2, borderColor: HUD.ink },
  texts: { flex: 1 },
  stars: { flexDirection: 'row', alignItems: 'center', gap: 2 },
});
