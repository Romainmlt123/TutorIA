import { StyleSheet, View } from 'react-native';
import Animated from 'react-native-reanimated';

import { theme } from '@/theme';

import { GradientSurface } from './GradientSurface';

type Props = {
  /** Avancement de 0 à 1. */
  value: number;
  height?: 6 | 8 | 12;
  trackColor: string;
  /** Couleur unie ou dégradé horizontal. */
  fill: string | readonly string[];
  /** Transition de la largeur (ms), par exemple 400 pour la session de flashcards. */
  animationMs?: number;
  /** Libellé pour les lecteurs d'écran ; sans libellé, la barre est décorative. */
  accessibilityLabel?: string;
};

export function ProgressBar({
  value,
  height = 8,
  trackColor,
  fill,
  animationMs,
  accessibilityLabel,
}: Props) {
  const percent = Math.round(Math.min(1, Math.max(0, value)) * 100);
  const radius = theme.radius.full;
  return (
    <View
      accessible={Boolean(accessibilityLabel)}
      accessibilityRole={accessibilityLabel ? 'progressbar' : undefined}
      accessibilityLabel={accessibilityLabel}
      accessibilityValue={accessibilityLabel ? { min: 0, max: 100, now: percent } : undefined}
      importantForAccessibility={accessibilityLabel ? 'auto' : 'no-hide-descendants'}
      style={[styles.track, { height, borderRadius: radius, backgroundColor: trackColor }]}>
      <Animated.View
        style={[
          styles.fill,
          { width: `${percent}%`, borderRadius: radius },
          typeof fill === 'string' ? { backgroundColor: fill } : null,
          animationMs
            ? {
                transitionProperty: 'width',
                transitionDuration: animationMs,
                transitionTimingFunction: 'ease',
              }
            : null,
        ]}>
        {typeof fill === 'string' ? null : (
          <GradientSurface
            gradient={fill}
            angle={90}
            radius={radius}
            style={StyleSheet.absoluteFill}
          />
        )}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  track: { overflow: 'hidden', width: '100%' },
  fill: { height: '100%', overflow: 'hidden' },
});
