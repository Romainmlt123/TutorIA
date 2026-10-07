import { useState } from 'react';
import { View, type LayoutChangeEvent } from 'react-native';

import type { TutorVisual, VisualTone } from '@/services/tutor/visuals';

import { GeoFigure } from './GeoFigure';
import { MathGraph } from './MathGraph';
import { StatChart } from './StatChart';
import { Whiteboard } from './Whiteboard';

/** Hauteur des visuels dessinés en SVG, dans le panneau (le tableau prend la hauteur de son calcul). */
export const VISUAL_HEIGHT = 210;

type Props = {
  visual: TutorVisual;
  /** Hauteur des graphiques, diagrammes et figures ; plus grande en plein écran. */
  height?: number;
  /** Au vocal : couleur que le tuteur vient de nommer (graphique). */
  focus?: VisualTone | null;
  /** Au vocal : lignes du tableau déjà écrites. */
  progress?: number;
};

/** Un visuel du tuteur, à la largeur de son conteneur. */
export function VisualView({ visual, height = VISUAL_HEIGHT, focus = null, progress }: Props) {
  const [width, setWidth] = useState(0);
  const onLayout = (event: LayoutChangeEvent) => setWidth(event.nativeEvent.layout.width);
  // Le tableau prend la hauteur de son calcul, et défile au-delà.
  if (visual.kind === 'board') {
    return <Whiteboard visual={visual} maxHeight={height * 1.3} progress={progress} />;
  }
  return (
    <View onLayout={onLayout}>
      {width > 0 ? (
        visual.kind === 'graph' ? (
          <MathGraph visual={visual} width={width} height={height} focus={focus} />
        ) : visual.kind === 'chart' ? (
          <StatChart visual={visual} width={width} height={height} />
        ) : (
          <GeoFigure visual={visual} width={width} height={height} />
        )
      ) : (
        <View style={{ height }} />
      )}
    </View>
  );
}
