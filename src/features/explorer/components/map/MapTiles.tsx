import { memo, useEffect, useRef } from 'react';
import {
  Image,
  StyleSheet,
  type NativeSyntheticEvent,
  type ImageErrorEventData,
} from 'react-native';

import { logError } from '@/lib/logger';

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
 * Le sol d'une carte pré-rendue, dans un contenu de la taille de l'image rendue : la sous-couche
 * (toute l'image en basse résolution, qui bouche les trous le temps qu'une tuile se décode), puis
 * chaque tuile à sa place du rendu. Tout est monté une fois pour toutes : aucun rendu React pendant
 * le défilement, qui suspendrait les animations du fil de l'interface. `fadeDuration={0}` : Android
 * ne fait pas apparaître les tuiles en fondu. Mémoïsé : un rendu de la carte (l'avatar posé dessus
 * qui change) ne repasse pas sur les tuiles.
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
  useEffect(() => {
    if (empty) onReady();
  }, [empty, onReady]);

  return (
    <>
      <Image
        source={tiles.underlay.source}
        fadeDuration={0}
        resizeMethod="scale"
        resizeMode="stretch"
        onError={onTileError}
        style={StyleSheet.absoluteFill}
      />
      {tiles.tiles.map((tile, index) => (
        <Image
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
          style={[styles.image, tileRect(tile, scale)]}
        />
      ))}
    </>
  );
});

const styles = StyleSheet.create({
  image: { position: 'absolute' },
});
