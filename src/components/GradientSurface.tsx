import { LinearGradient } from 'expo-linear-gradient';
import type { ReactNode } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { angleToPoints, theme } from '@/theme';

export type GradientColors =
  readonly string[] | { colors: readonly string[]; locations?: readonly number[] };

type Props = {
  gradient: GradientColors;
  /** Angle CSS (160° pour les cartes colorées, 90° pour les barres). */
  angle?: number;
  radius?: number;
  /** Ombre (token), portée par un conteneur extérieur pour ne pas être coupée. */
  shadow?: string;
  /** Style du conteneur extérieur (taille, marges). */
  style?: StyleProp<ViewStyle>;
  /** Style du contenu (padding, gap, alignement). */
  contentStyle?: StyleProp<ViewStyle>;
  children?: ReactNode;
};

/** expo-linear-gradient exige au moins deux valeurs : une couleur seule est dupliquée. */
function toTuple<T>(values: readonly T[]): readonly [T, T, ...T[]] {
  const first = values[0];
  if (first === undefined) throw new Error('Un dégradé demande au moins une couleur.');
  return [first, values[1] ?? first, ...values.slice(2)];
}

/** Surface remplie d'un dégradé ; le contenu (filigrane compris) est rogné aux coins arrondis. */
export function GradientSurface({
  gradient,
  angle = theme.gradientAngle,
  radius = theme.radius['3xl'],
  shadow,
  style,
  contentStyle,
  children,
}: Props) {
  const colors = 'colors' in gradient ? gradient.colors : gradient;
  const locations = 'colors' in gradient ? gradient.locations : undefined;
  const { start, end } = angleToPoints(angle);
  return (
    <View style={[{ borderRadius: radius }, shadow ? { boxShadow: shadow } : null, style]}>
      <View style={[styles.clip, { borderRadius: radius }, contentStyle]}>
        <LinearGradient
          colors={toTuple(colors)}
          locations={locations ? toTuple(locations) : undefined}
          start={start}
          end={end}
          style={StyleSheet.absoluteFill}
        />
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  clip: { flexGrow: 1, overflow: 'hidden' },
});
