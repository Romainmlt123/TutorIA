import { renderHook, waitFor } from '@testing-library/react-native';

import type { TutorService } from '@/services/tutor';
import { VoiceSessionError } from '@/services/tutor/live/realtimeVoice';

import { useVoiceCall } from './useVoiceCall';

const topic = { subjectId: 'maths', chapterId: 'maths-equations' } as const;

const refusing = (code: 'daily_limit' | 'rate_limited'): TutorService => ({
  kind: 'live',
  async *sendMessage() {
    throw new Error('inutile');
  },
  startVoiceSession: () => Promise.reject(new VoiceSessionError(code)),
  reportMessage: async () => undefined,
});

describe('useVoiceCall', () => {
  it('passe à « Appels du jour terminés » quand le serveur refuse pour la limite du jour', async () => {
    const { result } = await renderHook(() =>
      useVoiceCall(topic, () => undefined, refusing('daily_limit')),
    );
    await waitFor(() => expect(result.current.limitReached).toBe(true));
    expect(result.current.notice).toBeUndefined();
  });

  it('garde un message pour la limite d’une minute, sans l’écran des appels du jour', async () => {
    // Erreur attendue, journalisée par le hook.
    const log = jest.spyOn(console, 'error').mockImplementation(() => undefined);
    const { result } = await renderHook(() =>
      useVoiceCall(topic, () => undefined, refusing('rate_limited')),
    );
    await waitFor(() => expect(result.current.status).toBe('error'));
    expect(result.current.limitReached).toBe(false);
    expect(result.current.notice).toBeDefined();
    log.mockRestore();
  });
});
