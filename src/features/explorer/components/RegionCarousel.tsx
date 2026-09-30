import { useEffect, useRef } from 'react';
import {
  Image,
  ScrollView,
  StyleSheet,
  useWindowDimensions,
  View,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from 'react-native';

import { PressableBase } from '@/components/PressableBase';
import { Text } from '@/components/Text';
import { fr } from '@/i18n/fr';
import { theme } from '@/theme';
import { explorerArt } from '@/theme/explorerArt';

import type { IslandRegion } from '../hooks/useIslandRegions';
import { GameButton } from './hud/GameButton';
import { GameText } from './hud/GameText';

// Texture de planches rendue par Blender (tools/explorer-3d/wood_panel.py).
const WOOD = require('../../../../assets/explorer/images/wood-panel.webp');

const HUD = explorerArt.hud;
const GAP = theme.space[3];
const CARD_HEIGHT = 112;

function regionLabel(region: IslandRegion): string {
  return fr.explorer.regionSign(
    region.region.name,
    region.citiesDone,
    region.citiesTotal,
    region.stars,
    fr.explorer.regionStatus[region.status],
  );
}

function nextLabel(region: IslandRegion): string {
  if (region.toConsolidate > 0) return fr.explorer.toConsolidate(region.toConsolidate);
  if (!region.next) return fr.explorer.allDone;
  const type = fr.explorer.levelTypes[region.next.level.type];
  return region.status === 'discover'
    ? fr.explorer.startWith(type, region.next.level.title)
    : fr.explorer.nextStep(type, region.next.level.title);
}

/** Pastille d'état : À découvrir, En cours, À consolider ou Validée. */
function StatusPill({ region }: { region: IslandRegion }) {
  const colors = HUD.status[region.status];
  return (
    <View style={[styles.pill, { backgroundColor: colors.face }]}>
      <Text variant="caption" weight="bold" color={colors.ink} maxFontSizeMultiplier={1.2}>
        {fr.explorer.regionStatus[region.status]}
      </Text>
    </View>
  );
}

type CardProps = { region: IslandRegion; width: number; active: boolean; onPress: () => void };

/**
 * Carte d'une région : en bois, avec sa couleur sur le côté. La région choisie est lumineuse ; les
 * autres sont grisées, comme sur l'île.
 */
function RegionCard({ region, width, active, onPress }: CardProps) {
  const color = explorerArt.regions[region.regionId as keyof typeof explorerArt.regions];
  return (
    <PressableBase
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={regionLabel(region)}
      aria-selected={active}
      style={[
        styles.card,
        { width, borderColor: active ? HUD.gold.face[1] : HUD.wood.frame },
        active && styles.active,
      ]}>
      <Image
        source={WOOD}
        resizeMode="cover"
        accessibilityIgnoresInvertColors
        style={StyleSheet.absoluteFill}
      />
      <View style={[styles.stripe, { backgroundColor: color }]} />
      <View style={styles.body}>
        <View style={styles.head}>
          <GameText size={11} stroke={1.5} drop={1} numberOfLines={1}>
            {region.number === null ? fr.explorer.islet : fr.explorer.regionNumber(region.number)}
          </GameText>
          <StatusPill region={region} />
        </View>
        <GameText size={18} numberOfLines={1}>
          {region.region.name}
        </GameText>
        <GameText size={13} stroke={2} drop={1}>
          {`${fr.explorer.citiesCount(region.citiesDone, region.citiesTotal)} ${fr.explorer.citiesWord(region.citiesDone)}  ★ ${region.stars}`}
        </GameText>
        <Text variant="caption" weight="bold" color={HUD.white} numberOfLines={1}>
          {nextLabel(region)}
        </Text>
      </View>
      {active ? null : <View pointerEvents="none" style={styles.gray} />}
    </PressableBase>
  );
}

type Props = {
  regions: readonly IslandRegion[];
  selectedId: string | null;
  onSelect: (regionId: string) => void;
  onEnter: (regionId: string) => void;
};

/**
 * Carrousel des régions, en bas de X2a : on le fait défiler au doigt ou avec les flèches, la carte
 * au centre est la région choisie (lumineuse sur l'île), et le bouton vert y entre.
 */
export function RegionCarousel({ regions, selectedId, onSelect, onEnter }: Props) {
  const { width: screenWidth } = useWindowDimensions();
  const cardWidth = Math.min(screenWidth * 0.72, 290);
  const interval = cardWidth + GAP;
  const side = (screenWidth - cardWidth) / 2;
  const scroll = useRef<ScrollView>(null);
  const index = Math.max(
    0,
    regions.findIndex((r) => r.regionId === selectedId),
  );
  const lastIndex = useRef(index);

  // Quand la région change autrement qu'au doigt (flèches, premier affichage), le carrousel suit.
  useEffect(() => {
    scroll.current?.scrollTo({ x: index * interval, animated: lastIndex.current !== index });
    lastIndex.current = index;
  }, [index, interval]);

  const onScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const next = Math.round(event.nativeEvent.contentOffset.x / interval);
    const region = regions[Math.min(Math.max(next, 0), regions.length - 1)];
    if (region && region.regionId !== selectedId) {
      lastIndex.current = regions.indexOf(region);
      onSelect(region.regionId);
    }
  };

  const go = (step: number) => {
    const region = regions[index + step];
    if (region) onSelect(region.regionId);
  };
  const selected = regions[index];
  return (
    <View style={styles.wrap}>
      <ScrollView
        ref={scroll}
        horizontal
        snapToInterval={interval}
        decelerationRate="fast"
        scrollEventThrottle={16}
        onScroll={onScroll}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: side, gap: GAP }}
        accessibilityLabel={fr.explorer.regionsList}>
        {regions.map((region, i) => (
          <RegionCard
            key={region.regionId}
            region={region}
            width={cardWidth}
            active={i === index}
            onPress={() => onSelect(region.regionId)}
          />
        ))}
      </ScrollView>
      <View style={styles.actions}>
        <GameButton
          tone="yellow"
          round
          size={48}
          icon="chevron-gauche"
          accessibilityLabel={fr.explorer.previousRegion}
          onPress={index > 0 ? () => go(-1) : undefined}
          style={index > 0 ? null : styles.off}
        />
        <GameButton
          tone="green"
          size={52}
          label={fr.explorer.enterRegion}
          accessibilityLabel={`${fr.explorer.enterRegion} ${selected?.region.name ?? ''}`}
          icon="fleche-droite"
          onPress={selected ? () => onEnter(selected.regionId) : undefined}
          style={styles.enter}
        />
        <GameButton
          tone="yellow"
          round
          size={48}
          icon="chevron-droit"
          accessibilityLabel={fr.explorer.nextRegion}
          onPress={index < regions.length - 1 ? () => go(1) : undefined}
          style={index < regions.length - 1 ? null : styles.off}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginHorizontal: -theme.layout.screenPadding, gap: theme.space[3] },
  card: {
    height: CARD_HEIGHT,
    borderRadius: 16,
    borderWidth: 3,
    overflow: 'hidden',
    justifyContent: 'center',
    backgroundColor: HUD.wood.frame,
    boxShadow: theme.shadow.md,
  },
  active: { transform: [{ scale: 1.03 }] },
  stripe: { position: 'absolute', top: 0, left: 0, bottom: 0, width: 7 },
  body: { paddingLeft: theme.space[4], paddingRight: theme.space[3], gap: 2 },
  head: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  gray: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: HUD.grayVeil,
  },
  pill: {
    paddingHorizontal: theme.space[2],
    paddingVertical: 1,
    borderRadius: theme.radius.full,
    borderWidth: 1.5,
    borderColor: HUD.ink,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.space[3],
    paddingHorizontal: theme.layout.screenPadding,
  },
  enter: { flex: 1 },
  off: { opacity: 0.35 },
});
