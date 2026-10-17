import { act, renderHook } from '@testing-library/react-native';
import type { FrameInfo } from 'react-native-reanimated';

import { getMapPerf } from '@/lib/three/perfStats';

import { useMapClock } from './useMapClock';

/*
 * La doublure de Reanimated n'a pas d'horloge d'image : chaque `useFrameCallback` est remplacé par
 * un rappel que le test fait tourner image par image, dans l'ordre du hook (l'horloge, puis la sonde).
 * Ses valeurs partagées sont recréées à chaque rendu : elles sont gardées ici, comme dans l'app.
 * Images de 15,625 ms (64 par seconde) : 32 font une demi-seconde exacte en virgule flottante.
 */
type MockFrameCallback = {
  callback: (frame: FrameInfo) => void;
  isActive: boolean;
  setActive: (active: boolean) => void;
};
const mockFrameCallbacks: MockFrameCallback[] = [];

jest.mock('react-native-reanimated', () => {
  const { useRef } = jest.requireActual<typeof import('react')>('react');
  const mock = jest.requireActual('react-native-reanimated/mock');
  return {
    ...mock,
    useSharedValue: (init: unknown) => {
      const ref = useRef<unknown>(null);
      if (ref.current === null) ref.current = mock.useSharedValue(init);
      return ref.current;
    },
    useFrameCallback: (callback: (frame: FrameInfo) => void, autostart = true) => {
      const ref = useRef<MockFrameCallback | null>(null);
      if (!ref.current) {
        const entry: MockFrameCallback = {
          callback,
          isActive: autostart,
          setActive: (active) => {
            entry.isActive = active;
          },
        };
        ref.current = entry;
        mockFrameCallbacks.push(entry);
      }
      ref.current.callback = callback;
      return ref.current;
    },
  };
});

/** Rappels du hook, dans son ordre : l'horloge, puis la sonde. */
const ticker = () => mockFrameCallbacks[0]!;
const pacer = () => mockFrameCallbacks[1]!;

/** `count` images de `ms` millisecondes : chaque rappel actif les reçoit, comme sur le fil de l'interface. */
function frames(count: number, ms: number) {
  for (let i = 0; i < count; i++) {
    mockFrameCallbacks.forEach((entry) => {
      if (entry.isActive)
        entry.callback({ timestamp: 0, timeSincePreviousFrame: ms, timeSinceFirstFrame: 0 });
    });
  }
}

type Props = { running: boolean; probe?: boolean };

async function clockOf(initialProps: Props) {
  return renderHook(({ running, probe }: Props) => useMapClock(running, probe), { initialProps });
}

beforeEach(() => {
  mockFrameCallbacks.length = 0;
});

const FRAME = 15.625;

describe('horloge d’une carte pré-rendue', () => {
  it('avance au pas de 30 par seconde tant que les animations peuvent tourner', async () => {
    const { result } = await clockOf({ running: true });
    expect(ticker().isActive).toBe(true);
    frames(2, FRAME);
    expect(result.current.value).toBe(0);
    frames(1, FRAME);
    expect(result.current.value).toBeCloseTo(1 / 30, 12);
    frames(61, FRAME);
    expect(result.current.value).toBeCloseTo(1, 12);
  });

  it('reste figée hors de l’onglet ou avec « Réduire les animations », puis repart d’où elle était', async () => {
    const { result, rerender } = await clockOf({ running: true });
    frames(32, FRAME);
    await rerender({ running: false });
    expect(ticker().isActive).toBe(false);
    frames(32, FRAME);
    expect(result.current.value).toBeCloseTo(0.5, 12);
    await rerender({ running: true });
    frames(32, FRAME);
    expect(result.current.value).toBeCloseTo(1, 12);
  });

  it('n’a pas de sonde tant que le compteur de performance est éteint', async () => {
    await clockOf({ running: true });
    expect(pacer().isActive).toBe(false);
    frames(64, FRAME);
    expect(getMapPerf()).toBeNull();
  });
});

describe('sonde d’une carte pré-rendue (compteur de performance)', () => {
  it('publie deux fois par seconde le rythme de l’horloge et celui des images', async () => {
    const { unmount } = await clockOf({ running: true, probe: true });
    expect(pacer().isActive).toBe(true);
    frames(31, FRAME);
    expect(getMapPerf()).toBeNull();
    frames(1, FRAME);
    expect(getMapPerf()).toEqual({ rate: 30, fps: 64, p95: 16, max: 16, late: 0 });
    await act(async () => unmount());
  });

  it('mesure encore les images quand l’horloge est figée : 0 pas, puis plus rien au démontage', async () => {
    const { rerender, unmount } = await clockOf({ running: true, probe: true });
    await rerender({ running: false, probe: true });
    frames(24, FRAME);
    frames(2, 4 * FRAME);
    expect(getMapPerf()).toEqual({ rate: 0, fps: 52, p95: 63, max: 63, late: 2 });
    await act(async () => unmount());
    expect(getMapPerf()).toBeNull();
  });

  it('s’arrête et s’efface quand le compteur s’éteint', async () => {
    const { rerender } = await clockOf({ running: true, probe: true });
    frames(32, FRAME);
    expect(getMapPerf()).not.toBeNull();
    await rerender({ running: true, probe: false });
    expect(pacer().isActive).toBe(false);
    expect(getMapPerf()).toBeNull();
  });
});
