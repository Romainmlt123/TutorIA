import type { SubjectId } from '@/data/types';

import type { TutorVisual } from '../../tutor/visuals';
import type {
  ConversationService,
  ConversationSummary,
  StoredMessage,
} from '../ConversationService';

type MockConversation = ConversationSummary & { messages: StoredMessage[] };

type MockSeed = {
  title: string;
  subjectId: SubjectId;
  chapterId: string;
  messages: readonly { role: StoredMessage['role']; content: string }[];
};

/**
 * Discussions simulées, en mémoire : le tuteur simulé les remplit (mode tout simulé), le volet les
 * lit. Rien n'est gardé après la fermeture de l'app.
 */
export class MockConversationService implements ConversationService {
  private conversations = new Map<string, MockConversation>();
  private counter = 0;

  /** `seed` : discussions déjà commencées, comme celle de la maquette 02a. */
  constructor(seed: readonly MockSeed[] = []) {
    for (const conversation of seed) {
      const id = this.create(conversation.subjectId, conversation.chapterId);
      for (const m of conversation.messages) this.record(id, m.role, m.content, null);
      this.setTitle(id, conversation.title);
    }
  }

  /** Nouvelle discussion (tuteur simulé) ; rend son identifiant. */
  create(subjectId: SubjectId | null, chapterId: string | null): string {
    const id = `mock-conversation-${++this.counter}`;
    this.conversations.set(id, {
      id,
      title: null,
      subjectId,
      chapterId,
      lastMessageAt: new Date().toISOString(),
      messages: [],
    });
    return id;
  }

  record(id: string, role: StoredMessage['role'], content: string, visual: TutorVisual | null) {
    const conversation = this.conversations.get(id);
    if (!conversation) return;
    const now = new Date().toISOString();
    conversation.messages.push({
      id: `${id}-${conversation.messages.length}`,
      role,
      content,
      visual,
      createdAt: now,
    });
    conversation.lastMessageAt = now;
  }

  /** Titre, et matière reconnue (seulement si la discussion n'en avait pas). */
  setTitle(id: string, title: string, subjectId?: SubjectId) {
    const conversation = this.conversations.get(id);
    if (!conversation) return;
    conversation.title = title;
    if (subjectId && !conversation.subjectId) conversation.subjectId = subjectId;
  }

  has(id: string): boolean {
    return this.conversations.has(id);
  }

  async list(): Promise<readonly ConversationSummary[]> {
    return [...this.conversations.values()]
      .sort((a, b) => b.lastMessageAt.localeCompare(a.lastMessageAt))
      .map(({ messages: _messages, ...summary }) => summary);
  }

  async messages(conversationId: string): Promise<readonly StoredMessage[]> {
    return this.conversations.get(conversationId)?.messages ?? [];
  }

  async remove(conversationId: string): Promise<void> {
    this.conversations.delete(conversationId);
  }
}
