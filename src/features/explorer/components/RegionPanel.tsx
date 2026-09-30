import { StyleSheet, View } from 'react-native';

import { Icon } from '@/components/Icon';
import { fr } from '@/i18n/fr';
import { theme } from '@/theme';
import { explorerArt } from '@/theme/explorerArt';

import type { IslandRegion } from '../hooks/useIslandRegions';
import { GameButton } from './hud/GameButton';
import { GameText } from './hud/GameText';
import { Parchment, StarChip, WoodFrame, WoodGauge } from './hud/WoodFrame';
import { StatusPill } from './RegionSign';

function nextLabel(region: IslandRegion): string {
  if (region.toConsolidate > 0) return fr.explorer.toConsolidate(region.toConsolidate);
  if (!region.next) return fr.explorer.allDone;
  const type = fr.explorer.levelTypes[region.next.level.type];
  return region.status === 'discover'
    ? fr.explorer.startWith(type, region.next.level.title)
    : fr.explorer.nextStep(type, region.next.level.title);
}

type Props = { region: IslandRegion; onEnter: () => void };

/**
 * Panneau de bois de la région choisie (X2a), qui s'ouvre au toucher d'un panneau : choisir une
 * région la marque comme visitée, donc son état n'est jamais « À découvrir » ici.
 * : son nom, ses villes validées, ses étoiles, la
 * prochaine étape et le bouton pour y entrer.
 */
export function RegionPanel({ region, onEnter }: Props) {
  const color = explorerArt.regions[region.regionId as keyof typeof explorerArt.regions];
  const action = fr.explorer.enterRegion;
  return (
    <WoodFrame tab={fr.explorer.regionTab} accessibilityLabel={region.region.name}>
      <View style={styles.top}>
        <View style={styles.title}>
          <Icon name="drapeau" size={18} strokeWidth={2.5} color={color} />
          <GameText size={19} numberOfLines={1} style={styles.name}>
            {region.region.name}
          </GameText>
        </View>
        <StatusPill region={region} />
      </View>
      <View style={styles.top}>
        <View
          accessible
          accessibilityLabel={fr.explorer.cities(region.citiesDone, region.citiesTotal)}
          style={styles.title}>
          <GameText size={21}>
            {fr.explorer.citiesCount(region.citiesDone, region.citiesTotal)}
          </GameText>
          <GameText size={13} stroke={2} drop={1}>
            {fr.explorer.citiesWord(region.citiesDone)}
          </GameText>
        </View>
        <StarChip stars={region.stars} label={fr.explorer.stars(region.stars)} />
      </View>
      <Parchment>{nextLabel(region)}</Parchment>
      <WoodGauge
        percent={
          region.citiesTotal > 0 ? Math.round((region.citiesDone / region.citiesTotal) * 100) : 0
        }
        gradient={[color, color]}
      />
      <GameButton
        tone="green"
        size={48}
        label={action}
        accessibilityLabel={`${action} ${region.region.name}`}
        icon="fleche-droite"
        onPress={onEnter}
      />
    </WoodFrame>
  );
}

const styles = StyleSheet.create({
  top: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: theme.space[3],
  },
  title: { flexDirection: 'row', alignItems: 'center', gap: theme.space[2], flexShrink: 1 },
  name: { flexShrink: 1 },
});
