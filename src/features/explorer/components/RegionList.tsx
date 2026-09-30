import { StyleSheet, View } from 'react-native';

import { PressableBase } from '@/components/PressableBase';
import { Text } from '@/components/Text';
import { fr } from '@/i18n/fr';
import { theme } from '@/theme';
import { explorerArt } from '@/theme/explorerArt';

import type { IslandRegion } from '../hooks/useIslandRegions';
import { GameText } from './hud/GameText';
import { regionLabel, StatusPill } from './RegionSign';

const HUD = explorerArt.hud;

type Props = {
  regions: readonly IslandRegion[];
  selectedId: string | null;
  onSelect: (regionId: string) => void;
};

/**
 * Les régions en liste : sans WebGL, ou avec un lecteur d'écran, elle remplace les panneaux posés
 * sur l'île. Chaque ligne est un bouton de 56 px de haut au moins, avec son libellé complet.
 */
export function RegionList({ regions, selectedId, onSelect }: Props) {
  return (
    <View accessibilityLabel={fr.explorer.regionsList} style={styles.list}>
      {regions.map((region) => {
        const color = explorerArt.regions[region.regionId as keyof typeof explorerArt.regions];
        return (
          <PressableBase
            key={region.regionId}
            onPress={() => onSelect(region.regionId)}
            accessibilityRole="button"
            accessibilityLabel={regionLabel(region)}
            aria-selected={region.regionId === selectedId}
            style={[styles.row, region.regionId === selectedId && styles.selected]}>
            <View style={[styles.stripe, { backgroundColor: color }]} />
            <View style={styles.texts}>
              <GameText size={16} stroke={2} drop={1} numberOfLines={1}>
                {region.region.name}
              </GameText>
              <Text variant="caption" weight="bold" color={HUD.white}>
                {`${fr.explorer.citiesCount(region.citiesDone, region.citiesTotal)} · ★ ${region.stars}`}
              </Text>
            </View>
            <StatusPill region={region} />
          </PressableBase>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  list: { gap: theme.space[2] },
  row: {
    minHeight: 56,
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.space[3],
    paddingVertical: theme.space[2],
    paddingRight: theme.space[3],
    borderRadius: 14,
    borderWidth: 3,
    borderColor: HUD.wood.frame,
    overflow: 'hidden',
    backgroundColor: HUD.wood.groove,
  },
  selected: { borderColor: HUD.gold.face[1] },
  stripe: { alignSelf: 'stretch', width: 8 },
  texts: { flex: 1, gap: 1 },
});
