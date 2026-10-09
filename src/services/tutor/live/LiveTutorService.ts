import { logError } from '@/lib/logger';

import type { ChatRequest, ReportRequest, TutorStreamEvent, TutorTopic } from '../api-contract';
import type { StartVoiceRequest, TutorService } from '../TutorService';
import { postTutor, TutorHttpError } from './http';
import { readNdjson } from './ndjson';
import { startRealtimeVoiceSession } from './realtimeVoice';

/**
 * Silence maximal pendant une réponse en flux : un tour de niveau enchaîne modération, deux passages
 * du modèle et enregistrement, plus long qu'une simple réponse, mais jamais muet si longtemps.
 */
const STREAM_IDLE_MS = 30_000;

/** Vrai tuteur : toutes les requêtes passent par le serveur intermédiaire (jamais la clé OpenAI). */
export function createLiveTutorService(): TutorService {
  return {
    kind: 'live',
    async *sendMessage(
      request: ChatRequest,
      signal?: AbortSignal,
    ): AsyncIterable<TutorStreamEvent> {
      // La réponse est abandonnée si le serveur se tait trop longtemps (pas si elle est longue).
      const idle = new AbortController();
      let timer: ReturnType<typeof setTimeout> | undefined;
      const watch = () => {
        clearTimeout(timer);
        timer = setTimeout(() => idle.abort(), STREAM_IDLE_MS);
      };
      let response: Response;
      try {
        // La discussion ouverte est connue de l'écran ; le serveur en relit l'historique.
        response = await postTutor(
          '/api/tutor/chat',
          request,
          signal ? AbortSignal.any([signal, idle.signal]) : idle.signal,
        );
      } catch (error) {
        if (error instanceof TutorHttpError) yield { type: 'error', code: error.code };
        return;
      }
      if (!response.body) {
        yield { type: 'error', code: 'upstream' };
        return;
      }
      try {
        watch();
        for await (const event of readNdjson(response.body)) {
          watch();
          yield event;
        }
      } catch (error) {
        if (signal?.aborted) return;
        logError('tutor.stream', error);
        yield { type: 'error', code: idle.signal.aborted ? 'timeout' : 'network' };
      } finally {
        clearTimeout(timer);
      }
    },
    async startVoiceSession(request: StartVoiceRequest) {
      const session = await startRealtimeVoiceSession(request);
      // Fin de l'appel déclarée au serveur, qui compte la durée (plafonnée à 10 min).
      return {
        setMuted: (muted) => session.setMuted(muted),
        holdMicrophone: (hold) => session.holdMicrophone(hold),
        interrupt: () => session.interrupt(),
        sendExercisePhoto: (dataUrl) => session.sendExercisePhoto(dataUrl),
        stop: () => {
          session.stop();
          postTutor('/api/tutor/voice/end', {}).catch((error: unknown) =>
            logError('tutor.voiceEnd', error),
          );
        },
      };
    },
    async reportMessage(excerpt: string, topic: TutorTopic) {
      const body: ReportRequest = { excerpt: excerpt.slice(0, 500), topic };
      try {
        await postTutor('/api/tutor/report', body);
      } catch (error) {
        // Le signalement est confirmé à l'élève dans tous les cas ; l'échec est journalisé.
        logError('tutor.report', error);
      }
    },
  };
}
