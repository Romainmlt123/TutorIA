import { memo, useEffect, useRef } from 'react';
import {
  Image,
  StyleSheet,
  type NativeSyntheticEvent,
  type ImageErrorEventData,
} from 'react-native';
import Animated, { useAnimatedStyle } from 'react-native-reanimated';

import { logError } from '@/lib/logger';

import { MAP_ZOOM } from '../../hooks/mapScrollValue';
import { tileRect } from '../../logic/mapProjection';
import type { MapTiles as MapTilesData } from '../../tiles';

type Props = {
  tiles: MapTilesData;
  /** dp par pixel du rendu (`imageScale`). */
  scale: number;
  /** Rangs des tuiles à l'écran à l'ouverture : la carte est prête quand elles sont chargées. */
  watched: readonly number[];
  /** Appelée une fois, quand les tuiles de `watched` sont chargées (ou en échec). */
  onReady: () => void;
};

/** Image du rendu introuvable (tuile, sous-couche, tronçon du chemin) : la sous-couche reste dessous. */
export const onTileError = (event: NativeSyntheticEvent<ImageErrorEventData>) =>
  logError('explorer.tiles', event.nativeEvent.error);

/**
 * Le sol d'une carte pré-rendue : contexte complet, sous-couche, puis tuiles à leur place du rendu.
 * Tout est monté une fois pour toutes : aucun rendu React pendant le défilement, qui suspendrait les
 * animations du fil de l'interface. `fadeDuration={0}` : Android ne fait pas apparaître les tuiles
 * en fondu. Mémoïsé : un rendu de la carte (l'avatar posé dessus qui change) ne repasse pas sur le sol.
 */
export const MapTiles = memo(function MapTiles({ tiles, scale, watched, onReady }: Props) {
  // Tuiles à l'écran pas encore chargées (créé au premier chargement).
  const waiting = useRef<Set<number> | null>(null);
  const settle = (index: number) => {
    waiting.current ??= new Set(watched);
    if (waiting.current.delete(index) && waiting.current.size === 0) onReady();
  };
  // Aucune tuile à attendre (l'écran ne montre que du ciel) : la carte est prête tout de suite.
  const empty = watched.length === 0;
  const tileVisibility = useAnimatedStyle(() => ({
    opacity: MAP_ZOOM.value < 0.45 ? 0 : 1,
  }));
  useEffect(() => {
    if (empty) onReady();
  }, [empty, onReady]);

  return (
    <>
      {tiles.context ? (
        <Image
          source={tiles.context.source}
          fadeDuration={0}
          resizeMethod="scale"
          resizeMode="stretch"
          onError={onTileError}
          style={[
            styles.image,
            tileRect(
              {
                x: (tiles.context.x0 - tiles.x0) * tiles.ppm,
                y: (tiles.context.v0 - tiles.v0) * tiles.ppm,
                width: (tiles.context.width * tiles.ppm) / tiles.context.ppm,
                height: (tiles.context.height * tiles.ppm) / tiles.context.ppm,
              },
              scale,
            ),
          ]}
        />
      ) : null}
      <Image
        source={tiles.underlay.source}
        fadeDuration={0}
        resizeMethod="scale"
        resizeMode="stretch"
        onError={onTileError}
        style={[
          styles.image,
          tileRect({ x: 0, y: 0, width: tiles.width, height: tiles.height }, scale),
        ]}
      />
      {tiles.tiles.map((tile, index) => (
        <Animated.Image
          key={`${tile.col}-${tile.row}`}
          source={tile.source}
          fadeDuration={0}
          resizeMethod="scale"
          resizeMode="stretch"
          onLoad={() => settle(index)}
          onError={(event) => {
            onTileError(event);
            settle(index);
          }}
          style={[styles.image, tileRect(tile, scale), tileVisibility]}
        />
      ))}
    </>
  );
});

const styles = StyleSheet.create({
  image: { position: 'absolute' },
});
