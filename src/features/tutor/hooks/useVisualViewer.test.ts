import { act, renderHook } from '@testing-library/react-native';

import { MOCK_VISUALS } from '@/services/tutor/mock/visualScripts';
import type { TutorVisual } from '@/services/tutor/visuals';

import { useVisualViewer } from './useVisualViewer';

describe('panneau du visuel', () => {
  it('se replie et se rouvre au toucher, et un nouveau visuel le rouvre', async () => {
    const { result, rerender } = await renderHook(
      ({ latest }: { latest: TutorVisual | null }) => useVisualViewer(latest),
      { initialProps: { latest: MOCK_VISUALS.graph as TutorVisual } },
    );
    expect(result.current.open).toBe(true);
    await act(async () => result.current.toggle());
    expect(result.current.open).toBe(false);
    await rerender({ latest: MOCK_VISUALS.board });
    expect(result.current.open).toBe(true);
  });

  it('se replie pendant la saisie, mais l’élève peut le rouvrir', async () => {
    const { result, rerender } = await renderHook(
      ({ typing }: { typing: boolean }) => useVisualViewer(MOCK_VISUALS.graph, typing),
      { initialProps: { typing: true } },
    );
    expect(result.current.open).toBe(false);
    await act(async () => result.current.toggle());
    expect(result.current.open).toBe(true);
    await rerender({ typing: false });
    expect(result.current.open).toBe(true);
  });
});
