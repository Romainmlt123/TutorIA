import { levelById } from '@/features/explorer/content';
import { applyCalls, startPlay } from '@/features/explorer/logic/levelPlay';
import type { VoiceEvent } from '@/features/tutor/logic/voice';

import type { ChatRequest, TutorStreamEvent } from '../api-contract';
import type { StartVoiceRequest, TutorService, VoiceSession } from '../TutorService';
import { mockLevelTurn, type MockLevelState } from './levelScripts';
import { scriptedReply } from './scripts';

export type MockOptions = {
  /** Délai entre deux morceaux du faux flux (ms). */
  chunkDelayMs?: number;
  /** Durées de l'appel simulé (ms), comme la maquette 02b : 7 s de parole, 5 s d'écoute. */
  voice?: { connectMs: number; aiSpeakMs: number; userSpeakMs: number };
};

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

  // Niveaux d'Explorer en cours, par niveau : un niveau terminé recommence au message suivant.
  const levels = new Map<string, MockLevelState>();

  return {
    kind: 'mock',
    async *sendMessage(
      request: ChatRequest,
      signal?: AbortSignal,
    ): AsyncIterable<TutorStreamEvent> {
      const place = request.topic.levelId ? levelById(request.topic.levelId) : undefined;
      let state: MockLevelState | undefined;
      let reply = scriptedReply(request);
      let calls: ReturnType<typeof mockLevelTurn>['calls'] = [];
      if (place) {
        const previous = levels.get(place.level.id);
        state =
          previous && !previous.play.finished
            ? previous
            : { play: startPlay(place.level.id), hintGiven: false };
        const turn = mockLevelTurn(place, state, request.message);
        reply = turn.reply;
        calls = turn.calls;
        state = { ...state, hintGiven: turn.hintGiven };
      }

      await wait(chunkDelayMs * 6, signal);
      for (const chunk of chunkText(reply)) {
        if (signal?.aborted) return;
        yield { type: 'delta', text: chunk };
        await wait(chunkDelayMs, signal);
      }
      if (signal?.aborted) return;

      // Mêmes règles que le serveur : jugements plafonnés, progression et bilan calculés ici.
      if (place && state) {
        const result = applyCalls(place.level, state.play, calls);
        levels.set(place.level.id, { ...state, play: result.play });
        if (result.progressed) {
          const done =
            place.level.type === 'lecon' ? result.play.stepsDone : result.play.answers.length;
          yield { type: 'step', done, total: place.level.steps };
        }
        if (result.outcome) yield { type: 'levelResult', outcome: result.outcome };
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
