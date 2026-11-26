import { fireEvent, render, screen } from '@testing-library/react-native';
import { StyleSheet } from 'react-native';

import { fr } from '@/i18n/fr';

import { discFace } from '../../logic/mapMarkers';
import type { MapCity, MapNode, RegionMap } from '../../logic/regionMap';
import type { MapTiles } from '../../tiles';
import { nodeLabel } from './levelMarks';
import { RegionMapMarkers } from './RegionMapMarkers';

jest.mock('../../hooks/mapScrollValue', () => ({
  MAP_SCROLL_X: { value: 0 },
  MAP_SCROLL_Z: { value: 0 },
  MAP_ZOOM: { value: 1 },
}));
// Les étoiles d'un niveau, réduites à un texte : on vérifie lesquelles sont posées.
jest.mock('./NodeStars', () => {
  const { Text: MockText } = jest.requireActual<typeof import('react-native')>('react-native');
  return {
    NodeStars: ({ stars }: { stars: number }) => <MockText>{`étoiles : ${stars}`}</MockText>,
  };
});

const TILES: MapTiles = {
  version: 1,
  regionId: 'essai',
  ppm: 100,
  elevation: 52,
  x0: -2,
  v0: -1,
  width: 400,
  height: 400,
  tile: 400,
  bleed: 1,
  layoutHash: 'essai',
  underlay: { factor: 4, source: 9 },
  tiles: [],
  doneSegments: [],
};

const node = (levelId: string, state: MapNode['state'], stars: MapNode['stars'], x: number) =>
  ({
    levelId,
    cityId: 'ville',
    type: 'lecon',
    title: `Niveau ${levelId}`,
    state,
    stars,
    x,
    z: 0,
    radius: 0.195,
  }) satisfies MapNode;

const CITY: MapCity = {
  id: 'ville',
  name: 'Relatifs',
  monument: 'relatifs',
  status: 'current',
  open: true,
  missing: [],
  recall: undefined,
  center: { x: 0, z: -1 },
  radius: 2,
  levelsDone: 1,
  levelsTotal: 3,
  stars: 2,
};

const MAP: RegionMap = {
  regionId: 'essai',
  nodes: [node('a', 'completed', 2, -1), node('b', 'active', 0, 0), node('c', 'locked', 0, 1)],
  cities: [CITY],
  path: [],
  bounds: { minX: -1, maxX: 1, minZ: -1, maxZ: 1 },
  pawnIndex: 1,
};

async function markers(onNode = jest.fn(), onCity = jest.fn()) {
  await render(
    <RegionMapMarkers
      map={MAP}
      tiles={TILES}
      screen={{ width: 400, height: 800 }}
      avatarLevelId="b"
      onNode={onNode}
      onCity={onCity}
    />,
  );
}

describe('carte pré-rendue : boutons, étoiles et bandeaux', () => {
  it('pose un bouton par niveau avec son libellé, « tu es ici » sur celui de l’avatar', async () => {
    await markers();
    const [a, b, c] = MAP.nodes;
    expect(screen.getByLabelText(nodeLabel(a!))).toBeTruthy();
    expect(screen.getByLabelText(fr.explorer.levelHere(nodeLabel(b!)))).toBeTruthy();
    expect(screen.getByLabelText(nodeLabel(c!))).toBeTruthy();
    expect(fr.explorer.levelHere('Leçon')).toBe('Leçon, tu es ici');
  });

  it('centre le bouton de 48 dp sur le dessus du disque', async () => {
    await markers();
    const button = screen.getByLabelText(nodeLabel(MAP.nodes[0]!));
    const face = discFace(TILES, 100, MAP.nodes[0]!);
    expect(StyleSheet.flatten(button.props.style)).toMatchObject({ width: 48, height: 48 });
    // La vue qui place le bouton dans le contenu de la carte.
    let holder = button.parent;
    while (holder && StyleSheet.flatten(holder.props.style)?.left === undefined) {
      holder = holder.parent;
    }
    expect(StyleSheet.flatten(holder!.props.style)).toMatchObject({
      position: 'absolute',
      left: face.x - 24,
      top: face.y - 24,
    });
  });

  it('pose les étoiles au-dessus des seuls niveaux terminés', async () => {
    await markers();
    expect(screen.getAllByText(/^étoiles/).map((text) => text.props.children)).toEqual([
      'étoiles : 2',
    ]);
  });

  it('ouvre le niveau touché, même fermé (sa fiche dit pourquoi)', async () => {
    const onNode = jest.fn();
    await markers(onNode);
    await fireEvent.press(screen.getByLabelText(nodeLabel(MAP.nodes[2]!)));
    expect(onNode).toHaveBeenCalledWith(MAP.nodes[2]);
  });

  it('annonce la ville et son état, et y mène au toucher', async () => {
    const onCity = jest.fn();
    await markers(jest.fn(), onCity);
    const label = fr.explorer.cityBanner(CITY.name, fr.explorer.cityStatus.current);
    await fireEvent.press(screen.getByLabelText(label));
    expect(onCity).toHaveBeenCalledWith(CITY);
  });
});
