import { z } from 'zod';

import { TUTOR_LIMITS, type ChatTurn, type TutorTopic } from '@/services/tutor/api-contract';

import { serverLog } from '../log';
import type { AdminClient } from '../supabase';

/** Durée maximale comptée pour une séance écrite (même plafond qu'en base). */
const MAX_WRITTEN_SECONDS = 3600;

export type Conversation = {
  id: string;
  sessionId: string;
  startedAt: string;
  created: boolean;
  history: ChatTurn[];
};

const uuid = z.uuid();

/** Derniers échanges de la conversation, relus en base (l'app ne peut pas les réécrire). */
async function historyOf(admin: AdminClient, conversationId: string, studentId: string) {
  const { data, error } = await admin
    .from('messages')
    .select('role, content')
    .eq('conversation_id', conversationId)
    .eq('student_id', studentId)
    .order('created_at', { ascending: false })
    .limit(TUTOR_LIMITS.historyMaxTurns);
  if (error) throw error;
  const history: ChatTurn[] = [];
  let total = 0;
  for (const message of data) {
    if (total + message.content.length > TUTOR_LIMITS.historyMaxChars) break;
    total += message.content.length;
    history.unshift({ role: message.role, text: message.content });
  }
  return history;
}

/**
 * Conversation du tuteur écrit : reprise si l'identifiant appartient à l'élève,
 * sinon nouvelle séance écrite et nouvelle conversation. `null` : identifiant inconnu.
 */
export async function openConversation(
  admin: AdminClient,
  studentId: string,
  topic: TutorTopic,
  conversationId: unknown,
): Promise<Conversation | null> {
  if (conversationId !== undefined) {
    if (!uuid.safeParse(conversationId).success) return null;
    const { data, error } = await admin
      .from('conversations')
      .select('id, session_id, study_sessions!conversations_session_fkey(started_at)')
      .eq('id', conversationId as string)
      .eq('student_id', studentId)
      .maybeSingle();
    if (error) throw error;
    if (!data?.study_sessions) return null;
    return {
      id: data.id,
      sessionId: data.session_id,
      startedAt: data.study_sessions.started_at,
      created: false,
      history: await historyOf(admin, data.id, studentId),
    };
  }

  const session = await admin
    .from('study_sessions')
    .insert({
      student_id: studentId,
      mode: 'written',
      subject_id: topic.subjectId,
      chapter_id: topic.chapterId,
    })
    .select('id, started_at')
    .single();
  if (session.error) throw session.error;
  const conversation = await admin
    .from('conversations')
    .insert({ student_id: studentId, session_id: session.data.id })
    .select('id')
    .single();
  if (conversation.error) throw conversation.error;
  return {
    id: conversation.data.id,
    sessionId: session.data.id,
    startedAt: session.data.started_at,
    created: true,
    history: [],
  };
}

/** Enregistre un message (déjà masqué des données personnelles) et prolonge la séance. */
export async function recordMessage(
  admin: AdminClient,
  conversation: Conversation,
  studentId: string,
  role: ChatTurn['role'],
  content: string,
): Promise<void> {
  const now = new Date();
  const seconds = Math.min(
    MAX_WRITTEN_SECONDS,
    Math.max(0, Math.round((now.getTime() - Date.parse(conversation.startedAt)) / 1000)),
  );
  const results = await Promise.all([
    admin.from('messages').insert({
      conversation_id: conversation.id,
      student_id: studentId,
      role,
      content: content.slice(0, 4000),
    }),
    admin
      .from('conversations')
      .update({ last_message_at: now.toISOString() })
      .eq('id', conversation.id),
    admin
      .from('study_sessions')
      .update({ ended_at: now.toISOString(), duration_seconds: seconds })
      .eq('id', conversation.sessionId),
  ]);
  for (const result of results) {
    if (result.error) serverLog.error('tutor.record', result.error);
  }
}
