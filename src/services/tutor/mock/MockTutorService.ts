import type { SubjectId } from '@/data/types';
import { levelById } from '@/features/explorer/content';
import { applyCalls, startPlay } from '@/features/explorer/logic/levelPlay';

import {
  PHOTO_NOTE,
  type ChatRequest,
  type LevelOutcome,
  type TutorStreamEvent,
} from '../api-contract';
import type { StartVoiceRequest, TutorService, VoiceSession } from '../TutorService';
import { mockLevelTurn, type MockLevelState } from './levelScripts';
import type { MockConversationService } from '../../conversations/mock/MockConversationService';
import { mockVisualTurn } from './visualScripts';
import { MOCK_STUDENT_LINES, MOCK_TUTOR_LINES } from './voiceScripts';
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

/** Rythme des mots et du niveau de voix de l'appel simulé. */
const LEVEL_TICK_MS = 120;

class MockVoiceSession implements VoiceSession {
  private timers: ReturnType<typeof setTimeout>[] = [];
  private ticker: ReturnType<typeof setInterval> | null = null;
  private muted = false;
  private stopped = false;
  private turn = 0;

  constructor(
    private readonly request: StartVoiceRequest,
    private readonly timing: typeof DEFAULT_VOICE,
    /** Visuels pendant l'appel : pas dans un niveau d'Explorer (X4b). */
    private readonly visuals: boolean,
  ) {
    this.schedule(timing.connectMs, () => {
      request.onEvent({ type: 'connected' });
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
    this.stopTicker();
  }

  private stopTicker() {
    if (this.ticker) clearInterval(this.ticker);
    this.ticker = null;
  }

  /** Fait apparaître une phrase mot à mot sur la durée donnée, avec le niveau de la voix. */
  private speak(speaker: 'tutor' | 'student', text: string, durationMs: number) {
    const words = text.split(' ');
    const ticks = Math.max(1, Math.floor(durationMs / LEVEL_TICK_MS));
    let tick = 0;
    this.stopTicker();
    this.ticker = setInterval(() => {
      tick += 1;
      const shown = Math.min(words.length, Math.ceil((tick / ticks) * words.length));
      const current = words.slice(0, shown).join(' ');
      this.request.onCaption?.({ speaker, text: current, final: shown === words.length });
      if (speaker === 'tutor') {
        // Le logo se pose sur la ponctuation, comme la voix.
        const pause = /[,.?!:]$/.test(words[shown - 1] ?? '');
        this.request.onLevel?.(pause ? 0.15 : 0.45 + 0.4 * Math.abs(Math.sin(tick * 1.7)));
      }
      if (tick >= ticks) this.stopTicker();
    }, LEVEL_TICK_MS);
  }

  /** Le tuteur parle, puis laisse la parole à l'élève, en boucle. */
  private tutorTurn() {
    const line = MOCK_TUTOR_LINES[this.turn % MOCK_TUTOR_LINES.length]!;
    if (this.visuals && line.visual) this.request.onVisual?.(line.visual);
    this.request.onEvent({ type: 'aiStarted' });
    this.speak('tutor', line.text, this.timing.aiSpeakMs);
    this.schedule(this.timing.aiSpeakMs, () => {
      this.request.onLevel?.(0);
      this.request.onEvent({ type: 'aiStopped' });
      this.studentTurn();
    });
  }

  private studentTurn() {
    if (!this.muted) {
      this.request.onEvent({ type: 'userStarted' });
      const line = MOCK_STUDENT_LINES[this.turn % MOCK_STUDENT_LINES.length]!;
      this.speak('student', line, this.timing.userSpeakMs * 0.8);
    }
    this.turn += 1;
    this.schedule(this.timing.userSpeakMs, () => {
      this.request.onEvent({ type: 'userStopped' });
      this.tutorTurn();
    });
  }

  setMuted(muted: boolean) {
    this.muted = muted;
    this.request.onEvent({ type: 'muteChanged', muted });
  }

  holdMicrophone() {
    // Rien à suspendre : l'appel simulé n'utilise pas le micro.
  }

  interrupt() {
    this.clearTimers();
    this.request.onLevel?.(0);
    this.request.onEvent({ type: 'interrupted' });
    this.turn += 1;
    this.schedule(this.timing.userSpeakMs, () => {
      this.request.onEvent({ type: 'userStopped' });
      this.tutorTurn();
    });
  }

  async sendExercisePhoto() {
    this.clearTimers();
    this.request.onEvent({ type: 'userStopped' });
    this.tutorTurn();
  }

  stop() {
    this.stopped = true;
    this.clearTimers();
    this.request.onEvent({ type: 'ended' });
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
      // Comme le serveur : la photo n'est pas gardée, une mention la remplace.
      const recorded = request.image
        ? [PHOTO_NOTE, request.message].filter(Boolean).join('\n')
        : request.message;
      store?.record(conversationId, 'student', recorded, null);
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
        const title = mockTitle(request.message || PHOTO_NOTE);
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
    async startVoiceSession(request: StartVoiceRequest) {
      return new MockVoiceSession(request, voiceTiming, !request.topic.levelId);
    },
    async reportMessage() {
      // Rien à transmettre hors ligne : le signalement est confirmé à l'élève.
    },
  };
}
