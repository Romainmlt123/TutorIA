import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  cancelAnimation,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

import { Icon } from '@/components/Icon';
import { PressableBase } from '@/components/PressableBase';
import { Text } from '@/components/Text';
import { fr } from '@/i18n/fr';
import { theme } from '@/theme';

const T = fr.tutor.call;

type Props = { elapsed: string; live: boolean; onWritten: () => void };

/** Haut de l'appel (CallTopBar) : « Écrit » à gauche, chrono et point qui clignote à droite. */
export function CallTopBar({ elapsed, live, onWritten }: Props) {
  const reduceMotion = useReducedMotion();
  const blink = useSharedValue(1);
  useEffect(() => {
    if (!live || reduceMotion) {
      cancelAnimation(blink);
      blink.value = 1;
      return;
    }
    blink.value = withRepeat(withTiming(0.3, { duration: 700 }), -1, true);
    return () => cancelAnimation(blink);
  }, [blink, live, reduceMotion]);
  const dot = useAnimatedStyle(() => ({ opacity: blink.value }));

  return (
    <View style={styles.row}>
      <PressableBase
        onPress={onWritten}
        accessibilityRole="button"
        accessibilityLabel={T.writtenLabel}
        hitSlop={2}
        style={({ pressed }) => [styles.written, pressed && styles.pressed]}>
        <Icon name="clavier" size={20} color={theme.colors.textOnColor} />
        <Text variant="label" weight="bold" color="textOnColor">
          {T.written}
        </Text>
      </PressableBase>
      <View accessible accessibilityLabel={T.timerLabel(elapsed)} style={styles.timer}>
        <Animated.View style={[styles.dot, dot]} />
        <Text variant="label" weight="bold" color="textOnColor" style={styles.digits}>
          {elapsed}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    height: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  written: {
    height: 44,
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.space[2],
    paddingLeft: theme.space[3],
    paddingRight: theme.space[4],
    borderRadius: theme.radius.full,
    backgroundColor: theme.voiceCall.glass,
  },
  pressed: { opacity: 0.8 },
  timer: {
    height: 32,
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.space[2],
    paddingHorizontal: theme.space[3],
    borderRadius: theme.radius.full,
    backgroundColor: theme.voiceCall.glass,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: theme.radius.full,
    backgroundColor: theme.colors.textOnColor,
  },
  digits: { fontVariant: ['tabular-nums'] },
});
