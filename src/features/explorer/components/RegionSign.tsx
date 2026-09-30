import { Image, StyleSheet, View } from 'react-native';

import { PressableBase } from '@/components/PressableBase';
import { Text } from '@/components/Text';
import { fr } from '@/i18n/fr';
import { theme } from '@/theme';
import { explorerArt } from '@/theme/explorerArt';

import type { IslandRegion } from '../hooks/useIslandRegions';
import { GameText } from './hud/GameText';

// Texture de planches rendue par Blender (tools/explorer-3d/wood_panel.py).
const WOOD = require('../../../../assets/explorer/images/wood-panel.webp');

const HUD = explorerArt.hud;
export const SIGN_WIDTH = 106;
export const SIGN_HEIGHT = 52;

export function regionLabel(region: IslandRegion): string {
  return fr.explorer.regionSign(
    region.region.name,
    region.citiesDone,
    region.citiesTotal,
    region.stars,
    fr.explorer.regionStatus[region.status],
  );
}

/** Pastille d'état : À découvrir, En cours, À consolider ou Validée. */
export function StatusPill({ region }: { region: IslandRegion }) {
  const colors = HUD.status[region.status];
  return (
    <View style={[styles.pill, { backgroundColor: colors.face }]}>
      <Text variant="caption" weight="bold" color={colors.ink} maxFontSizeMultiplier={1.2}>
        {fr.explorer.regionStatus[region.status]}
      </Text>
    </View>
  );
}

type Props = {
  region: IslandRegion;
  selected: boolean;
  onPress: () => void;
};

/**
 * Petit panneau de bois posé hors de l'île, relié à sa région par un trait (RegionSigns) : nom,
 * villes validées et étoiles. Son état se lit sur la pastille de couleur du coin ; le détail est
 * dans le panneau de la région choisie et dans le libellé d'accessibilité.
 */
export function RegionSign({ region, selected, onPress }: Props) {
  const color = explorerArt.regions[region.regionId as keyof typeof explorerArt.regions];
  const status = HUD.status[region.status];
  return (
    <PressableBase
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={regionLabel(region)}
      aria-selected={selected}
      style={[
        styles.sign,
        selected && styles.selected,
        { borderColor: selected ? HUD.gold.face[1] : HUD.wood.frame },
      ]}>
      <Image
        source={WOOD}
        resizeMode="cover"
        accessibilityIgnoresInvertColors
        style={StyleSheet.absoluteFill}
      />
      <View style={[styles.stripe, { backgroundColor: color }]} />
      <View style={styles.body}>
        <GameText size={11} stroke={1.5} drop={1} numberOfLines={2}>
          {region.region.shortName ?? region.region.name}
        </GameText>
        <GameText size={10} stroke={1.5} drop={0}>
          {`${fr.explorer.citiesCount(region.citiesDone, region.citiesTotal)}  ★ ${region.stars}`}
        </GameText>
      </View>
      <View style={[styles.dot, { backgroundColor: status.face }]} />
    </PressableBase>
  );
}

const styles = StyleSheet.create({
  sign: {
    width: SIGN_WIDTH,
    height: SIGN_HEIGHT,
    borderRadius: 12,
    borderWidth: 3,
    overflow: 'hidden',
    justifyContent: 'center',
    backgroundColor: HUD.wood.frame,
    boxShadow: theme.shadow.md,
  },
  selected: { transform: [{ scale: 1.06 }] },
  stripe: { position: 'absolute', top: 0, left: 0, bottom: 0, width: 6 },
  body: { paddingLeft: theme.space[3], paddingRight: theme.space[3], gap: 1 },
  dot: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 11,
    height: 11,
    borderRadius: theme.radius.full,
    borderWidth: 1.5,
    borderColor: HUD.ink,
  },
  pill: {
    paddingHorizontal: theme.space[2],
    paddingVertical: 1,
    borderRadius: theme.radius.full,
    borderWidth: 1.5,
    borderColor: HUD.ink,
  },
});
