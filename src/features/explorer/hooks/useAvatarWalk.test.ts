import { renderHook } from '@testing-library/react-native';

import { islandOf } from '../content';
import { walkRoute } from '../logic/avatarWalk';
import { buildRegionMap } from '../logic/regionMap';
import { SEEN_LEVEL } from '../stylized3d/avatarChoreo';
import { useAvatarWalk } from './useAvatarWalk';

/*
 * La doublure de Reanimated finit chaque animation tout de suite (withTiming rappelle aussitôt) :
 * une marche se termine dans l'effet qui la lance.
 */

const map = buildRegionMap(islandOf('maths')!, 'maths-nombres', new Map())!;
const level = (index: number) => map.nodes[index]!.levelId;
const at = (index: number) => [{ x: map.nodes[index]!.x, z: map.nodes[index]!.z }];

type Props = { levelId: string; animated?: boolean; running?: boolean };

async function walk(initial: Props) {
  const onArrive = jest.fn();
  const hook = await renderHook(
    ({ levelId, animated = true, running = true }: Props) =>
      useAvatarWalk({ map, levelId, quick: false, animated, running, onArrive }),
    { initialProps: initial },
  );
  return { ...hook, onArrive };
}

beforeEach(() => SEEN_LEVEL.clear());

describe('marche de l’avatar sur la carte pré-rendue', () => {
  it('se pose sur son niveau à l’ouverture, sans marcher, et l’annonce', async () => {
    const { result, onArrive } = await walk({ levelId: level(2) });
    expect(result.current.route.get().points).toEqual(at(2));
    expect(result.current.progress.get()).toBe(0);
    expect(onArrive).toHaveBeenCalledWith(level(2));
  });

  it('attend que la carte se voie pour changer de niveau', async () => {
    const { rerender, onArrive } = await walk({ levelId: level(2), running: false });
    expect(onArrive).not.toHaveBeenCalled();
    await rerender({ levelId: level(2), running: true });
    expect(onArrive).toHaveBeenCalledWith(level(2));
  });

  it('marche le long du chemin jusqu’au niveau touché, puis annonce son arrivée', async () => {
    const { result, rerender, onArrive } = await walk({ levelId: level(2) });
    onArrive.mockClear();
    await rerender({ levelId: level(5) });
    expect(result.current.route.get().points).toEqual(walkRoute(map.path, 2, 5).points);
    expect(result.current.progress.get()).toBe(1);
    expect(onArrive).toHaveBeenCalledWith(level(5));
    expect(SEEN_LEVEL.get(map.regionId)).toBe(level(5));
  });

  it('change de niveau d’un coup quand les animations sont réduites', async () => {
    const { result, rerender, onArrive } = await walk({ levelId: level(2), animated: false });
    await rerender({ levelId: level(5), animated: false });
    expect(result.current.route.get().points).toEqual(at(5));
    expect(onArrive).toHaveBeenLastCalledWith(level(5));
  });

  it('renvoyé vers le niveau qu’il n’a pas quitté, annonce son arrivée sans attendre', async () => {
    const { result, rerender, onArrive } = await walk({ levelId: level(2) });
    // La carte célèbre le niveau terminé : son niveau est déjà le suivant, mais il attend sur place.
    await rerender({ levelId: level(3), running: false });
    onArrive.mockClear();
    // L'élève touche le niveau terminé : l'attente cesse, il y est déjà.
    await rerender({ levelId: level(2), running: true });
    expect(onArrive).toHaveBeenCalledWith(level(2));
    expect(result.current.route.get().points).toEqual(at(2));
  });

  it('attend sur le dernier niveau atteint, d’où il repartira', async () => {
    SEEN_LEVEL.set(map.regionId, level(1));
    const { result } = await walk({ levelId: level(4), running: false });
    expect(result.current.route.get().points).toEqual(at(1));
  });
});
