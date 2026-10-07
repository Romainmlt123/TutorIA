import { z } from 'zod';

import { TUTOR_LIMITS, type ChatTurn, type TutorTopic } from '@/services/tutor/api-contract';

import type { Json } from '@/services/db/database.types';
import type { TutorVisual } from '@/services/tutor/visuals';

import { serverLog } from '../log';
import type { AdminClient } from '../supabase';
import { sessionToolOf, visualSummary } from './visuals';

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
    .select('role, content, visual')
    .eq('conversation_id', conversationId)
    .eq('student_id', studentId)
    .order('created_at', { ascending: false })
    .limit(TUTOR_LIMITS.historyMaxTurns);
  if (error) throw error;
  const history: ChatTurn[] = [];
  let total = 0;
  for (const message of data) {
    // Le tuteur se souvient du visuel qu'il a montré : un rappel suit son message.
    const visual = message.visual as TutorVisual | null;
    const text = visual ? `${message.content}\n${visualSummary(visual)}` : message.content;
    if (total + text.length > TUTOR_LIMITS.historyMaxChars) break;
    total += text.length;
    history.unshift({ role: message.role, text });
  }
  return history;
}

/**
 * Conversation du tuteur écrit : reprise si l'identifiant appartient à l'élève et au même sujet
 * (chapitre et niveau d'Explorer), sinon nouvelle séance écrite et nouvelle conversation.
 * `null` : identifiant inconnu, ou conversation d'un autre sujet.
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
      .select(
        'id, session_id, study_sessions!conversations_session_fkey(started_at, chapter_id, level_id)',
      )
      .eq('id', conversationId as string)
      .eq('student_id', studentId)
      .maybeSingle();
    if (error) throw error;
    const session = data?.study_sessions;
    if (!session) return null;
    // Une partie d'un niveau ne se poursuit pas dans un autre niveau ni dans une discussion libre.
    if (session.chapter_id !== topic.chapterId || session.level_id !== (topic.levelId ?? null)) {
      return null;
    }
    return {
      id: data.id,
      sessionId: data.session_id,
      startedAt: session.started_at,
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
      level_id: topic.levelId ?? null,
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
  /** Visuel validé du tuteur, gardé avec son message. */
  visual: TutorVisual | null = null,
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
      visual: visual as unknown as Json,
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
  if (visual) await addSessionTool(admin, conversation.sessionId, sessionToolOf(visual));
}

/** Note l'outil sur la séance (graphique ou tableau blanc), affiché aux parents dans P3. */
async function addSessionTool(
  admin: AdminClient,
  sessionId: string,
  tool: 'graph' | 'whiteboard',
): Promise<void> {
  const { data, error } = await admin
    .from('study_sessions')
    .select('tools')
    .eq('id', sessionId)
    .maybeSingle();
  if (error || !data) {
    if (error) serverLog.error('tutor.session_tool', error);
    return;
  }
  if (data.tools.includes(tool)) return;
  const update = await admin
    .from('study_sessions')
    .update({ tools: [...data.tools, tool] })
    .eq('id', sessionId);
  if (update.error) serverLog.error('tutor.session_tool', update.error);
}
