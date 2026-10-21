import { useMemo } from 'react';
import { StyleSheet, useWindowDimensions } from 'react-native';
import Animated, { interpolate, useAnimatedStyle, type SharedValue } from 'react-native-reanimated';

import { explorerArt } from '@/theme/explorerArt';

import { WIND_CYCLES, windIntensity, windStreaks, type WindStreak } from '../logic/wind';

type Props = { progress: SharedValue<number> };

function WindLine({
  progress,
  streak,
  width,
  height,
}: {
  progress: SharedValue<number>;
  streak: WindStreak;
  width: number;
  height: number;
}) {
  const style = useAnimatedStyle(() => {
    const intensity = windIntensity(progress.value);
    const position = (streak.phase + progress.value * streak.speed * WIND_CYCLES) % 1;
    const radiusFraction = streak.startRadius + position * (1 - streak.startRadius);
    const radius = radiusFraction * Math.hypot(width, height) * 0.52;
    const length = width * streak.length * (0.35 + intensity * 0.65);
    const centerFade = interpolate(radiusFraction, [0.05, 0.24], [0, 1]);
    const edgeFade = interpolate(radiusFraction, [0.85, 1], [1, 0]);
    return {
      left: width / 2 + Math.cos(streak.angle) * radius - length / 2,
      top: height / 2 + Math.sin(streak.angle) * radius - streak.width / 2,
      width: length,
      height: streak.width,
      opacity: intensity * centerFade * edgeFade,
      transform: [{ rotate: `${streak.angle}rad` }],
    };
  });
  return (
    <Animated.View
      pointerEvents="none"
      style={[styles.streak, { backgroundColor: explorerArt.wind.streak }, style]}
    />
  );
}

export function WindStreaks({ progress }: Props) {
  const { width, height } = useWindowDimensions();
  const streaks = useMemo(() => windStreaks(0x57494e44), []);
  return (
    <Animated.View pointerEvents="none" style={[styles.layer, { width, height }]}>
      {streaks.map((streak, index) => (
        <WindLine key={index} progress={progress} streak={streak} width={width} height={height} />
      ))}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  layer: { position: 'absolute', top: 0, left: 0, overflow: 'hidden' },
  streak: { position: 'absolute', borderRadius: explorerArt.wind.radius },
});
