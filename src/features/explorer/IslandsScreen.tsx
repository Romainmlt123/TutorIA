import { useRouter } from 'expo-router';
import { useRef, useState, useSyncExternalStore } from 'react';
import { Platform, StyleSheet, useWindowDimensions, View } from 'react-native';
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';
import { useReducedMotion } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { GradientSurface } from '@/components/GradientSurface';
import { useBottomNavLayout } from '@/components/navigation/useBottomNavLayout';
import { fr } from '@/i18n/fr';
import { theme } from '@/theme';
import { explorerArt } from '@/theme/explorerArt';

import { ExplorerHeader } from './components/ExplorerHeader';
import { GameButton } from './components/hud/GameButton';
import { GemDots } from './components/hud/GemDots';
import { IslandBanner } from './components/hud/IslandBanner';
import { IslandStage } from './components/IslandStage';
import { QuestPanel } from './components/QuestPanel';
import { StageFallback } from './components/StageFallback';
import { SceneBoundary } from './hd2d/SceneBoundary';
import { canUseWebGL } from './hd2d/webgl';
import { useExplorer } from './hooks/useExplorer';
import { useSceneActive } from './hooks/useSceneActive';
import { stepIndex } from './logic/islands';
import { beginDrag, createOrbit, drag, release } from './logic/orbit';
import { DEFAULT_FRAME, frameFor } from './logic/stageFrame';

const SKY = explorerArt.post.natural.sky;
const noSubscription = () => () => undefined;
/**
 * Rotation de l'île au doigt : modifiée par le geste, lue à chaque image par la caméra
 * (IslandStage). Un objet de module, comme l'horloge de l'eau, et non une ref React.
 */
const STAGE_ORBIT = createOrbit();

/**
 * X1 · Les îles : l'onglet Explorer. L'île choisie flotte dans le ciel, en 3D, au-dessus de sa
 * carte de progression ; on change d'île par les flèches, les points ou en glissant. Sans WebGL,
 * ou si la scène échoue, une image fixe la remplace.
 */
export function IslandsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { clearance } = useBottomNavLayout();
  const { firstName, streakDays, level, xp, xpForNextLevel, slides: all } = useExplorer();
  // Pour l'instant, seules les îles déjà construites en 3D sont proposées (les Maths).
  const slides = all.filter((s) => s.available);
  const many = slides.length > 1;
  const [index, setIndex] = useState(0);
  const screen = useWindowDimensions();
  const zoneRef = useRef<View>(null);
  const [frame, setFrame] = useState(DEFAULT_FRAME);
  // La zone de l'île (entre la pastille et les points) est mesurée dans la fenêtre : l'île s'y
  // cadre quels que soient l'écran, la zone sûre et la taille du texte.
  const measureZone = () =>
    zoneRef.current?.measureInWindow((_x, y, _width, zoneHeight) =>
      setFrame(frameFor({ top: y, height: zoneHeight }, screen)),
    );
  const active = useSceneActive();
  const animated = !useReducedMotion();
  // Faux au rendu serveur (web) : pas de WebGL côté serveur, pas de décalage à l'hydratation.
  const webgl = useSyncExternalStore(noSubscription, canUseWebGL, () => false);

  const slide = slides[index] ?? slides[0];
  if (!slide) return null;
  const go = (step: number) => setIndex((i) => stepIndex(i, step, slides.length));
  // Glisser le doigt fait tourner l'île (on change d'île avec les flèches).
  const rotate = Gesture.Pan()
    .runOnJS(true)
    .activeOffsetX([-8, 8])
    .onBegin(() => beginDrag(STAGE_ORBIT))
    .onUpdate((event) => drag(STAGE_ORBIT, event.translationX))
    .onFinalize((event) => release(STAGE_ORBIT, event.velocityX, animated));
  const name = fr.explorer.islandNames[slide.subjectId];

  return (
    <GestureHandlerRootView style={styles.screen}>
      <GradientSurface
        gradient={{ colors: [SKY.top, SKY.middle, SKY.horizon], locations: [0, 0.55, 1] }}
        angle={180}
        style={StyleSheet.absoluteFill}
      />
      {webgl ? (
        <SceneBoundary fallback={<StageFallback slide={slide} frame={frame} />}>
          <IslandStage
            slides={slides}
            index={index}
            frame={frame}
            orbit={STAGE_ORBIT}
            active={active}
            animated={animated}
          />
        </SceneBoundary>
      ) : (
        <StageFallback slide={slide} frame={frame} />
      )}
      <View
        pointerEvents="box-none"
        style={[
          styles.content,
          {
            paddingTop: Platform.OS === 'web' ? 56 : insets.top + theme.layout.screenTopGap,
            paddingBottom: clearance,
          },
        ]}>
        <ExplorerHeader
          firstName={firstName}
          streakDays={streakDays}
          level={level}
          xp={xp}
          xpForNextLevel={xpForNextLevel}
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
              onLayout={measureZone}
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
          <GemDots subjects={slides.map((s) => s.subjectId)} index={index} onSelect={setIndex} />
        ) : null}
        <QuestPanel
          slide={slide}
          animated={animated}
          onExplore={() => router.push({ pathname: '/bientot', params: { sujet: 'carte' } })}
        />
      </View>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: theme.colors.bg },
  content: {
    flex: 1,
    paddingHorizontal: theme.layout.screenPadding,
    gap: theme.space[2],
  },
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
