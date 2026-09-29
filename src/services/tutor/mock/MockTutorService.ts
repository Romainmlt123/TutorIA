import type { VoiceEvent } from '@/features/tutor/logic/voice';

import type { ChatRequest, TutorStreamEvent } from '../api-contract';
import type { StartVoiceRequest, TutorService, VoiceSession } from '../TutorService';
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

  return {
    kind: 'mock',
    async *sendMessage(
      request: ChatRequest,
      signal?: AbortSignal,
    ): AsyncIterable<TutorStreamEvent> {
      await wait(chunkDelayMs * 6, signal);
      for (const chunk of chunkText(scriptedReply(request))) {
        if (signal?.aborted) return;
        yield { type: 'delta', text: chunk };
        await wait(chunkDelayMs, signal);
      }
      if (!signal?.aborted) yield { type: 'done' };
    },
    async startVoiceSession({ onEvent }: StartVoiceRequest) {
      return new MockVoiceSession(onEvent, voiceTiming);
    },
    async reportMessage() {
      // Rien à transmettre hors ligne : le signalement est confirmé à l'élève.
    },
  };
}
