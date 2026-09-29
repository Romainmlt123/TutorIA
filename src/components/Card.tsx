import type { ReactNode } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { theme } from '@/theme';

type Props = {
  children?: ReactNode;
  /** 16 px pour les cartes, 24 px pour les grandes cartes. */
  padding?: number;
  radius?: '2xl' | '3xl';
  elevation?: 'sm' | 'md' | 'lg' | 'none';
  /** Rogne le contenu (décor, liseré) : l'ombre passe alors par un conteneur extérieur. */
  clip?: boolean;
  style?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
};

/**
 * Carte blanche posée sur le fond, avec une ombre douce.
 * Marges en `paddingVertical` / `paddingHorizontal` : sur le web, le raccourci `padding`
 * écraserait les marges plus précises passées par `style`.
 */
export function Card({
  children,
  padding = theme.space[4],
  radius = '2xl',
  elevation = 'md',
  clip = false,
  style,
  accessibilityLabel,
}: Props) {
  const borderRadius = theme.radius[radius];
  const boxShadow = elevation === 'none' ? undefined : theme.shadow[elevation];
  if (!clip) {
    return (
      <View
        accessibilityLabel={accessibilityLabel}
        style={[
          styles.card,
          { borderRadius, paddingVertical: padding, paddingHorizontal: padding, boxShadow },
          style,
        ]}>
        {children}
      </View>
    );
  }
  return (
    <View accessibilityLabel={accessibilityLabel} style={{ borderRadius, boxShadow }}>
      <View
        style={[
          styles.card,
          styles.clip,
          { borderRadius, paddingVertical: padding, paddingHorizontal: padding },
          style,
        ]}>
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: theme.colors.surface },
  clip: { overflow: 'hidden' },
});
