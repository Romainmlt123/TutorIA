import { fireEvent, render } from '@testing-library/react-native';

import { logError } from '@/lib/logger';

import type { MapTiles as MapTilesData } from '../../tiles';
import { MapTiles } from './MapTiles';

jest.mock('@/lib/logger', () => ({ logError: jest.fn() }));

/** Trois tuiles de 100 px en ligne, avec 1 px de marge de chaque côté (comme tile_map.py). */
const tile = (col: number) => ({
  col,
  row: 0,
  x: Math.max(col * 100 - 1, 0),
  y: 0,
  width: col === 0 || col === 2 ? 101 : 102,
  height: 100,
  source: col + 1,
});
const TILES: MapTilesData = {
  version: 1,
  regionId: 'essai',
  ppm: 100,
  elevation: 52,
  x0: 0,
  v0: 0,
  width: 300,
  height: 100,
  tile: 100,
  bleed: 1,
  layoutHash: 'essai',
  underlay: { factor: 4, source: 9 },
  tiles: [tile(0), tile(1), tile(2)],
  doneSegments: [],
};

/** Les images montées : la sous-couche d'abord, puis les tuiles dans l'ordre du manifeste. */
async function imagesOf(watched: readonly number[], onReady: () => void, scale = 1) {
  const { container } = await render(
    <MapTiles tiles={TILES} scale={scale} watched={watched} onReady={onReady} />,
  );
  return container.queryAll((node) => node.type === 'Image');
}

describe('sol d’une carte pré-rendue', () => {
  beforeEach(() => jest.mocked(logError).mockClear());

  it('monte la sous-couche puis toutes les tuiles, chacune à sa place, sans fondu', async () => {
    const [underlay, ...tiles] = await imagesOf([], jest.fn(), 0.5);
    expect(underlay!.props.source).toBe(9);
    expect(tiles.map((image) => image.props.source)).toEqual([1, 2, 3]);
    expect(tiles.every((image) => image.props.fadeDuration === 0)).toBe(true);
    // La tuile du milieu commence 1 px avant sa case et déborde de 1 px sur la suivante.
    expect(tiles[1]!.props.style).toEqual([
      { position: 'absolute' },
      { left: 49.5, top: 0, width: 51, height: 50 },
    ]);
  });

  it('est prête une seule fois, quand les tuiles à l’écran sont chargées ou en échec', async () => {
    const onReady = jest.fn();
    const [, first, second, third] = await imagesOf([0, 2], onReady);
    await fireEvent(first!, 'load');
    await fireEvent(second!, 'load');
    expect(onReady).not.toHaveBeenCalled();
    await fireEvent(third!, 'error', { nativeEvent: { error: 'introuvable' } });
    expect(onReady).toHaveBeenCalledTimes(1);
    expect(logError).toHaveBeenCalledWith('explorer.tiles', 'introuvable');
    await fireEvent(first!, 'load');
    expect(onReady).toHaveBeenCalledTimes(1);
  });

  it('est prête tout de suite sans tuile à attendre', async () => {
    const onReady = jest.fn();
    await imagesOf([], onReady);
    expect(onReady).toHaveBeenCalledTimes(1);
  });
});
