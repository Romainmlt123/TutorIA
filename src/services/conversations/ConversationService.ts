import type { SubjectId } from '@/data/types';

import type { TutorVisual } from '../tutor/visuals';

/** Une discussion libre avec le tuteur, dans le volet (les parties des niveaux n'y sont pas). */
export type ConversationSummary = {
  id: string;
  /** Titre donné par le serveur après le premier échange ; null juste avant. */
  title: string | null;
  subjectId: SubjectId | null;
  chapterId: string | null;
  lastMessageAt: string;
};

/** Message enregistré, relu pour rouvrir une discussion. */
export type StoredMessage = {
  id: string;
  role: 'student' | 'tutor';
  content: string;
  visual: TutorVisual | null;
  createdAt: string;
};

/**
 * Discussions libres de l'élève connecté : la liste du volet, les messages d'une discussion, et sa
 * suppression (avec ses messages). Les parents n'y ont jamais accès.
 */
export interface ConversationService {
  list(): Promise<readonly ConversationSummary[]>;
  messages(conversationId: string): Promise<readonly StoredMessage[]>;
  remove(conversationId: string): Promise<void>;
}
