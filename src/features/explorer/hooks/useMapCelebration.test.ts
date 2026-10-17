import { act, renderHook } from '@testing-library/react-native';
import { AccessibilityInfo } from 'react-native';

import { islandOf } from '../content';
import { CELEBRATION, planCelebration } from '../logic/celebration';
import { progressMessage, progressSince } from '../logic/mapProgress';
import type { LevelRecord } from '../logic/progression';
import { buildRegionMap, type RegionMap } from '../logic/regionMap';
import { useMapCelebration } from './useMapCelebration';

/*
 * La doublure de Reanimated rend une valeur brute pour `makeMutable` : ici, une valeur partagée
 * lisible et modifiable, comme celle de `useSharedValue`. Elle finit chaque animation tout de suite
 * (withTiming rend sa valeur d'arrivée).
 */
jest.mock('react-native-reanimated', () => {
  const mock = jest.requireActual<Record<string, unknown>>('react-native-reanimated/mock');
  return {
    ...mock,
    makeMutable: (initial: number) => {
      let current = initial;
      return {
        get: () => current,
        set: (next: number) => {
          current = next;
        },
      };
    },
  };
});

const island = islandOf('maths')!;
const empty = buildRegionMap(island, 'maths-nombres', new Map())!;
const lesson = empty.nodes[0]!.levelId;
const LESSON_DONE: LevelRecord = {
  levelId: lesson,
  finished: true,
  bestScore: 1,
  stars: 3,
  attempts: 1,
};
const done = buildRegionMap(island, 'maths-nombres', new Map([[lesson, LESSON_DONE]]))!;

type Props = { map: RegionMap | null; active?: boolean; animated?: boolean };

async function celebrate(initial: Props) {
  return renderHook(
    ({ map, active = true, animated = true }: Props) =>
      useMapCelebration({ map, active, animated }),
    { initialProps: initial },
  );
}

let announce: jest.SpyInstance;
beforeEach(() => {
  jest.useFakeTimers();
  announce = jest
    .spyOn(AccessibilityInfo, 'announceForAccessibility')
    .mockImplementation(jest.fn());
});
afterEach(() => {
  jest.useRealTimers();
  announce.mockRestore();
});

describe('célébration de la carte au retour d’un niveau', () => {
  it('ne célèbre rien à la première visite de la région', async () => {
    const { result } = await celebrate({ map: empty });
    expect(result.current.shown).toBeNull();
    expect(result.current.holding).toBe(false);
    expect(announce).not.toHaveBeenCalled();
  });

  it('sous le niveau qui se termine, la carte garde son ancien état et l’avatar attend', async () => {
    const { result, rerender } = await celebrate({ map: empty });
    await rerender({ map: done, active: false });
    const shown = result.current.shown!;
    expect(shown.progress).toEqual(progressSince(empty, done));
    expect(shown.clock.get()).toBe(0);
    expect(result.current.holding).toBe(true);
    expect(announce).not.toHaveBeenCalled();
  });

  it('quand la carte se voit : l’horloge court, le progrès est annoncé, puis l’avatar repart', async () => {
    const { result, rerender } = await celebrate({ map: empty });
    await rerender({ map: done, active: false });
    const pending = result.current.shown;
    await rerender({ map: done, active: true });
    // La même célébration continue : rien n'est remonté.
    expect(result.current.shown).toBe(pending);
    const plan = planCelebration(progressSince(empty, done)!);
    expect(result.current.shown!.clock.get()).toBe(plan.end);
    // L'annonce attend que l'écran se pose.
    expect(announce).not.toHaveBeenCalled();
    await act(() => jest.advanceTimersByTime(CELEBRATION.start * 1000));
    expect(announce).toHaveBeenCalledTimes(1);
    expect(announce).toHaveBeenCalledWith(progressMessage(progressSince(empty, done)!, done));
    expect(result.current.holding).toBe(true);
    await act(() => jest.advanceTimersByTime(plan.walkAt * 1000));
    expect(result.current.holding).toBe(false);
  });

  it('ne joue qu’une fois : la carte revue plus tard reste dans son nouvel état', async () => {
    const { result, rerender } = await celebrate({ map: empty });
    await rerender({ map: done });
    const first = result.current.shown;
    await rerender({ map: done, active: false });
    await rerender({ map: done, active: true });
    await act(() => jest.runAllTimers());
    expect(result.current.shown).toBe(first);
    expect(announce).toHaveBeenCalledTimes(1);
  });

  it('un niveau touché pendant la célébration laisse partir l’avatar tout de suite', async () => {
    const { result, rerender } = await celebrate({ map: empty });
    await rerender({ map: done });
    expect(result.current.holding).toBe(true);
    await act(() => result.current.release());
    expect(result.current.holding).toBe(false);
  });

  it('avec « Réduire les animations », le nouvel état d’emblée, et l’annonce seule', async () => {
    const { result, rerender } = await celebrate({ map: empty, animated: false });
    await rerender({ map: done, active: false, animated: false });
    expect(result.current.shown).toBeNull();
    await rerender({ map: done, animated: false });
    expect(result.current.shown).toBeNull();
    expect(result.current.holding).toBe(false);
    await act(() => jest.runAllTimers());
    expect(announce).toHaveBeenCalledTimes(1);
  });

  it('hors de la région, rien n’est montré et l’avatar n’attend pas', async () => {
    const { result, rerender } = await celebrate({ map: empty });
    await rerender({ map: done });
    await rerender({ map: null });
    expect(result.current.shown).toBeNull();
    expect(result.current.holding).toBe(false);
  });
});
