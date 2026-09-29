import type OpenAI from 'openai';
import { z } from 'zod';

import { chapterTitle } from '@/data/curriculum';
import { addDays, parisDay } from '@/lib/parisTime';

import { requireUser, type AuthenticatedUser } from '../auth';
import { getServerEnv } from '../env';
import { moderateText } from '../guards/moderation';
import { consumeSharedLimits, DAY, HOUR } from '../guards/sharedRateLimit';
import { errorResponse, jsonResponse, parseJsonBody, sha256 } from '../http';
import { serverLog } from '../log';
import { getOpenAI } from '../openai';
import { getAdminClient, type AdminClient } from '../supabase';

type SummaryClient = Pick<OpenAI, 'moderations' | 'responses'>;

export type SummaryDeps = {
  admin: () => AdminClient;
  openai: () => SummaryClient;
  textModel: () => string;
};

const defaultDeps: SummaryDeps = {
  admin: getAdminClient,
  openai: getOpenAI,
  textModel: () => getServerEnv().textModel,
};

/** Un résumé n'est produit qu'une fois la séance calme depuis 5 minutes. */
const QUIET_MS = 5 * 60_000;
const MAX_MESSAGES = 40;

const SESSION_INSTRUCTIONS = [
  'Tu résumes une séance de révision scolaire pour le parent de l’élève.',
  'Réponds uniquement sur les notions scolaires travaillées.',
  'N’inclus jamais de confidence, d’émotion, de situation personnelle, de prénom, ni de citation de l’élève.',
  'Chaque champ fait moins de 100 caractères, sans point final, au présent, sans pronom genré (ni « il » ni « elle »).',
  '« understood » : ce qui est compris ; « to_review » : ce qui reste à revoir ; null si rien.',
].join(' ');

const WEEK_INSTRUCTIONS = [
  'Tu écris le résumé de la semaine d’un élève pour son parent, en français, au vouvoiement implicite.',
  'Deux phrases au plus, 280 caractères au plus, ton encourageant et factuel.',
  'Désigne l’élève uniquement par {prenom}, sans pronom genré.',
  'Mets en gras (entre **) la durée totale et une notion au plus.',
  'N’invente rien : utilise seulement les chiffres fournis.',
].join(' ');

const sessionSchema = {
  type: 'object',
  properties: {
    understood: { type: ['string', 'null'] },
    to_review: { type: ['string', 'null'] },
    outcome: { type: 'string', enum: ['understood', 'progressing', 'to_review'] },
  },
  required: ['understood', 'to_review', 'outcome'],
  additionalProperties: false,
} as const;

const sessionResult = z.object({
  understood: z.string().max(200).nullable(),
  to_review: z.string().max(200).nullable(),
  outcome: z.enum(['understood', 'progressing', 'to_review']),
});

/** Le demandeur est l'élève lui-même ou un parent relié. */
async function canRead(admin: AdminClient, user: AuthenticatedUser, studentId: string) {
  if (user.id === studentId) return true;
  if (user.role !== 'parent') return false;
  const { data, error } = await admin
    .from('parent_links')
    .select('student_id')
    .eq('parent_id', user.id)
    .eq('student_id', studentId)
    .maybeSingle();
  if (error) throw error;
  return Boolean(data);
}

/** Texte modéré ou rien : un résumé signalé n'est jamais montré au parent. */
async function safe(
  client: SummaryClient,
  text: string | null,
  maxLength = 200,
): Promise<string | null> {
  if (!text?.trim()) return null;
  return (await moderateText(client, text)) === 'ok' ? text.trim().slice(0, maxLength) : null;
}

/**
 * POST /api/tutor/session/summary : résumé structuré d'une séance écrite (notions comprises,
 * points à revoir, résultat), produit une fois, à la demande de l'élève ou d'un parent relié.
 * Jamais de texte libre ni de transcription pour le parent.
 */
export async function handleSessionSummary(
  request: Request,
  deps: SummaryDeps = defaultDeps,
): Promise<Response> {
  const admin = deps.admin();
  const auth = await requireUser(request, admin);
  if (!auth.ok) return auth.response;
  const body = await parseJsonBody(request, z.object({ sessionId: z.uuid() }));
  if (!body) return errorResponse('bad_request');

  const { data: session, error } = await admin
    .from('study_sessions')
    .select('id, student_id, mode, outcome, ended_at, started_at')
    .eq('id', body.sessionId)
    .maybeSingle();
  if (error) {
    serverLog.error('summary.session', error);
    return errorResponse('upstream');
  }
  if (!session || !(await canRead(admin, auth.user, session.student_id))) {
    return errorResponse('not_found');
  }
  const lastActivity = Date.parse(session.ended_at ?? session.started_at);
  if (session.mode !== 'written' || session.outcome || Date.now() - lastActivity < QUIET_MS) {
    return jsonResponse({ ok: true });
  }
  const verdict = await consumeSharedLimits(admin, [
    { key: `summary:${session.id}`, max: 1, windowSeconds: HOUR },
  ]);
  if (verdict !== 'allowed') return jsonResponse({ ok: true });

  const { data: conversation } = await admin
    .from('conversations')
    .select('id')
    .eq('session_id', session.id)
    .maybeSingle();
  const { data: messages, error: messagesError } = conversation
    ? await admin
        .from('messages')
        .select('role, content')
        .eq('conversation_id', conversation.id)
        .order('created_at')
        .limit(MAX_MESSAGES)
    : { data: [], error: null };
  if (messagesError) {
    serverLog.error('summary.messages', messagesError);
    return errorResponse('upstream');
  }
  if (!messages?.length) {
    // Séance sans échange : rien à résumer, elle n'est plus proposée au résumé.
    await admin.from('study_sessions').update({ outcome: 'progressing' }).eq('id', session.id);
    return jsonResponse({ ok: true });
  }

  try {
    const client = deps.openai();
    const response = await client.responses.create({
      model: deps.textModel(),
      instructions: SESSION_INSTRUCTIONS,
      input: messages
        .map((m) => `${m.role === 'student' ? 'Élève' : 'Tuteur'} : ${m.content}`)
        .join('\n'),
      text: {
        format: {
          type: 'json_schema',
          name: 'session_summary',
          strict: true,
          schema: sessionSchema,
        },
      },
      store: false,
      max_output_tokens: 400,
      safety_identifier: await sha256(session.student_id),
    });
    const parsed = sessionResult.safeParse(JSON.parse(response.output_text));
    if (!parsed.success) throw new Error('Résumé mal formé');
    const { error: updateError } = await admin
      .from('study_sessions')
      .update({
        outcome: parsed.data.outcome,
        summary_understood: await safe(client, parsed.data.understood),
        summary_to_review: await safe(client, parsed.data.to_review),
      })
      .eq('id', session.id);
    if (updateError) throw updateError;
  } catch (summaryError) {
    serverLog.error('summary.generate', summaryError);
    return errorResponse('upstream');
  }
  return jsonResponse({ ok: true });
}

/**
 * POST /api/parents/weekly-report : résumé de la semaine (7 derniers jours) d'un enfant relié,
 * produit à partir des agrégats seulement (temps, jours actifs, matières, notions acquises).
 * Le prénom n'est jamais envoyé : le modèle écrit {prenom}, remplacé dans l'app.
 */
export async function handleWeeklyReport(
  request: Request,
  deps: SummaryDeps = defaultDeps,
): Promise<Response> {
  const admin = deps.admin();
  const auth = await requireUser(request, admin);
  if (!auth.ok) return auth.response;
  if (auth.user.role !== 'parent') return errorResponse('forbidden');
  const body = await parseJsonBody(request, z.object({ studentId: z.uuid() }));
  if (!body) return errorResponse('bad_request');
  if (!(await canRead(admin, auth.user, body.studentId))) return errorResponse('not_found');

  const end = parisDay(new Date());
  const start = addDays(end, -6);
  const existing = await admin
    .from('weekly_reports')
    .select('summary, generated_at')
    .eq('student_id', body.studentId)
    .eq('week_start', start)
    .maybeSingle();
  if (existing.data) return jsonResponse(existing.data);

  const verdict = await consumeSharedLimits(admin, [
    { key: `weekly:${body.studentId}:${start}`, max: 2, windowSeconds: DAY },
  ]);
  if (verdict !== 'allowed') return errorResponse('rate_limited');

  const [days, sessions, acquired] = await Promise.all([
    admin
      .from('daily_activity')
      .select('day, seconds')
      .eq('student_id', body.studentId)
      .gte('day', start),
    admin
      .from('study_sessions')
      .select('subject_id, duration_seconds')
      .eq('student_id', body.studentId)
      .gte('started_at', `${start}T00:00:00Z`),
    admin
      .from('chapter_progress')
      .select('chapter_id')
      .eq('student_id', body.studentId)
      .gte('mastery', 0.8)
      .gte('updated_at', `${start}T00:00:00Z`),
  ]);
  if (days.error || sessions.error || acquired.error) {
    serverLog.error('weekly.aggregates', days.error ?? sessions.error ?? acquired.error);
    return errorResponse('upstream');
  }
  const minutes = Math.round(days.data.reduce((sum, d) => sum + d.seconds, 0) / 60);
  if (minutes === 0) return jsonResponse({ summary: null });
  const bySubject = new Map<string, number>();
  for (const s of sessions.data) {
    if (s.subject_id)
      bySubject.set(s.subject_id, (bySubject.get(s.subject_id) ?? 0) + s.duration_seconds);
  }
  const facts = {
    minutes_total: minutes,
    active_days: days.data.filter((d) => d.seconds > 0).length,
    top_subjects: [...bySubject]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 2)
      .map(([subject]) => subject),
    acquired_notions: acquired.data
      .map((c) => chapterTitle(c.chapter_id))
      .filter(Boolean)
      .slice(0, 3),
  };

  try {
    const client = deps.openai();
    const response = await client.responses.create({
      model: deps.textModel(),
      instructions: WEEK_INSTRUCTIONS,
      input: JSON.stringify(facts),
      store: false,
      max_output_tokens: 300,
    });
    const summary = await safe(client, response.output_text, 600);
    if (!summary) return jsonResponse({ summary: null });
    const saved = await admin
      .from('weekly_reports')
      .upsert({ student_id: body.studentId, week_start: start, summary })
      .select('summary, generated_at')
      .single();
    if (saved.error) throw saved.error;
    return jsonResponse(saved.data);
  } catch (reportError) {
    serverLog.error('weekly.generate', reportError);
    return errorResponse('upstream');
  }
}
