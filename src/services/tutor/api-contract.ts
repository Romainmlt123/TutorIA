/**
 * Contrat entre l'app et le serveur intermédiaire (src/app/api/tutor/*).
 * Types seulement : partagés par l'app et par server/, sans dépendance.
 */
import type { SubjectId } from '@/data/types';

export type TutorTopic = { subjectId: SubjectId; chapterId: string };

export type ChatTurn = { role: 'student' | 'tutor'; text: string };

/**
 * Requête du tuteur écrit. L'historique est relu en base par le serveur à partir de `conversationId` :
 * `history` n'est plus utilisé (gardé pour la version simulée et le mode hors ligne).
 */
export type ChatRequest = {
  topic: TutorTopic;
  history: readonly ChatTurn[];
  message: string;
  conversationId?: string;
};

export type TutorErrorCode =
  | 'bad_request'
  | 'unauthorized'
  | 'consent_required'
  | 'not_allowed'
  | 'paused'
  | 'too_long'
  | 'rate_limited'
  | 'flagged'
  | 'distress'
  | 'timeout'
  | 'upstream'
  | 'network';

/** Événements du flux NDJSON renvoyé par POST /api/tutor/chat (une ligne JSON par événement). */
export type TutorStreamEvent =
  /** Premier événement d'une nouvelle conversation : son identifiant, à renvoyer ensuite. */
  | { type: 'conversation'; id: string }
  | { type: 'delta'; text: string }
  | { type: 'done' }
  | { type: 'retract' }
  | { type: 'error'; code: TutorErrorCode };

export type ErrorResponse = { error: TutorErrorCode };

export type RealtimeSessionRequest = { topic: TutorTopic };
export type RealtimeSessionResponse = { clientSecret: string; expiresAt: number };

export type ImageCheckRequest = { dataUrl: string };
export type ImageCheckResponse = { ok: true };

export type ReportRequest = { excerpt: string; topic: TutorTopic };

/** Limites communes : l'app les affiche, le serveur les impose. */
export const TUTOR_LIMITS = {
  messageMaxChars: 500,
  historyMaxTurns: 10,
  historyMaxChars: 4000,
  /** Photo en data URL : le canal de données WebRTC refuse les messages de plus de 256 Ko. */
  imageMaxBytes: 200_000,
  photosPerCall: 3,
  voiceCallMaxMs: 10 * 60 * 1000,
} as const;
