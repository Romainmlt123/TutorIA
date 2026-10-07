import type { VoiceEvent } from '@/features/tutor/logic/voice';

import type { ChatRequest, TutorStreamEvent } from '../api-contract';
import { chunkText, createMockTutorService } from './MockTutorService';
import { checkPracticeAnswer, practiceQuestion } from './practice';
import { scriptedReply } from './scripts';

const request = (message: string): ChatRequest => ({
  topic: { subjectId: 'maths', chapterId: 'maths-equations' },
  history: [],
  message,
});

async function collect(stream: AsyncIterable<TutorStreamEvent>) {
  const events: TutorStreamEvent[] = [];
  for await (const event of stream) events.push(event);
  return events;
}

describe('tuteur simulé', () => {
  it('guide vers la réponse sans la donner et sans dire « faux »', () => {
    const reply = scriptedReply(request('Il faut diviser par 3'));
    expect(reply).toMatch(/\?$/);
    expect(reply).not.toMatch(/x = 5/);
    expect(scriptedReply(request('je sais pas'))).not.toMatch(/faux|tort/i);
  });

  it('diffuse la réponse scriptée en plusieurs morceaux puis termine', async () => {
    const service = createMockTutorService({ chunkDelayMs: 0 });
    const events = await collect(service.sendMessage(request('Je divise par 3')));
    const deltas = events.filter((e) => e.type === 'delta');
    expect(deltas.length).toBeGreaterThan(3);
    expect(deltas.map((e) => (e.type === 'delta' ? e.text : '')).join('')).toBe(
      scriptedReply(request('Je divise par 3')),
    );
    expect(events.at(-1)).toEqual({ type: 'done' });
  });

  it('s’arrête quand on annule le flux', async () => {
    const service = createMockTutorService({ chunkDelayMs: 5 });
    const controller = new AbortController();
    const events: TutorStreamEvent[] = [];
    for await (const event of service.sendMessage(request('divise'), controller.signal)) {
      events.push(event);
      controller.abort();
    }
    expect(events).toHaveLength(1);
  });

  it('découpe le texte sans perdre de caractères', () => {
    expect(chunkText('On divise par 3.').join('')).toBe('On divise par 3.');
  });

  it('simule un appel : connexion, tuteur qui parle, puis élève, et fin', async () => {
    jest.useFakeTimers();
    const events: VoiceEvent['type'][] = [];
    const service = createMockTutorService({
      voice: { connectMs: 10, aiSpeakMs: 100, userSpeakMs: 50 },
    });
    const session = await service.startVoiceSession({
      topic: { subjectId: 'maths', chapterId: 'maths-equations' },
      onEvent: (e) => events.push(e.type),
    });
    jest.advanceTimersByTime(10);
    jest.advanceTimersByTime(100);
    session.interrupt();
    session.stop();
    jest.advanceTimersByTime(1000);
    expect(events).toEqual([
      'connected',
      'aiStarted',
      'aiStopped',
      'userStarted',
      'interrupted',
      'ended',
    ]);
    jest.useRealTimers();
  });
});

describe('entraînement hors ligne', () => {
  const card = {
    id: 'c',
    chapterId: 'maths-equations',
    question: 'Résous : x + 12 = 4',
    options: ['x = 16', 'x = 8', 'x = −8', 'x = −16'],
    answerIndex: 2,
    explanation: 'On retire 12 des deux côtés.',
  } as const;

  it('pose la question avec ses 4 propositions', () => {
    expect(practiceQuestion(card)).toBe(
      'Résous : x + 12 = 4\nA. x = 16\nB. x = 8\nC. x = −8\nD. x = −16',
    );
  });

  it('accepte la lettre ou le texte de la bonne réponse', () => {
    expect(checkPracticeAnswer(card, 'c').right).toBe(true);
    expect(checkPracticeAnswer(card, ' x = −8 ').right).toBe(true);
    expect(checkPracticeAnswer(card, 'A')).toEqual({
      right: false,
      text: 'Pas tout à fait : c’était x = −8. On retire 12 des deux côtés.',
    });
  });
});

describe('tuteur simulé · niveaux d’Explorer', () => {
  const level = (slug: string, message: string): ChatRequest => ({
    topic: { subjectId: 'maths', chapterId: 'maths-equations', levelId: `maths-equations.${slug}` },
    history: [],
    message,
    // Une partie se suit par sa discussion, comme avec le serveur.
    conversationId: `partie-${slug}`,
  });
  const text = (events: TutorStreamEvent[]) =>
    events.map((e) => (e.type === 'delta' ? e.text : '')).join('');
  /** Service simulé dont le niveau est lancé : le tuteur a posé sa première question. */
  const started = async (slug: string) => {
    const service = createMockTutorService({ chunkDelayMs: 0 });
    const first = await collect(service.sendMessage(level(slug, 'C’est parti !')));
    expect(first.some((e) => e.type === 'step')).toBe(false);
    return service;
  };

  it('enseigne en leçon : chaque étape réussie fait avancer la barre, jusqu’au bilan', async () => {
    const service = await started('isoler-x');
    const all: TutorStreamEvent[] = [];
    for (let i = 0; i < 4; i++)
      all.push(...(await collect(service.sendMessage(level('isoler-x', 'Je divise par 3')))));
    expect(
      all.filter((e) => e.type === 'step').map((e) => (e.type === 'step' ? e.done : 0)),
    ).toEqual([1, 2, 3, 4]);
    expect(all.find((e) => e.type === 'levelResult')).toMatchObject({
      outcome: { passed: true, stars: 3 },
    });
  });

  it('donne un indice en exercices, et la réponse aidée compte pour moitié', async () => {
    const service = await started('resoudre-ax-b-c');
    const hint = await collect(
      service.sendMessage(level('resoudre-ax-b-c', 'Je peux avoir un indice ?')),
    );
    expect(text(hint)).toMatch(/indice/i);
    expect(hint.some((e) => e.type === 'step')).toBe(false);
    const answer = await collect(service.sendMessage(level('resoudre-ax-b-c', 'x = 4')));
    expect(answer).toContainEqual({ type: 'step', done: 1, total: 5 });
  });

  it('refuse toute aide en évaluation et reprend la question', async () => {
    const service = await started('bilan');
    const events = await collect(service.sendMessage(level('bilan', 'Tu peux m’aider ?')));
    expect(text(events)).toMatch(/je ne peux pas t’aider/);
    expect(text(events)).not.toMatch(/indice/i);
    expect(events.some((e) => e.type === 'step')).toBe(false);
  });

  it('exige une démarche rédigée en évaluation', async () => {
    const service = await started('bilan');
    const all: TutorStreamEvent[] = [];
    for (let i = 0; i < 8; i++) {
      const message = i < 5 ? '2x = 10 donc x = 5' : '5';
      all.push(...(await collect(service.sendMessage(level('bilan', message)))));
    }
    expect(all.find((e) => e.type === 'levelResult')).toMatchObject({
      outcome: { correct: 5, total: 8, passed: false },
    });
  });
});
