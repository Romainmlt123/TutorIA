/**
 * Contrat entre l'app et le serveur intermédiaire (src/app/api/tutor/*).
 * Types seulement : partagés par l'app et par server/, sans dépendance.
 */
import type { SubjectId } from '@/data/types';

import type { TutorVisual } from './visuals';

/**
 * Sujet d'une discussion. `levelId` : niveau d'Explorer (île, ville, niveau) ; le serveur en déduit
 * seul le type, la notion et les consignes du tuteur. L'app n'envoie jamais de consigne.
 */
/**
 * Sujet d'une discussion. Chat libre : ni matière ni chapitre (« toutes matières »), ou une matière
 * choisie par l'élève. Un chapitre (lien depuis l'accueil, les révisions) ou un niveau d'Explorer
 * précise le sujet ; un niveau exige son chapitre.
 */
export type TutorTopic = { subjectId?: SubjectId; chapterId?: string; levelId?: string };

/** Bilan d'un niveau d'Explorer, calculé par le serveur à partir des réponses enregistrées. */
export type LevelOutcome = {
  levelId: string;
  /** De 0 à 1. */
  score: number;
  stars: 0 | 1 | 2 | 3;
  passed: boolean;
  xp: number;
  /** Réponses justes et nombre de questions (« 5 sur 8 ») ; étapes réussies pour une leçon. */
  correct: number;
  total: number;
};

export type ChatTurn = { role: 'student' | 'tutor'; text: string };

/**
 * Requête du tuteur écrit. L'historique est relu en base par le serveur à partir de `conversationId` :
 * `history` n'est plus utilisé (gardé pour la version simulée et le mode hors ligne).
 */
export type ChatRequest = {
  topic: TutorTopic;
  history: readonly ChatTurn[];
  /** Peut être vide quand une photo est jointe. */
  message: string;
  conversationId?: string;
  /**
   * Photo d'un exercice (C4), en data URL JPEG ou PNG réduite sur l'appareil. Modérée par le
   * serveur, envoyée au modèle, jamais enregistrée ; refusée dans une évaluation d'Explorer.
   */
  image?: string;
};

/** Ce qui est enregistré (et relu) à la place d'une photo, qui n'est jamais gardée. */
export const PHOTO_NOTE = '📷 Photo de l’exercice';
/** Accompagne une photo envoyée sans texte, pour que le tuteur sache ce qu'il regarde. */
export const PHOTO_CAPTION = 'Voici la photo de mon exercice.';

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
  /** Niveau d'Explorer : étape, exercice ou question validés (barre de progression). */
  | { type: 'step'; done: number; total: number }
  /** Niveau d'Explorer terminé : vers le bilan (X5, X5b). */
  | { type: 'levelResult'; outcome: LevelOutcome }
  /** Visuel validé et modéré, attaché à la réponse en cours (2C, 2E). */
  | { type: 'visual'; visual: TutorVisual }
  /** Titre d'une nouvelle discussion libre, donné après le premier échange (volet). */
  /** Titre de la nouvelle discussion, et sa matière si le modèle en a reconnu une (chat libre). */
  | { type: 'title'; title: string; subjectId?: SubjectId }
  | { type: 'error'; code: TutorErrorCode };

export type ErrorResponse = { error: TutorErrorCode };

export type RealtimeSessionRequest = { topic: TutorTopic };
export type RealtimeSessionResponse = { clientSecret: string; expiresAt: number };

/** Visuel demandé par le tuteur pendant un appel vocal : l'appel d'outil tel que reçu (2D, 2F). */
export type VisualCheckRequest = { name: string; arguments: string };
/** Le visuel validé et modéré par le serveur, prêt à être dessiné. */
export type VisualCheckResponse = { visual: TutorVisual };

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
