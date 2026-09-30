import { useEffect } from 'react';
import { Image, StyleSheet, View, type ViewStyle } from 'react-native';
import Animated, {
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import { GradientSurface } from '@/components/GradientSurface';
import { Icon } from '@/components/Icon';
import { Text } from '@/components/Text';
import { fr } from '@/i18n/fr';
import { subjectTheme, theme } from '@/theme';
import { explorerArt } from '@/theme/explorerArt';

import type { IslandSlide } from '../logic/islands';
import { GameButton } from './hud/GameButton';
import { GameText } from './hud/GameText';

// Texture de planches rendue par Blender (tools/explorer-3d/wood_panel.py).
const WOOD = require('../../../../assets/explorer/images/wood-panel.webp');

const HUD = explorerArt.hud;
const WOOD_COLORS = HUD.wood;
/** Clous aux quatre coins du panneau. */
const NAILS: readonly ViewStyle[] = [
  { top: 8, left: 8 },
  { top: 8, right: 8 },
  { bottom: 8, left: 8 },
  { bottom: 8, right: 8 },
];

type Props = { slide: IslandSlide; animated: boolean; onExplore: () => void };

function nextLabel(slide: IslandSlide): string {
  if (!slide.next) return fr.explorer.allDone;
  const type = fr.explorer.levelTypes[slide.next.type];
  return slide.started
    ? fr.explorer.nextStep(type, slide.next.title)
    : fr.explorer.startWith(type, slide.next.title);
}

/** Le bouton principal respire doucement pour attirer l'œil (figé si « Réduire les animations »). */
function useBreathing(enabled: boolean) {
  const scale = useSharedValue(1);
  useEffect(() => {
    if (!enabled) {
      cancelAnimation(scale);
      scale.value = 1;
      return;
    }
    scale.value = withRepeat(
      withSequence(withTiming(1.035, { duration: 750 }), withTiming(1, { duration: 750 })),
      -1,
    );
    return () => cancelAnimation(scale);
  }, [enabled, scale]);
  return useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
}

function Nail({ style }: { style: ViewStyle }) {
  return (
    <GradientSurface
      gradient={WOOD_COLORS.nail}
      angle={160}
      radius={theme.radius.full}
      style={[styles.nail, style]}
    />
  );
}

/**
 * Panneau de quête en bois (X1) : villes validées, étoiles, prochaine étape sur une étiquette de
 * parchemin, jauge creusée dans le bois et gros bouton de jeu.
 */
export function QuestPanel({ slide, animated, onExplore }: Props) {
  const subject = subjectTheme(slide.subjectId);
  const breathing = useBreathing(animated);
  const percent = Math.round(slide.progress * 100);
  const action = slide.started ? fr.explorer.explore : fr.explorer.start;
  return (
    <View accessibilityLabel={fr.explorer.progressLabel} style={styles.frame}>
      <View style={styles.board}>
        <Image
          source={WOOD}
          resizeMode="cover"
          accessibilityIgnoresInvertColors
          style={StyleSheet.absoluteFill}
        />
        <View style={styles.bevel} />
        <View style={styles.content}>
          <View style={styles.top}>
            <View
              accessible
              accessibilityLabel={fr.explorer.cities(slide.citiesDone, slide.citiesTotal)}
              style={styles.cities}>
              <Icon name="drapeau" size={18} strokeWidth={2.5} color={HUD.white} />
              <GameText size={21}>
                {fr.explorer.citiesCount(slide.citiesDone, slide.citiesTotal)}
              </GameText>
              <GameText size={13} stroke={2} drop={1} style={styles.citiesWord}>
                {fr.explorer.citiesWord(slide.citiesDone)}
              </GameText>
            </View>
            <View
              accessible
              accessibilityLabel={fr.explorer.stars(slide.stars)}
              style={styles.stars}>
              <Icon name="etoile" variant="fill" size={18} color={HUD.gold.face[1]} />
              <GameText size={17} stroke={2} drop={0}>
                {String(slide.stars)}
              </GameText>
            </View>
          </View>
          <View style={styles.parchment}>
            <Text
              variant="caption"
              weight="bold"
              color={WOOD_COLORS.parchmentInk}
              numberOfLines={2}>
              {nextLabel(slide)}
            </Text>
          </View>
          <View
            accessible
            accessibilityRole="progressbar"
            accessibilityValue={{ min: 0, max: 100, now: percent }}
            style={styles.gauge}>
            {percent > 0 ? (
              <GradientSurface
                gradient={subject.gradient}
                angle={180}
                radius={theme.radius.full}
                style={[styles.gaugeFill, { width: `${percent}%` }]}
              />
            ) : null}
          </View>
          <Animated.View style={breathing}>
            <GameButton
              tone="green"
              size={48}
              label={action}
              accessibilityLabel={action}
              icon="fleche-droite"
              onPress={onExplore}
            />
          </Animated.View>
        </View>
      </View>
      {NAILS.map((corner, i) => (
        <Nail key={i} style={corner} />
      ))}
      <View style={styles.tab}>
        <GradientSurface
          gradient={HUD.panel.tab}
          angle={180}
          radius={theme.radius.full}
          contentStyle={styles.tabFace}>
          <GameText size={13} stroke={2} drop={0}>
            {fr.explorer.questTab}
          </GameText>
        </GradientSurface>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  frame: {
    borderRadius: theme.radius['3xl'] + 4,
    backgroundColor: WOOD_COLORS.frame,
    paddingVertical: 4,
    paddingHorizontal: 4,
    boxShadow: theme.shadow.lg,
  },
  board: { borderRadius: theme.radius['3xl'], overflow: 'hidden' },
  bevel: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    borderRadius: theme.radius['3xl'],
    borderWidth: 2,
    borderColor: WOOD_COLORS.bevel,
  },
  content: {
    gap: theme.space[2],
    paddingTop: theme.space[5],
    paddingBottom: theme.space[3],
    paddingHorizontal: theme.space[4],
  },
  top: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: theme.space[3],
  },
  cities: { flexDirection: 'row', alignItems: 'center', gap: theme.space[2], flexShrink: 1 },
  citiesWord: { flexShrink: 1 },
  stars: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.space[1],
    height: 30,
    paddingHorizontal: theme.space[2],
    borderRadius: theme.radius.full,
    borderWidth: 2,
    borderColor: HUD.gold.depth,
    backgroundColor: WOOD_COLORS.groove,
  },
  parchment: {
    paddingVertical: theme.space[1],
    paddingHorizontal: theme.space[3],
    borderRadius: 10,
    borderWidth: 2,
    borderColor: WOOD_COLORS.parchmentBorder,
    backgroundColor: WOOD_COLORS.parchment,
  },
  gauge: {
    height: 12,
    paddingVertical: 2,
    paddingHorizontal: 2,
    borderRadius: theme.radius.full,
    borderWidth: 2,
    borderColor: HUD.ink,
    backgroundColor: WOOD_COLORS.groove,
  },
  gaugeFill: { height: '100%' },
  nail: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderWidth: 1.5,
    borderColor: WOOD_COLORS.groove,
  },
  tab: {
    position: 'absolute',
    top: -14,
    left: theme.space[5],
    borderRadius: theme.radius.full,
    backgroundColor: HUD.ink,
    paddingVertical: HUD.button.border,
    paddingHorizontal: HUD.button.border,
  },
  tabFace: { height: 24, paddingHorizontal: theme.space[3], justifyContent: 'center' },
});
