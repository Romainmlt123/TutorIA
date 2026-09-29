import { act, renderHook, waitFor } from '@testing-library/react-native';

import type { TutorService } from '@/services/tutor';
import { createMockTutorService } from '@/services/tutor/mock/MockTutorService';

import { useTutorChat } from './useTutorChat';

const topic = { subjectId: 'maths', chapterId: 'maths-equations' } as const;

const failingService: TutorService = {
  kind: 'live',
  async *sendMessage() {
    yield { type: 'error', code: 'network' };
  },
  startVoiceSession: () => Promise.reject(new Error('indisponible')),
  reportMessage: async () => undefined,
};

describe('useTutorChat', () => {
  it('ouvre la conversation de la maquette et reçoit la réponse du tuteur en flux', async () => {
    const service = createMockTutorService({ chunkDelayMs: 0 });
    const { result } = await renderHook(() => useTutorChat(topic, true, service));
    expect(result.current.messages).toHaveLength(4);

    await act(async () => {
      await result.current.send('Je divise par 3');
    });
    await waitFor(() => expect(result.current.pending).toBe(false));
    const last = result.current.messages.at(-1);
    expect(last).toMatchObject({ kind: 'tutor', streaming: false });
    expect(last?.text).toContain('On divise les deux côtés par 3');
  });

  it('passe en hors ligne assumé et propose une question d’entraînement du chapitre', async () => {
    const { result } = await renderHook(() => useTutorChat(topic, true, failingService));
    await act(async () => {
      await result.current.send('x = 5');
    });
    await waitFor(() => expect(result.current.offline).toBe(true));
    const practice = result.current.messages.at(-1);
    expect(practice).toMatchObject({ kind: 'tutor', practice: true });
    expect(practice?.text).toContain('Résous : 2x − 7 = 9');

    await act(async () => {
      await result.current.send('B');
    });
    const feedback = result.current.messages.at(-2);
    expect(feedback?.text.startsWith('Bien joué !')).toBe(true);
  });

  it('marque une réponse signalée', async () => {
    const reportMessage = jest.fn(async () => undefined);
    const service = { ...createMockTutorService({ chunkDelayMs: 0 }), reportMessage };
    const { result } = await renderHook(() => useTutorChat(topic, true, service));
    await act(async () => result.current.report('opening-0'));
    expect(reportMessage).toHaveBeenCalledTimes(1);
    expect(result.current.messages[0]?.reported).toBe(true);
  });
});
