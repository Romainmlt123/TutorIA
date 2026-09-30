import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import { Icon } from '@/components/Icon';
import { fr } from '@/i18n/fr';
import { subjectTheme, theme } from '@/theme';
import { explorerArt } from '@/theme/explorerArt';

import type { IslandSlide } from '../logic/islands';
import { GameButton } from './hud/GameButton';
import { GameText } from './hud/GameText';
import { Parchment, StarChip, WoodFrame, WoodGauge } from './hud/WoodFrame';

const HUD = explorerArt.hud;

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

/**
 * Panneau de quête en bois (X1) : villes validées, étoiles, prochaine étape sur une étiquette de
 * parchemin, jauge creusée dans le bois et gros bouton de jeu.
 */
export function QuestPanel({ slide, animated, onExplore }: Props) {
  const subject = subjectTheme(slide.subjectId);
  const breathing = useBreathing(animated);
  const action = slide.started ? fr.explorer.explore : fr.explorer.start;
  return (
    <WoodFrame tab={fr.explorer.questTab} accessibilityLabel={fr.explorer.progressLabel}>
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
        <StarChip stars={slide.stars} label={fr.explorer.stars(slide.stars)} />
      </View>
      <Parchment>{nextLabel(slide)}</Parchment>
      <WoodGauge percent={Math.round(slide.progress * 100)} gradient={subject.gradient} />
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
  cities: { flexDirection: 'row', alignItems: 'center', gap: theme.space[2], flexShrink: 1 },
  citiesWord: { flexShrink: 1 },
});
