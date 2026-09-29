import { logError } from '@/lib/logger';

import type { ChatRequest, ReportRequest, TutorStreamEvent, TutorTopic } from '../api-contract';
import type { StartVoiceRequest, TutorService } from '../TutorService';
import { postTutor, TutorHttpError } from './http';
import { readNdjson } from './ndjson';
import { startRealtimeVoiceSession } from './realtimeVoice';

const topicKey = (topic: TutorTopic) => `${topic.subjectId}/${topic.chapterId}`;

/** Vrai tuteur : toutes les requêtes passent par le serveur intermédiaire (jamais la clé OpenAI). */
export function createLiveTutorService(): TutorService {
  // Une conversation par chapitre tant que l'app est ouverte : le serveur en relit l'historique.
  const conversations = new Map<string, string>();
  return {
    kind: 'live',
    async *sendMessage(
      request: ChatRequest,
      signal?: AbortSignal,
    ): AsyncIterable<TutorStreamEvent> {
      const key = topicKey(request.topic);
      let response: Response;
      try {
        response = await postTutor(
          '/api/tutor/chat',
          { ...request, conversationId: conversations.get(key) },
          signal,
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
        for await (const event of readNdjson(response.body)) {
          if (event.type === 'conversation') conversations.set(key, event.id);
          else yield event;
        }
      } catch (error) {
        if (signal?.aborted) return;
        logError('tutor.stream', error);
        yield { type: 'error', code: 'network' };
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
