import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  cancelAnimation,
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

import { Pill } from '@/components/Pill';
import { ProgressRing } from '@/components/ProgressRing';
import { Text } from '@/components/Text';
import { Watermark } from '@/components/Watermark';
import { fr } from '@/i18n/fr';
import { useSceneActive } from '@/lib/three/useSceneActive';
import { angleToPoints, extras, theme } from '@/theme';

import { goalProgress } from '../logic/home';

type Props = { minutes: number; sessionsDone: number; sessionsTarget: number };

/** Durée d'un aller du dégradé : assez lente pour rester discrète. */
const SWEEP_MS = 6000;

const [violet, blue] = theme.goal.gradient.colors;
const { start, end } = angleToPoints(theme.gradientAngle);

/**
 * Fond animé : un dégradé violet → bleu → violet deux fois plus large que la carte, qui glisse
 * d'un bout à l'autre puis revient. Figé si l'élève a demandé moins d'animations, en pause hors
 * de l'écran ou quand l'app est en arrière-plan.
 */
function AnimatedGoalBackground() {
  const [width, setWidth] = useState(0);
  const reduceMotion = useReducedMotion();
  const active = useSceneActive();
  const progress = useSharedValue(0);

  useEffect(() => {
    if (reduceMotion || !active) {
      cancelAnimation(progress);
      return;
    }
    progress.value = withRepeat(
      withTiming(1, { duration: SWEEP_MS, easing: Easing.inOut(Easing.sin) }),
      -1,
      true,
    );
    return () => cancelAnimation(progress);
  }, [active, reduceMotion, progress]);

  const sweep = useAnimatedStyle(() => ({ transform: [{ translateX: -progress.value * width }] }));

  return (
    <View
      style={StyleSheet.absoluteFill}
      onLayout={(event) => setWidth(event.nativeEvent.layout.width)}>
      <Animated.View style={[styles.strip, { width: width * 2 }, sweep]}>
        <LinearGradient
          colors={[violet, blue, violet]}
          start={start}
          end={end}
          style={StyleSheet.absoluteFill}
        />
      </Animated.View>
    </View>
  );
}

/** Objectif du jour (v2.5) : carte en dégradé violet → bleu animé, anneau blanc, encouragement. */
export function GoalCard({ minutes, sessionsDone, sessionsTarget }: Props) {
  return (
    <View accessible accessibilityLabel={fr.home.goalSection} style={styles.shadow}>
      <View style={styles.card}>
        <AnimatedGoalBackground />
        <Watermark icon="cible" size={120} offset={-30} opacity={extras.watermarkOpacity.goal} />
        <ProgressRing
          value={goalProgress(sessionsDone, sessionsTarget)}
          label={`${sessionsDone}/${sessionsTarget}`}
          size={64}
          strokeWidth={7}
          labelVariant="body"
          onColor
        />
        <View style={styles.texts}>
          <Text variant="h3" weight="black" color="textOnColor">
            {fr.home.goalTitle}
          </Text>
          <Text variant="bodySm" weight="medium" color="textOnColor">
            {fr.home.goalDetail(minutes, sessionsDone, sessionsTarget)}
          </Text>
          <Pill
            label={fr.home.goalRemaining(sessionsTarget - sessionsDone)}
            backgroundColor={theme.colors.surface}
            color={blue}
            style={styles.pill}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  shadow: { borderRadius: theme.radius['3xl'], boxShadow: theme.shadow.md },
  card: {
    overflow: 'hidden',
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.space[4],
    paddingVertical: theme.space[5],
    paddingHorizontal: theme.space[5],
    borderRadius: theme.radius['3xl'],
    backgroundColor: violet,
  },
  strip: { position: 'absolute', top: 0, bottom: 0, left: 0 },
  texts: { flex: 1, alignItems: 'flex-start', gap: 2 },
  pill: { marginTop: theme.space[2] },
});
