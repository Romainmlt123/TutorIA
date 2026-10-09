import { Image, StyleSheet, useWindowDimensions } from 'react-native';

import type { IslandSlide } from '../logic/islands';
import type { IslandFrame } from '../logic/stageFrame';

// Image Metro, rendue par Blender (npm run explorer:models).
const MATHS_IMAGE = require('../../../../assets/explorer/images/island-maths.webp');

/** Format de l'image rendue par Blender (tools/explorer-3d/lib/bake.py, fallback). */
const IMAGE_ASPECT = 1250 / 900;
/** Dans l'image, l'île occupe 1 / 1,02 de la largeur, et la visée est au centre (bake.py). */
const IMAGE_MARGIN = 1.02;

/**
 * Repli sans 3D (pas de WebGL, ou scène en échec) : l'île en image fixe, à la place et à la taille
 * de l'île 3D. Les îles « Bientôt » n'ont que le ciel.
 */
export function StageFallback({ slide, frame }: { slide: IslandSlide; frame: IslandFrame }) {
  const { width, height } = useWindowDimensions();
  if (slide.subjectId !== 'maths') return null;
  const imageWidth = width * frame.fill * IMAGE_MARGIN;
  const imageHeight = imageWidth * IMAGE_ASPECT;
  return (
    <Image
      source={MATHS_IMAGE}
      accessibilityIgnoresInvertColors
      style={[
        styles.image,
        {
          width: imageWidth,
          height: imageHeight,
          left: (width - imageWidth) / 2,
          top: height * frame.aimY - imageHeight / 2,
        },
      ]}
    />
  );
}

const styles = StyleSheet.create({ image: { position: 'absolute' } });
