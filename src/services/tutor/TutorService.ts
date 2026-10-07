import type { VoiceEvent } from '@/features/tutor/logic/voice';

import type { ChatRequest, TutorStreamEvent, TutorTopic } from './api-contract';

/** Session vocale en cours (simulée ou temps réel). */
export interface VoiceSession {
  setMuted(muted: boolean): void;
  /** Suspend la captation du micro sans changer l'affichage (pendant la prise de photo). */
  holdMicrophone(hold: boolean): void;
  /** Coupe la parole au tuteur. */
  interrupt(): void;
  /** Envoie la photo d'un exercice (data URL JPEG déjà redimensionnée). */
  sendExercisePhoto(dataUrl: string): Promise<void>;
  stop(): void;
}

export type StartVoiceRequest = {
  topic: TutorTopic;
  onEvent: (event: VoiceEvent) => void;
};

/**
 * Tuteur IA, derrière une interface : les écrans ne savent pas s'ils parlent au vrai tuteur
 * (via le serveur intermédiaire) ou à la version simulée (tests, hors ligne, développement).
 */
export interface TutorService {
  readonly kind: 'live' | 'mock';
  /** Envoie un message et renvoie la réponse en flux. */
  sendMessage(request: ChatRequest, signal?: AbortSignal): AsyncIterable<TutorStreamEvent>;
  startVoiceSession(request: StartVoiceRequest): Promise<VoiceSession>;
  /** Signale une réponse inappropriée du tuteur. */
  reportMessage(excerpt: string, topic: TutorTopic): Promise<void>;
  /**
   * Oublie la conversation en cours sur ce sujet : le prochain message ouvre une nouvelle séance
   * (une nouvelle partie, pour un niveau d'Explorer).
   */
  forgetConversation(topic: TutorTopic): void;
}
