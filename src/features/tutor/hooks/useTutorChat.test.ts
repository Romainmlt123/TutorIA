import { act, renderHook, waitFor } from '@testing-library/react-native';

import { demoConversation } from '@/data/mock/tutorConversation';
import { MockConversationService } from '@/services/conversations/mock/MockConversationService';
import type { TutorService } from '@/services/tutor';
import { createMockTutorService } from '@/services/tutor/mock/MockTutorService';

import { chatMessagesOf } from '../logic/conversations';
import { useTutorChat } from './useTutorChat';

const topic = { subjectId: 'maths', chapterId: 'maths-equations' } as const;
const resume = {
  conversationId: 'demo',
  messages: chatMessagesOf(
    demoConversation.messages.map((m, i) => ({
      id: `opening-${i}`,
      role: m.role,
      content: m.content,
      visual: null,
      createdAt: '2026-10-07T08:00:00Z',
    })),
  ),
};

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
    const { result } = await renderHook(() => useTutorChat({ topic, service, resume }));
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
    const { result } = await renderHook(() =>
      useTutorChat({ topic, service: failingService, resume }),
    );
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
    const { result } = await renderHook(() => useTutorChat({ topic, service, resume }));
    await act(async () => result.current.report('opening-0'));
    expect(reportMessage).toHaveBeenCalledTimes(1);
    expect(result.current.messages[0]?.reported).toBe(true);
  });

  it('suit l’avancement d’un niveau d’Explorer, avec une carte par étape, puis son bilan', async () => {
    const recordLevel = jest.fn(() => 10);
    const service = createMockTutorService({ chunkDelayMs: 0, recordLevel });
    const levelTopic = { ...topic, levelId: 'maths-equations.isoler-x' };
    const level = { opening: 'On commence !', stepCard: (done: number) => `Étape ${done} réussie` };
    const { result } = await renderHook(() => useTutorChat({ topic: levelTopic, service, level }));
    expect(result.current.messages).toEqual([
      { id: 'opening-0', kind: 'tutor', text: 'On commence !' },
    ]);

    for (const message of ['C’est parti !', 'On enlève 5 des deux côtés']) {
      await act(async () => {
        await result.current.send(message);
      });
    }
    await waitFor(() => expect(result.current.pending).toBe(false));
    expect(result.current.progress).toEqual({ done: 1, total: 4 });
    expect(result.current.messages.map((m) => m.kind)).toEqual([
      'tutor',
      'student',
      'tutor',
      'student',
      'step',
      'tutor',
    ]);

    for (const answer of ['3x = 15', 'x = 5', 'Je vérifie : 3 × 5 + 5 = 20']) {
      await act(async () => {
        await result.current.send(answer);
      });
    }
    await waitFor(() => expect(result.current.result).not.toBeNull());
    expect(result.current.result).toMatchObject({ passed: true, stars: 3, xp: 10 });
    expect(recordLevel).toHaveBeenCalledTimes(1);
  });

  it('attache le visuel du tuteur à sa réponse et le montre dans le panneau', async () => {
    const service = createMockTutorService({ chunkDelayMs: 0 });
    const { result } = await renderHook(() => useTutorChat({ topic, service }));
    expect(result.current.visual).toBeNull();
    await act(async () => {
      await result.current.send('Tu peux me montrer un graphique ?');
    });
    await waitFor(() => expect(result.current.pending).toBe(false));
    expect(result.current.visual).toMatchObject({ kind: 'graph', title: '3x + 5 = 20' });
    expect(result.current.messages.at(-1)?.visual?.kind).toBe('graph');
  });

  it('ouvre une discussion libre : identifiant, titre, puis la suite dans la même discussion', async () => {
    const conversations = new MockConversationService();
    const service = createMockTutorService({ chunkDelayMs: 0, conversations });
    const onConversation = jest.fn();
    const onTitle = jest.fn();
    const sendMessage = jest.spyOn(service, 'sendMessage');
    const { result } = await renderHook(() =>
      useTutorChat({ topic: {}, service, onConversation, onTitle }),
    );
    expect(result.current.messages[0]?.text).toContain('Pose-moi ta question');

    await act(async () => {
      await result.current.send('Comment on calcule une moyenne ?');
    });
    await waitFor(() => expect(result.current.pending).toBe(false));
    const id = onConversation.mock.calls[0]?.[0] as string;
    expect(conversations.has(id)).toBe(true);
    expect(onTitle).toHaveBeenCalledWith('Comment on calcule une moyenne ?', 'maths');
    expect((await conversations.list())[0]?.subjectId).toBe('maths');

    await act(async () => {
      await result.current.send('Et la médiane ?');
    });
    await waitFor(() => expect(result.current.pending).toBe(false));
    expect(sendMessage.mock.calls[1]?.[0].conversationId).toBe(id);
    expect(onConversation).toHaveBeenCalledTimes(1);
    expect(await conversations.messages(id)).toHaveLength(4);
  });

  it('sans chapitre, une coupure affiche un message au lieu des questions d’entraînement', async () => {
    const { result } = await renderHook(() =>
      useTutorChat({ topic: { subjectId: 'maths' }, service: failingService }),
    );
    await act(async () => {
      await result.current.send('Bonjour');
    });
    await waitFor(() => expect(result.current.pending).toBe(false));
    expect(result.current.offline).toBe(false);
    expect(result.current.messages.at(-1)?.text).toContain('Petit souci de connexion');
  });
});
