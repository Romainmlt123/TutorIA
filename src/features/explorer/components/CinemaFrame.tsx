import { Pressable, StyleSheet } from 'react-native';
import Animated, { interpolate, useAnimatedStyle } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Text } from '@/components/Text';
import { fr } from '@/i18n/fr';
import { explorerArt } from '@/theme/explorerArt';

import type { SharedValue } from 'react-native-reanimated';

type Props = {
  progress: SharedValue<number>;
  active: boolean;
  onSkip: () => void;
};

export function CinemaFrame({ progress, active, onSkip }: Props) {
  const insets = useSafeAreaInsets();
  const pill = useAnimatedStyle(() => ({ opacity: interpolate(progress.value, [0, 1], [0, 1]) }));
  if (!active) return null;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={fr.explorer.skipCinematic}
      onPress={onSkip}
      style={[StyleSheet.absoluteFill, styles.capture]}>
      <Animated.View
        pointerEvents="none"
        style={[
          styles.pill,
          { bottom: insets.bottom + explorerArt.cinematic.pill.bottomGap },
          pill,
        ]}>
        <Text variant="caption" weight="medium" color="textOnColor">
          {fr.explorer.skipCinematic}
        </Text>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  capture: {
    zIndex: explorerArt.cinematic.zIndex,
    elevation: explorerArt.cinematic.zIndex,
  },
  pill: {
    position: 'absolute',
    alignItems: 'center',
    alignSelf: 'center',
    backgroundColor: explorerArt.cinematic.pill.background,
    borderColor: explorerArt.cinematic.pill.border,
    borderWidth: explorerArt.cinematic.pill.borderWidth,
    borderRadius: explorerArt.cinematic.pill.radius,
    paddingHorizontal: explorerArt.cinematic.pill.paddingHorizontal,
    paddingVertical: explorerArt.cinematic.pill.paddingVertical,
  },
});
