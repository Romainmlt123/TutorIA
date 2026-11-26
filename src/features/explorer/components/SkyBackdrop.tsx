import { StyleSheet } from 'react-native';

import { GradientSurface } from '@/components/GradientSurface';
import { explorerArt } from '@/theme/explorerArt';

const SKY = explorerArt.post.natural.sky;

/**
 * Ciel d'Explorer en dégradé, le même que celui que la scène 3D compose (Hd2dPost) : derrière le
 * Canvas jusqu'à sa première image, ou derrière l'île en image fixe quand il n'y a pas de WebGL.
 */
export function SkyBackdrop() {
  return (
    <GradientSurface
      gradient={{ colors: [SKY.top, SKY.middle, SKY.horizon], locations: [0, 0.55, 1] }}
      angle={180}
      style={StyleSheet.absoluteFill}
    />
  );
}
