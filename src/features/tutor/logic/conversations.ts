import { addDays, parisDay } from '@/lib/parisTime';
import type { ConversationSummary, StoredMessage } from '@/services/conversations';
import type { TutorTopic } from '@/services/tutor';

import type { ChatMessage } from '../hooks/useTutorChat';

/** Un conseil de méthode peut suivre la réponse, sur une ligne « Conseil : … ». */
const TIP_LINE = /\n+\s*Conseil\s*:\s*/i;

/** Sépare la réponse du tuteur de son conseil de méthode, affiché à part. */
export function splitTip(text: string): { answer: string; tip?: string } {
  const [answer = '', tip] = text.split(TIP_LINE);
  return tip?.trim() ? { answer: answer.trim(), tip: tip.trim() } : { answer: answer.trim() };
}

/** Messages enregistrés d'une discussion, tels que la discussion les affiche. */
export function chatMessagesOf(stored: readonly StoredMessage[]): ChatMessage[] {
  return stored.flatMap((m): ChatMessage[] => {
    if (m.role === 'student') return [{ id: m.id, kind: 'student', text: m.content }];
    const { answer, tip } = splitTip(m.content);
    const reply: ChatMessage = { id: m.id, kind: 'tutor', text: answer };
    if (m.visual) reply.visual = m.visual;
    return tip ? [reply, { id: `${m.id}-tip`, kind: 'tip', text: tip }] : [reply];
  });
}

export type ConversationGroup = 'today' | 'yesterday' | 'week' | 'older';

/** Discussions du volet, rangées par jour (heure de Paris), les plus récentes d'abord. */
export function groupConversations(
  conversations: readonly ConversationSummary[],
  now: Date,
): { group: ConversationGroup; conversations: ConversationSummary[] }[] {
  const today = parisDay(now);
  const yesterday = addDays(today, -1);
  const weekStart = addDays(today, -7);
  const groupOf = (c: ConversationSummary): ConversationGroup => {
    const day = parisDay(new Date(c.lastMessageAt));
    if (day >= today) return 'today';
    if (day === yesterday) return 'yesterday';
    return day > weekStart ? 'week' : 'older';
  };
  const order: ConversationGroup[] = ['today', 'yesterday', 'week', 'older'];
  const sorted = [...conversations].sort((a, b) => b.lastMessageAt.localeCompare(a.lastMessageAt));
  return order
    .map((group) => ({ group, conversations: sorted.filter((c) => groupOf(c) === group) }))
    .filter((g) => g.conversations.length > 0);
}

/** Discussion affichée par le tuteur écrit ; une nouvelle clé ouvre une nouvelle discussion. */
export type ChatEntry = {
  key: string;
  topic: TutorTopic;
  /** Connu dès que le serveur a ouvert la discussion. */
  conversationId?: string;
  title?: string | null;
  /** Discussion enregistrée, dont les messages sont relus avant de l'afficher. */
  stored: boolean;
};

export function storedEntry(conversation: ConversationSummary): ChatEntry {
  return {
    key: conversation.id,
    conversationId: conversation.id,
    topic: {
      ...(conversation.subjectId ? { subjectId: conversation.subjectId } : {}),
      ...(conversation.chapterId ? { chapterId: conversation.chapterId } : {}),
    },
    title: conversation.title,
    stored: true,
  };
}

/**
 * Discussion demandée par l'adresse de l'écran : avec `reprendre`, la plus récente (sur le chapitre
 * demandé s'il y en a un), sinon une nouvelle sur le sujet demandé. Rend null tant que la liste des
 * discussions est attendue.
 */
export function entryOfParams(
  resume: boolean,
  topic: TutorTopic,
  conversations: readonly ConversationSummary[] | undefined,
): ChatEntry | null {
  const fresh: ChatEntry = { key: `new:${JSON.stringify(topic)}`, topic, stored: false };
  if (!resume) return fresh;
  if (!conversations) return null;
  const latest = [...conversations]
    .sort((a, b) => b.lastMessageAt.localeCompare(a.lastMessageAt))
    .find((c) => !topic.chapterId || c.chapterId === topic.chapterId);
  return latest ? storedEntry(latest) : fresh;
}
