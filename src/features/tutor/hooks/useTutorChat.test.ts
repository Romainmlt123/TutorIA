import { act, renderHook, waitFor } from '@testing-library/react-native';

import { demoConversation } from '@/data/mock/tutorConversation';
import { fr } from '@/i18n/fr';
import { queryClient } from '@/lib/queryClient';
import { studyRulesKey } from '@/lib/session/useStudyRules';
import { MockConversationService } from '@/services/conversations/mock/MockConversationService';
import type { TutorService } from '@/services/tutor';
import type { ChatRequest } from '@/services/tutor/api-contract';
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
  it('relit les règles des parents dès que le serveur annonce la pause', async () => {
    const paused: TutorService = {
      ...failingService,
      async *sendMessage() {
        yield { type: 'error', code: 'paused' };
      },
    };
    const invalidate = jest.spyOn(queryClient, 'invalidateQueries').mockResolvedValue();
    const { result } = await renderHook(() => useTutorChat({ topic, service: paused, resume }));
    await act(async () => {
      await result.current.send('x = 5');
    });
    await waitFor(() => expect(result.current.pending).toBe(false));
    expect(result.current.messages.at(-1)?.text).toBe(fr.tutor.errors.paused);
    expect(invalidate).toHaveBeenCalledWith({ queryKey: studyRulesKey });
    invalidate.mockRestore();
  });

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

  it('sans réseau, garde la question en attente puis la renvoie avec « Réessayer »', async () => {
    let online = false;
    const sendMessage = jest.fn(async function* () {
      if (!online) {
        yield { type: 'error', code: 'network' } as const;
        return;
      }
      yield { type: 'delta', text: 'On divise par 3.' } as const;
      yield { type: 'done' } as const;
    });
    const service: TutorService = { ...failingService, sendMessage };
    const { result } = await renderHook(() => useTutorChat({ topic, service, resume }));
    await act(async () => {
      await result.current.send('Je divise par 3 ?');
    });
    await waitFor(() => expect(result.current.offline).toBe(true));
    // La bulle vide du tuteur disparaît ; la question de l'élève reste, en dernier.
    expect(result.current.messages.at(-1)).toMatchObject({
      kind: 'student',
      text: 'Je divise par 3 ?',
    });

    online = true;
    await act(async () => {
      result.current.retry();
    });
    await waitFor(() => expect(result.current.pending).toBe(false));
    expect(result.current.offline).toBe(false);
    expect(result.current.messages.filter((m) => m.text === 'Je divise par 3 ?')).toHaveLength(1);
    expect(result.current.messages.at(-1)?.text).toBe('On divise par 3.');
    // La question renvoyée n'est pas répétée dans l'historique.
    const resent = sendMessage.mock.calls[1] as unknown as [ChatRequest];
    expect(resent[0].message).toBe('Je divise par 3 ?');
    expect(resent[0].history.at(-1)?.text).not.toBe('Je divise par 3 ?');
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

  it('une erreur du service (pas une coupure) garde son message, sans carte hors ligne', async () => {
    const upstream: TutorService = {
      ...failingService,
      async *sendMessage() {
        yield { type: 'error', code: 'upstream' };
      },
    };
    const { result } = await renderHook(() =>
      useTutorChat({ topic: { subjectId: 'maths' }, service: upstream }),
    );
    await act(async () => {
      await result.current.send('Bonjour');
    });
    await waitFor(() => expect(result.current.pending).toBe(false));
    expect(result.current.offline).toBe(false);
    expect(result.current.messages.at(-1)?.text).toBe(fr.tutor.errors.upstream);
  });

  it('envoie la photo d’un exercice avec le message, et la montre dans la bulle de l’élève', async () => {
    const conversations = new MockConversationService();
    const service = createMockTutorService({ chunkDelayMs: 0, conversations });
    const sendMessage = jest.spyOn(service, 'sendMessage');
    const photo = 'data:image/jpeg;base64,/9j/4AAQ';
    const onConversation = jest.fn();
    const { result } = await renderHook(() => useTutorChat({ topic: {}, service, onConversation }));
    await act(async () => {
      await result.current.send('', photo);
    });
    await waitFor(() => expect(result.current.pending).toBe(false));
    expect(sendMessage.mock.calls[0]?.[0]).toMatchObject({ message: '', image: photo });
    expect(result.current.messages.find((m) => m.kind === 'student')).toMatchObject({
      text: '',
      image: photo,
    });
    expect(result.current.messages.at(-1)?.text).toContain('L’exercice');
    // La photo n'est pas gardée : seule une mention la remplace dans la discussion enregistrée.
    const id = onConversation.mock.calls[0]?.[0] as string;
    expect((await conversations.messages(id))[0]?.content).toBe('📷 Photo de l’exercice');
  });
});
