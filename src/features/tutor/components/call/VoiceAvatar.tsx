import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  cancelAnimation,
  Easing,
  useAnimatedStyle,
  useDerivedValue,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withTiming,
  type SharedValue,
} from 'react-native-reanimated';

import { Logo } from '@/components/Logo';
import { PressableBase } from '@/components/PressableBase';
import { fr } from '@/i18n/fr';
import { extras, theme } from '@/theme';

import type { CallState } from '../../logic/callState';

const A = theme.voiceCall.avatar;
/** Lissage du niveau de la voix, comme dans les maquettes. */
const LEVEL_SMOOTHING_MS = 160;
/** Sans mesure du niveau, le tuteur garde un petit rebond tant qu'il parle. */
const MIN_SPEAKING_LEVEL = 0.15;
/** Appui long : signaler la réponse du tuteur. */
const REPORT_DELAY_MS = 600;
/** Apparition et disparition des halos quand le tuteur prend ou rend la parole. */
const HALO_FADE_MS = 400;

type Props = {
  state: CallState;
  /** Niveau de la voix du tuteur, de 0 à 1 (valeur partagée, sans rendu React). */
  level: SharedValue<number>;
  /** 148 sans visuel, 96 quand un visuel occupe le haut (2D, 2F). */
  compact?: boolean;
  onInterrupt: () => void;
  onReport: () => void;
};

/**
 * Le logo du tuteur (VoiceAvatar, v2.6) : il rebondit au niveau de sa voix et se pose aux pauses,
 * penche la tête quand l'élève a la parole, respire au repos. Le toucher interrompt le tuteur ;
 * l'appui long signale sa réponse. Tout s'arrête si l'élève a demandé moins d'animations.
 */
export function VoiceAvatar({ state, level, compact = false, onInterrupt, onReport }: Props) {
  const size = compact ? A.compactSize : A.size;
  const hop = compact ? A.compactHop : A.hop;
  const reduceMotion = useReducedMotion();
  const speaking = state === 'speaking';
  const listening = state === 'listening';

  const phase = useSharedValue(0);
  const breath = useSharedValue(0);
  const tilt = useSharedValue(0);
  const smooth = useDerivedValue(
    () =>
      withTiming(speaking ? Math.max(level.value, MIN_SPEAKING_LEVEL) : 0, {
        duration: LEVEL_SMOOTHING_MS,
      }),
    [speaking],
  );
  // Les halos sont centrés sur le logo.
  const center = hop + size / 2;

  useEffect(() => {
    if (reduceMotion) {
      cancelAnimation(phase);
      cancelAnimation(breath);
      tilt.set(0);
      return;
    }
    phase.value = 0;
    phase.value = withRepeat(
      withTiming(1, { duration: A.cycleMs, easing: Easing.linear }),
      -1,
      false,
    );
    breath.value = withRepeat(
      withTiming(1, { duration: A.breathMs / 2, easing: Easing.inOut(Easing.sin) }),
      -1,
      true,
    );
    return () => {
      cancelAnimation(phase);
      cancelAnimation(breath);
    };
  }, [breath, phase, reduceMotion, tilt]);

  useEffect(() => {
    if (reduceMotion) return;
    tilt.set(withTiming(listening ? 1 : 0, { duration: 500 }));
  }, [listening, reduceMotion, tilt]);

  const body = useAnimatedStyle(() => {
    if (reduceMotion) return {};
    // Hauteur du saut : demi-sinus sur chaque cycle, proportionnelle au niveau de la voix.
    const air = Math.sin(Math.PI * phase.value);
    const jump = smooth.value * hop * air;
    const onGround = smooth.value > 0.01 ? 1 - air : 0;
    const resting = smooth.value <= 0.01 && tilt.value < 0.01;
    const breathe = resting ? 1 + 0.025 * breath.value : 1;
    return {
      transform: [
        { translateY: -jump - 3 * tilt.value },
        { rotate: `${A.tilt * tilt.value}deg` },
        { scaleX: breathe * (1 + A.squash * 0.5 * onGround * smooth.value) },
        { scaleY: breathe * (1 - A.squash * onGround * smooth.value + 0.03 * air * smooth.value) },
      ],
    };
  });

  // Les halos (les « ondes ») n'apparaissent que quand le tuteur parle, et respirent avec sa voix.
  const halo = useDerivedValue(
    () => withTiming(speaking ? 1 : 0, { duration: HALO_FADE_MS }),
    [speaking],
  );
  const halos = useAnimatedStyle(() => ({
    opacity: halo.value,
    transform: [{ scale: reduceMotion ? 1 : 0.92 + 0.08 * halo.value + 0.06 * smooth.value }],
  }));

  const ground = useAnimatedStyle(() => {
    if (reduceMotion) return {};
    const air = Math.sin(Math.PI * phase.value) * smooth.value;
    return { opacity: 1 - 0.5 * air, transform: [{ scaleX: 1 - 0.32 * air }] };
  });

  return (
    <View style={[styles.stage, { width: size * 1.9, height: size + hop + 24 }]}>
      <Animated.View
        aria-hidden
        style={[
          styles.halos,
          { width: size * 1.9, height: size * 1.9, top: center - size * 0.95 },
          halos,
        ]}>
        <View
          style={[
            styles.halo,
            { width: size * 1.9, height: size * 1.9, backgroundColor: extras.call.halo[1] },
          ]}
        />
        <View
          style={[
            styles.halo,
            { width: size * 1.4, height: size * 1.4, backgroundColor: extras.call.halo[0] },
          ]}
        />
      </Animated.View>
      <Animated.View
        aria-hidden
        style={[styles.ground, { width: size * 0.82, top: hop + size + 6 }, ground]}
      />
      <Animated.View style={[{ marginTop: hop }, body]}>
        <PressableBase
          onPress={speaking ? onInterrupt : undefined}
          onLongPress={onReport}
          delayLongPress={REPORT_DELAY_MS}
          accessibilityRole="button"
          accessibilityLabel={
            speaking ? fr.tutor.call.avatarInterrupt : fr.tutor.call.avatarListening
          }
          accessibilityHint={fr.tutor.reportHint}
          style={[styles.disc, { width: size, height: size, boxShadow: extras.call.avatarShadow }]}>
          <Logo variant="onWhite" size={size * 0.82} borderRadius={(size * 0.82) / 2} />
        </PressableBase>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  stage: { alignItems: 'center' },
  halos: {
    position: 'absolute',
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
  },
  halo: { position: 'absolute', borderRadius: theme.radius.full },
  ground: {
    position: 'absolute',
    height: 14,
    borderRadius: theme.radius.full,
    backgroundColor: extras.call.ground,
  },
  disc: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: theme.radius.full,
    backgroundColor: theme.colors.surface,
    overflow: 'hidden',
  },
});
