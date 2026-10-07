import { z } from 'zod';

import type { SubjectId } from '@/data/types';
import { TUTOR_LIMITS, type ChatTurn, type TutorTopic } from '@/services/tutor/api-contract';

import type { Json } from '@/services/db/database.types';
import type { TutorVisual } from '@/services/tutor/visuals';

import { serverLog } from '../log';
import type { AdminClient } from '../supabase';
import { sessionToolOf, visualSummary } from './visuals';

/** Durée maximale comptée pour une séance écrite (même plafond qu'en base). */
const MAX_WRITTEN_SECONDS = 3600;
/**
 * Au-delà de 30 minutes sans message, rouvrir une discussion commence une nouvelle séance : la
 * pause (une nuit, une semaine) ne compte pas comme du temps de travail.
 */
const RESUME_GAP_MS = 30 * 60_000;

export type Conversation = {
  id: string;
  sessionId: string;
  startedAt: string;
  created: boolean;
  /** Sans titre : nouvelle discussion, ou discussion ouverte avant les titres (chantier 4). */
  untitled: boolean;
  history: ChatTurn[];
  /** Sujet de la discussion, relu en base quand elle est rouverte (il fait foi). */
  topic: TutorTopic;
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

/** Nouvelle séance écrite sur ce sujet. */
async function newSession(admin: AdminClient, studentId: string, topic: TutorTopic) {
  const { data, error } = await admin
    .from('study_sessions')
    .insert({
      student_id: studentId,
      mode: 'written',
      subject_id: topic.subjectId ?? null,
      chapter_id: topic.chapterId ?? null,
      level_id: topic.levelId ?? null,
    })
    .select('id, started_at')
    .single();
  if (error) throw error;
  return data;
}

/**
 * Conversation du tuteur écrit : reprise si l'identifiant appartient à l'élève, sinon nouvelle
 * séance écrite et nouvelle conversation. Une discussion libre rouverte garde le sujet enregistré
 * avec elle ; la partie d'un niveau d'Explorer ne se reprend que sur ce même niveau. Après une
 * pause, la discussion rouverte commence une nouvelle séance. `null` : identifiant inconnu, ou
 * partie d'un autre niveau.
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
        'id, session_id, title, last_message_at, study_sessions!conversations_session_fkey(started_at, subject_id, chapter_id, level_id)',
      )
      .eq('id', conversationId as string)
      .eq('student_id', studentId)
      .maybeSingle();
    if (error) throw error;
    const session = data?.study_sessions;
    if (!session) return null;
    // Une partie d'un niveau ne se poursuit pas dans un autre niveau ni dans une discussion libre.
    if (
      (topic.levelId || session.level_id) &&
      (session.chapter_id !== (topic.chapterId ?? null) ||
        session.level_id !== (topic.levelId ?? null))
    ) {
      return null;
    }
    const stored: TutorTopic = {
      subjectId: session.subject_id ?? undefined,
      chapterId: session.chapter_id ?? undefined,
      levelId: session.level_id ?? undefined,
    };
    let sessionId = data.session_id;
    let startedAt = session.started_at;
    if (Date.now() - Date.parse(data.last_message_at) > RESUME_GAP_MS) {
      const fresh = await newSession(admin, studentId, stored);
      const moved = await admin
        .from('conversations')
        .update({ session_id: fresh.id })
        .eq('id', data.id)
        .eq('student_id', studentId);
      if (moved.error) throw moved.error;
      sessionId = fresh.id;
      startedAt = fresh.started_at;
    }
    return {
      id: data.id,
      sessionId,
      startedAt,
      created: false,
      untitled: !data.title,
      history: await historyOf(admin, data.id, studentId),
      topic: stored,
    };
  }

  const session = await newSession(admin, studentId, topic);
  const conversation = await admin
    .from('conversations')
    .insert({ student_id: studentId, session_id: session.id })
    .select('id')
    .single();
  if (conversation.error) throw conversation.error;
  return {
    id: conversation.data.id,
    sessionId: session.id,
    startedAt: session.started_at,
    created: true,
    untitled: true,
    history: [],
    topic,
  };
}

/**
 * Titre de la discussion, et matière reconnue par le modèle : elle est écrite dans la séance, que
 * le tuteur relit aux messages suivants (une discussion libre seulement, sans matière ni chapitre).
 */
export async function nameConversation(
  admin: AdminClient,
  conversation: Conversation,
  title: string,
  subjectId: SubjectId | undefined,
): Promise<void> {
  const { error } = await admin.from('conversations').update({ title }).eq('id', conversation.id);
  if (error) serverLog.error('tutor.title', error);
  if (!subjectId) return;
  const session = await admin
    .from('study_sessions')
    .update({ subject_id: subjectId })
    .eq('id', conversation.sessionId);
  if (session.error) serverLog.error('tutor.subject', session.error);
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
