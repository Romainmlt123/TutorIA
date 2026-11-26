import { StyleSheet } from 'react-native';
import Animated, { useAnimatedStyle } from 'react-native-reanimated';

import type { CelebrationMoment } from '../../hooks/useMapCelebration';
import { segmentReveal } from '../../logic/juice';
import { tileRect } from '../../logic/mapProjection';
import type { DoneSegment } from '../../tiles';
import { onTileError } from './MapTiles';

type Point = { x: number; y: number };

type Props = {
  segment: DoneSegment;
  /** dp par pixel du rendu (`imageScale`). */
  scale: number;
  /** Pieds des niveaux que relie le tronçon (dp du contenu) : les planches se posent de l'un vers l'autre. */
  from: Point;
  to: Point;
  moment: CelebrationMoment;
};

/**
 * Tronçon miel du chemin qui vient d'être parcouru, dévoilé du niveau terminé vers le suivant pendant
 * la célébration, comme des planches que l'on pose. Le dévoilement suit l'axe où le tronçon s'étend
 * le plus : une fenêtre qui rogne (`overflow: hidden`) glisse sur l'image, qui glisse en sens inverse
 * et reste donc à sa place. Seules des translations, sur le fil de l'interface.
 */
export function RevealSegment({ segment, scale, from, to, moment }: Props) {
  const rect = tileRect(segment, scale);
  const horizontal = Math.abs(to.x - from.x) >= Math.abs(to.y - from.y);
  const forward = (horizontal ? to.x - from.x : to.y - from.y) >= 0 ? 1 : -1;
  const span = horizontal ? rect.width : rect.height;
  const window = useAnimatedStyle(() => {
    const hidden = (1 - segmentReveal(moment.clock.get() - moment.at)) * span * forward;
    return { transform: [horizontal ? { translateX: -hidden } : { translateY: -hidden }] };
  });
  const image = useAnimatedStyle(() => {
    const hidden = (1 - segmentReveal(moment.clock.get() - moment.at)) * span * forward;
    return { transform: [horizontal ? { translateX: hidden } : { translateY: hidden }] };
  });
  return (
    <Animated.View style={[styles.window, rect, window]}>
      <Animated.Image
        source={segment.source}
        fadeDuration={0}
        resizeMethod="scale"
        resizeMode="stretch"
        onError={onTileError}
        style={[styles.image, { width: rect.width, height: rect.height }, image]}
      />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  window: { position: 'absolute', overflow: 'hidden' },
  image: { position: 'absolute', left: 0, top: 0 },
});
