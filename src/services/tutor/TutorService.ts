import type { VoiceEvent } from '@/features/tutor/logic/voice';

import type { ChatRequest, TutorStreamEvent, TutorTopic } from './api-contract';
import type { TutorVisual } from './visuals';

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

/** Sous-titre de l'appel : la phrase en cours, complétée au fil de la transcription (v2.6). */
export type VoiceCaption = { speaker: 'tutor' | 'student'; text: string; final: boolean };

export type StartVoiceRequest = {
  topic: TutorTopic;
  onEvent: (event: VoiceEvent) => void;
  /** Transcription du tuteur et de l'élève, pour les sous-titres. */
  onCaption?: (caption: VoiceCaption) => void;
  /** Niveau de la voix du tuteur, de 0 à 1, une dizaine de fois par seconde (logo qui rebondit). */
  onLevel?: (level: number) => void;
  /** Visuel montré par le tuteur, validé et modéré par le serveur (2D, 2F). */
  onVisual?: (visual: TutorVisual) => void;
};

/**
 * Tuteur IA, derrière une interface : les écrans ne savent pas s'ils parlent au vrai tuteur
 * (via le serveur intermédiaire) ou à la version simulée (tests, hors ligne, développement).
 */
export interface TutorService {
  readonly kind: 'live' | 'mock';
  /**
   * Envoie un message et renvoie la réponse en flux. Sans `conversationId`, le message ouvre une
   * nouvelle discussion, dont l'identifiant arrive dans le flux (`conversation`).
   */
  sendMessage(request: ChatRequest, signal?: AbortSignal): AsyncIterable<TutorStreamEvent>;
  startVoiceSession(request: StartVoiceRequest): Promise<VoiceSession>;
  /** Signale une réponse inappropriée du tuteur. */
  reportMessage(excerpt: string, topic: TutorTopic): Promise<void>;
}
