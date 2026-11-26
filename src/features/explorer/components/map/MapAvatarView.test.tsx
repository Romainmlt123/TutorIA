import { render } from '@testing-library/react-native';
import { PixelRatio, StyleSheet } from 'react-native';

import { DEFAULT_LOOK } from '@/features/avatar/logic/avatarLook';

import { islandOf } from '../../content';
import { avatarFrame } from '../../logic/avatarFrame';
import { dpPerMeter, snapToPixel, worldToContentDp } from '../../logic/mapProjection';
import { buildRegionMap } from '../../logic/regionMap';
import { SEEN_LEVEL } from '../../stylized3d/avatarChoreo';
import { MapAvatarView } from './MapAvatarView';

/** La vue 3D est remplacée par une figurine qui se montre dès son montage. */
jest.mock('../../stylized3d/MapAvatarCanvas', () => {
  const { useEffect } = jest.requireActual<typeof import('react')>('react');
  return {
    MapAvatarCanvas: ({ onShown }: { onShown: () => void }) => {
      useEffect(() => onShown(), [onShown]);
      return null;
    },
  };
});
jest.mock('@/lib/three/useSceneKey', () => ({ useSceneKey: () => 0 }));

const map = buildRegionMap(islandOf('maths')!, 'maths-nombres', new Map())!;
const ORIGIN = { x0: -20, v0: -9 };
const SCREEN = { width: 400, height: 800 };

async function avatarOn(levelId: string, onArrive = jest.fn()) {
  const { container } = await render(
    <MapAvatarView
      map={map}
      tiles={ORIGIN}
      screen={SCREEN}
      look={DEFAULT_LOOK}
      levelId={levelId}
      quick={false}
      active
      animated
      onArrive={onArrive}
    />,
  );
  return container;
}

beforeEach(() => SEEN_LEVEL.clear());

describe('avatar sur la carte pré-rendue', () => {
  it('pose sa vue sur son niveau, les pieds sur le point du sol, au pixel près', async () => {
    const node = map.nodes[3]!;
    const container = await avatarOn(node.levelId);
    const k = dpPerMeter(SCREEN.width);
    const ratio = PixelRatio.get();
    const frame = avatarFrame(k, ratio);
    const feet = worldToContentDp(ORIGIN, k, node.x, node.z, 0);
    const [view] = container.queryAll(
      (n) =>
        n.props.pointerEvents === 'none' &&
        StyleSheet.flatten(n.props.style)?.width === frame.width,
    );
    expect(StyleSheet.flatten(view!.props.style)).toMatchObject({
      height: frame.height,
      transform: [
        { translateX: snapToPixel(feet.x, ratio) + frame.left },
        { translateY: snapToPixel(feet.y, ratio) + frame.top },
      ],
    });
  });

  it('annonce son arrivée sur son niveau une fois la figurine montrée', async () => {
    const onArrive = jest.fn();
    await avatarOn(map.nodes[1]!.levelId, onArrive);
    expect(onArrive).toHaveBeenCalledWith(map.nodes[1]!.levelId);
  });
});
