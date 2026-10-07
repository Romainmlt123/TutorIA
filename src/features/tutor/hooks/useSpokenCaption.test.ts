import { act, renderHook } from '@testing-library/react-native';

import type { VoiceCaption } from '@/services/tutor';

import { useSpokenCaption } from './useSpokenCaption';

const tutor = (text: string, final = false): VoiceCaption => ({ text, final });

describe('sous-titres du tuteur calés sur sa voix', () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  it('allume les mots au rythme de la voix, même si le texte arrive d’un coup', async () => {
    const text = 'Pour résoudre cette équation, on commence par retirer 5 des deux côtés.';
    const { result, rerender } = await renderHook(
      ({ caption, speaking }: { caption: VoiceCaption; speaking: boolean }) =>
        useSpokenCaption(caption, speaking),
      { initialProps: { caption: tutor(text, true), speaking: true } },
    );
    expect(result.current).toBeLessThan(10);
    await act(async () => {
      jest.advanceTimersByTime(2000);
    });
    const midway = result.current ?? 0;
    expect(midway).toBeGreaterThan(20);
    expect(midway).toBeLessThan(text.length);
    // La voix s'arrête : tout est dit.
    await rerender({ caption: tutor(text, true), speaking: false });
    expect(result.current).toBe(text.length);
  });
});
