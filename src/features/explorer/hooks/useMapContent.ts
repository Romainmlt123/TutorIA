import { useMemo } from 'react';
import { PixelRatio } from 'react-native';
import { useAnimatedStyle } from 'react-native-reanimated';

import {
  dpPerMeter,
  imageScale,
  scrollToContentTranslation,
  snapToPixel,
  tileRect,
  type ScreenSize,
} from '../logic/mapProjection';
import type { MapTiles } from '../tiles';
import { MAP_SCROLL_X, MAP_SCROLL_Z, MAP_ZOOM } from './mapScrollValue';

/**
 * Contenu d'une carte pré-rendue : un plan de la taille de l'image rendue (`area`, en dp), que le fil
 * de l'interface déplace d'après le point suivi (MAP_SCROLL_X/Z) en projection orthographique, comme
 * le rendu de Blender (`mapProjection`). La translation tombe sur un pixel physique : le sol reste net.
 *
 * Le sol (RegionMapWorld) et les boutons (RegionMapMarkers) sont deux vues de ce même plan : même
 * calcul, mêmes valeurs lues dans la même image, donc aucun décalage entre eux pendant un lancer.
 */
export function useMapContent(tiles: MapTiles, screen: ScreenSize) {
  const k = dpPerMeter(screen.width);
  const scale = imageScale(tiles, k);
  const ratio = PixelRatio.get();
  // Ce que lit le fil de l'interface : de petits objets stables, pas la liste des tuiles.
  const origin = useMemo(() => ({ x0: tiles.x0, v0: tiles.v0 }), [tiles.x0, tiles.v0]);
  const size = useMemo(
    () => ({ width: screen.width, height: screen.height }),
    [screen.width, screen.height],
  );
  const area = tileRect({ x: 0, y: 0, width: tiles.width, height: tiles.height }, scale);
  const shift = useAnimatedStyle(() => {
    const zoom = MAP_ZOOM.value;
    const at = scrollToContentTranslation(
      MAP_SCROLL_X.value,
      MAP_SCROLL_Z.value,
      size,
      origin,
      k * zoom,
    );
    return {
      transform: [
        { translateX: snapToPixel(at.translateX - (area.width / 2) * (1 - zoom), ratio) },
        { translateY: snapToPixel(at.translateY - (area.height / 2) * (1 - zoom), ratio) },
        { scale: zoom },
      ],
    };
  });
  return { k, scale, origin, area, shift };
}
