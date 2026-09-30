import type { RefObject } from 'react';
import { StyleSheet, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';

import { fr } from '@/i18n/fr';
import { theme } from '@/theme';

import type { useExplorer } from '../hooks/useExplorer';
import type { IslandSlide } from '../logic/islands';
import { ExplorerHeader } from './ExplorerHeader';
import { GameButton } from './hud/GameButton';
import { GemDots } from './hud/GemDots';
import { IslandBanner } from './hud/IslandBanner';
import { QuestPanel } from './QuestPanel';

type Props = {
  explorer: ReturnType<typeof useExplorer>;
  slides: readonly IslandSlide[];
  index: number;
  onIndex: (index: number) => void;
  /** Geste qui fait tourner l'île. */
  rotate: ReturnType<typeof Gesture.Pan>;
  /** Zone libre de l'île (entre la banderole et les points), mesurée par l'écran. */
  zoneRef: RefObject<View | null>;
  onZoneLayout: () => void;
  animated: boolean;
  onExplore: () => void;
};

/** X1 · les îles : l'en-tête, la banderole de l'île, les flèches, les gemmes et « Ta quête ». */
export function CarouselHud({
  explorer,
  slides,
  index,
  onIndex,
  rotate,
  zoneRef,
  onZoneLayout,
  animated,
  onExplore,
}: Props) {
  const slide = slides[index] ?? slides[0];
  if (!slide) return null;
  const many = slides.length > 1;
  const go = (step: number) => onIndex((index + step + slides.length) % slides.length);
  const name = fr.explorer.islandNames[slide.subjectId];
  return (
    <>
      <ExplorerHeader
        firstName={explorer.firstName}
        streakDays={explorer.streakDays}
        level={explorer.level}
        xp={explorer.xp}
        xpForNextLevel={explorer.xpForNextLevel}
      />
      <GestureDetector gesture={rotate}>
        <View
          accessible
          accessibilityRole={many ? 'adjustable' : undefined}
          aria-roledescription={many ? 'carrousel' : undefined}
          accessibilityLabel={fr.explorer.islandLabel(name)}
          accessibilityHint={fr.explorer.rotateHint}
          accessibilityActions={many ? [{ name: 'increment' }, { name: 'decrement' }] : undefined}
          onAccessibilityAction={(event) =>
            go(event.nativeEvent.actionName === 'increment' ? 1 : -1)
          }
          style={styles.carousel}>
          <View style={styles.pill}>
            <IslandBanner subjectId={slide.subjectId} />
          </View>
          {/* collapsable={false} : sans lui, Android supprime cette vue de mise en page, et sa
              mesure (measureInWindow) n'aboutit jamais. */}
          <View
            ref={zoneRef}
            collapsable={false}
            onLayout={onZoneLayout}
            pointerEvents="box-none"
            style={styles.arrows}>
            {many ? (
              <>
                <GameButton
                  tone="yellow"
                  round
                  size={52}
                  icon="chevron-gauche"
                  accessibilityLabel={fr.explorer.previous}
                  onPress={() => go(-1)}
                />
                <GameButton
                  tone="yellow"
                  round
                  size={52}
                  icon="chevron-droit"
                  accessibilityLabel={fr.explorer.next}
                  onPress={() => go(1)}
                />
              </>
            ) : null}
          </View>
        </View>
      </GestureDetector>
      {many ? (
        <GemDots subjects={slides.map((s) => s.subjectId)} index={index} onSelect={onIndex} />
      ) : null}
      <QuestPanel slide={slide} animated={animated} onExplore={onExplore} />
    </>
  );
}

const styles = StyleSheet.create({
  carousel: { flex: 1, marginTop: theme.space[4] },
  pill: { alignItems: 'center' },
  arrows: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: -theme.space[2],
  },
});
