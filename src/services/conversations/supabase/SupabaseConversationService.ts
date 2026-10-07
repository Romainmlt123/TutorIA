import type { AppSupabaseClient } from '../../supabase/client';
import type { TutorVisual } from '../../tutor/visuals';
import type {
  ConversationService,
  ConversationSummary,
  StoredMessage,
} from '../ConversationService';

/** Discussions affichées dans le volet : les plus récentes. */
const LIST_LIMIT = 50;
/** Messages relus pour rouvrir une discussion (conservés 6 mois). */
const MESSAGES_LIMIT = 200;

/** Discussions lues en base, sous RLS (l'élève seulement). */
export class SupabaseConversationService implements ConversationService {
  constructor(private readonly supabase: AppSupabaseClient) {}

  async list(): Promise<readonly ConversationSummary[]> {
    const { data, error } = await this.supabase
      .from('conversations')
      .select(
        'id, title, last_message_at, study_sessions!conversations_session_fkey!inner(subject_id, chapter_id, level_id)',
      )
      .is('study_sessions.level_id', null)
      .order('last_message_at', { ascending: false })
      .limit(LIST_LIMIT);
    if (error) throw error;
    return data.map((row) => ({
      id: row.id,
      title: row.title,
      subjectId: row.study_sessions.subject_id,
      chapterId: row.study_sessions.chapter_id,
      lastMessageAt: row.last_message_at,
    }));
  }

  async messages(conversationId: string): Promise<readonly StoredMessage[]> {
    const { data, error } = await this.supabase
      .from('messages')
      .select('id, role, content, visual, created_at')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true })
      .limit(MESSAGES_LIMIT);
    if (error) throw error;
    return data.map((row) => ({
      id: row.id,
      role: row.role,
      content: row.content,
      // Écrit par le serveur après validation : il a la forme d'un visuel.
      visual: (row.visual as unknown as TutorVisual | null) ?? null,
      createdAt: row.created_at,
    }));
  }

  async remove(conversationId: string): Promise<void> {
    const { error } = await this.supabase.from('conversations').delete().eq('id', conversationId);
    if (error) throw error;
  }
}
