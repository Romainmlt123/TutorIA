import type { SubjectId } from '@/data/types';
import { levelById } from '@/features/explorer/content';
import { applyCalls, startPlay } from '@/features/explorer/logic/levelPlay';
import type { VoiceEvent } from '@/features/tutor/logic/voice';

import type { ChatRequest, LevelOutcome, TutorStreamEvent } from '../api-contract';
import type { StartVoiceRequest, TutorService, VoiceSession } from '../TutorService';
import { mockLevelTurn, type MockLevelState } from './levelScripts';
import type { MockConversationService } from '../../conversations/mock/MockConversationService';
import { mockVisualTurn } from './visualScripts';
import { scriptedReply } from './scripts';

export type MockOptions = {
  /** Délai entre deux morceaux du faux flux (ms). */
  chunkDelayMs?: number;
  /** Durées de l'appel simulé (ms), comme la maquette 02b : 7 s de parole, 5 s d'écoute. */
  voice?: { connectMs: number; aiSpeakMs: number; userSpeakMs: number };
  /**
   * Enregistre la fin d'un niveau (progression simulée d'Explorer) et rend l'XP accordée. Absent :
   * rien n'est gardé et le bilan annonce toute l'XP du niveau.
   */
  recordLevel?: (outcome: LevelOutcome) => number;
  /** Discussions simulées du volet (mode tout simulé) : le tuteur simulé y enregistre les siennes. */
  conversations?: MockConversationService;
};

/** Matière simulée d'une discussion libre, devinée par quelques mots de la question. */
const SUBJECT_WORDS: readonly [SubjectId, RegExp][] = [
  ['maths', /équation|calcul|fraction|moyenne|nombre|triangle|pythagore|graphique|fonction/i],
  ['francais', /verbe|accord|conjug|grammaire|orthographe|rédaction|poème|roman/i],
  ['histoire-geo', /guerre|révolution|roi|empire|histoire|géographie|pays|continent/i],
  ['anglais', /anglais|english|prétérit|vocabulaire anglais/i],
  ['svt', /cellule|plante|digestion|svt|volcan|séisme|respiration/i],
  ['physique-chimie', /atome|électri|vitesse|chimie|masse|énergie|force/i],
];

export const mockSubjectOf = (message: string): SubjectId | undefined =>
  SUBJECT_WORDS.find(([, words]) => words.test(message))?.[0];

/** Titre simulé d'une discussion : le début de la première question. */
const mockTitle = (message: string) =>
  message.length > 40 ? `${message.slice(0, 39).trimEnd()}…` : message;

const DEFAULT_VOICE = { connectMs: 900, aiSpeakMs: 7000, userSpeakMs: 5000 };

const wait = (ms: number, signal?: AbortSignal) =>
  new Promise<void>((resolve) => {
    const timer = setTimeout(resolve, ms);
    signal?.addEventListener('abort', () => {
      clearTimeout(timer);
      resolve();
    });
  });

/** Découpe une réponse en morceaux de un ou deux mots, pour simuler le flux. */
export function chunkText(text: string): string[] {
  return text.match(/\S+\s*/g) ?? [];
}

class MockVoiceSession implements VoiceSession {
  private timers: ReturnType<typeof setTimeout>[] = [];
  private muted = false;
  private stopped = false;

  constructor(
    private readonly emit: (event: VoiceEvent) => void,
    private readonly timing: typeof DEFAULT_VOICE,
  ) {
    this.schedule(timing.connectMs, () => {
      emit({ type: 'connected' });
      this.tutorTurn();
    });
  }

  private schedule(ms: number, action: () => void) {
    this.timers.push(
      setTimeout(() => {
        if (!this.stopped) action();
      }, ms),
    );
  }

  private clearTimers() {
    this.timers.forEach(clearTimeout);
    this.timers = [];
  }

  /** Le tuteur parle, puis laisse la parole à l'élève, en boucle. */
  private tutorTurn() {
    this.emit({ type: 'aiStarted' });
    this.schedule(this.timing.aiSpeakMs, () => {
      this.emit({ type: 'aiStopped' });
      this.studentTurn();
    });
  }

  private studentTurn() {
    if (!this.muted) this.emit({ type: 'userStarted' });
    this.schedule(this.timing.userSpeakMs, () => {
      this.emit({ type: 'userStopped' });
      this.tutorTurn();
    });
  }

  setMuted(muted: boolean) {
    this.muted = muted;
    this.emit({ type: 'muteChanged', muted });
  }

  holdMicrophone() {
    // Rien à suspendre : l'appel simulé n'utilise pas le micro.
  }

  interrupt() {
    this.clearTimers();
    this.emit({ type: 'interrupted' });
    this.schedule(this.timing.userSpeakMs, () => {
      this.emit({ type: 'userStopped' });
      this.tutorTurn();
    });
  }

  async sendExercisePhoto() {
    this.clearTimers();
    this.emit({ type: 'userStopped' });
    this.tutorTurn();
  }

  stop() {
    this.stopped = true;
    this.clearTimers();
    this.emit({ type: 'ended' });
  }
}

/** Tuteur simulé : réponses scriptées, faux flux, appel vocal sans réseau. */
export function createMockTutorService(options: MockOptions = {}): TutorService {
  const chunkDelayMs = options.chunkDelayMs ?? 45;
  const voiceTiming = options.voice ?? DEFAULT_VOICE;

  // Niveaux d'Explorer en cours, par discussion : une nouvelle discussion est une nouvelle partie.
  const levels = new Map<string, MockLevelState>();
  let counter = 0;

  return {
    kind: 'mock',
    async *sendMessage(
      request: ChatRequest,
      signal?: AbortSignal,
    ): AsyncIterable<TutorStreamEvent> {
      const place = request.topic.levelId ? levelById(request.topic.levelId) : undefined;
      const store = place ? undefined : options.conversations;
      // Sans identifiant, le message ouvre une nouvelle discussion, comme avec le serveur.
      const created = !request.conversationId;
      const conversationId =
        request.conversationId ??
        store?.create(request.topic.subjectId ?? null, request.topic.chapterId ?? null) ??
        `mock-conversation-${++counter}`;
      if (created) yield { type: 'conversation', id: conversationId };
      store?.record(conversationId, 'student', request.message, null);
      let state: MockLevelState | undefined;
      let reply = scriptedReply(request);
      let calls: ReturnType<typeof mockLevelTurn>['calls'] = [];
      // Hors niveau, l'élève peut demander un graphique, un tableau, un diagramme ou une figure.
      const visualTurn = place ? null : mockVisualTurn(request.message);
      if (visualTurn) reply = visualTurn.reply;
      if (place) {
        const previous = levels.get(conversationId);
        state =
          previous && !previous.play.finished
            ? previous
            : { play: startPlay(place.level.id), hintGiven: false, asked: false };
        const turn = mockLevelTurn(place, state, request.message);
        reply = turn.reply;
        calls = turn.calls;
        state = { ...state, hintGiven: turn.hintGiven, asked: true };
      }

      await wait(chunkDelayMs * 6, signal);
      for (const chunk of chunkText(reply)) {
        if (signal?.aborted) return;
        yield { type: 'delta', text: chunk };
        await wait(chunkDelayMs, signal);
      }
      if (signal?.aborted) return;
      store?.record(conversationId, 'tutor', reply, visualTurn?.visual ?? null);
      // Comme le serveur : le visuel arrive après le texte de la réponse.
      if (visualTurn) yield { type: 'visual', visual: visualTurn.visual };
      if (created && !place) {
        const title = mockTitle(request.message);
        const subjectId = request.topic.subjectId ? undefined : mockSubjectOf(request.message);
        store?.setTitle(conversationId, title, subjectId);
        yield subjectId ? { type: 'title', title, subjectId } : { type: 'title', title };
      }

      // Mêmes règles que le serveur : jugements plafonnés, progression et bilan calculés ici.
      if (place && state) {
        const result = applyCalls(place.level, state.play, calls);
        levels.set(conversationId, { ...state, play: result.play });
        if (result.progressed) {
          const done =
            place.level.type === 'lecon' ? result.play.stepsDone : result.play.answers.length;
          yield { type: 'step', done, total: place.level.steps };
        }
        if (result.outcome) {
          const xp = options.recordLevel?.(result.outcome) ?? result.outcome.xp;
          yield { type: 'levelResult', outcome: { ...result.outcome, xp } };
        }
      }
      yield { type: 'done' };
    },
    async startVoiceSession({ onEvent }: StartVoiceRequest) {
      return new MockVoiceSession(onEvent, voiceTiming);
    },
    async reportMessage() {
      // Rien à transmettre hors ligne : le signalement est confirmé à l'élève.
    },
  };
}
