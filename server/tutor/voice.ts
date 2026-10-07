import { requireUser } from '../auth';
import { parseTopic } from '../guards/limits';
import { errorResponse, jsonResponse } from '../http';
import { serverLog } from '../log';
import { getAdminClient, type AdminClient } from '../supabase';
import { requireTutorAccess } from './access';
import { levelOfTopic } from './level';
import { handleRealtimeSession, type RealtimeDeps } from './realtime';

/** Plafond d'un appel vocal (TUTOR_LIMITS.voiceCallMaxMs), en secondes. */
const VOICE_MAX_SECONDS = 600;
/** Au-delà, un appel sans fin déclarée (app fermée brutalement) est compté au plafond. */
const STALE_AFTER_MS = VOICE_MAX_SECONDS * 1000;

export type VoiceDeps = { admin: () => AdminClient; realtime?: RealtimeDeps };

const defaultDeps: VoiceDeps = { admin: getAdminClient };

/** Ferme les appels restés ouverts : durée comptée au plafond de 10 min. */
async function closeStaleCalls(admin: AdminClient, studentId: string, now: Date) {
  const { data, error } = await admin
    .from('study_sessions')
    .select('id, started_at')
    .eq('student_id', studentId)
    .eq('mode', 'voice')
    .is('ended_at', null)
    .lt('started_at', new Date(now.getTime() - STALE_AFTER_MS).toISOString())
    .limit(10);
  if (error) throw error;
  for (const call of data) {
    const ended = new Date(Date.parse(call.started_at) + STALE_AFTER_MS).toISOString();
    const { error: updateError } = await admin
      .from('study_sessions')
      .update({ ended_at: ended, duration_seconds: VOICE_MAX_SECONDS })
      .eq('id', call.id);
    if (updateError) throw updateError;
  }
}

/**
 * POST /api/tutor/realtime-session, enveloppe de `handleRealtimeSession` :
 * élève autorisé (consentement, vocal activé par le parent, pause du soir, limite du jour),
 * puis début de la séance vocale enregistré quand le jeton est délivré. Une leçon d'Explorer à
 * la voix compte comme une séance, sans étoiles ni validation du niveau.
 */
export async function handleVoiceSessionStart(
  request: Request,
  deps: VoiceDeps = defaultDeps,
): Promise<Response> {
  let admin: AdminClient;
  try {
    admin = deps.admin();
  } catch (error) {
    serverLog.error('config', error);
    return errorResponse('upstream');
  }
  const access = await requireTutorAccess(request, admin, 'voice');
  if (!access.ok) return access.response;

  let topicBody: unknown;
  try {
    topicBody = await request.clone().json();
  } catch {
    return errorResponse('bad_request');
  }
  const topic = parseTopic(topicBody);
  if (!topic.ok) return errorResponse(topic.code);
  // Explorer : à la voix, seulement les leçons. Les appels d'outils de l'API Realtime arrivent sur
  // le téléphone, qui pourrait les falsifier : exercices notés et évaluations restent à l'écrit.
  const place = levelOfTopic(topic.value);
  if (place && place.level.type !== 'lecon') return errorResponse('not_allowed');

  const response = await handleRealtimeSession(request, deps.realtime);
  if (!response.ok) return response;

  const now = new Date();
  try {
    await closeStaleCalls(admin, access.user.id, now);
    const { error } = await admin.from('study_sessions').insert({
      student_id: access.user.id,
      mode: 'voice',
      subject_id: topic.value.subjectId,
      chapter_id: topic.value.chapterId,
      level_id: place?.level.id ?? null,
      started_at: now.toISOString(),
    });
    if (error) throw error;
  } catch (error) {
    // L'appel peut commencer : seul le suivi de la séance manquera.
    serverLog.error('voice.session', error);
  }
  return response;
}

/** POST /api/tutor/voice/end : fin de l'appel en cours, durée plafonnée à 10 min. */
export async function handleVoiceEnd(
  request: Request,
  deps: VoiceDeps = defaultDeps,
): Promise<Response> {
  const admin = deps.admin();
  const access = await requireUser(request, admin);
  if (!access.ok) return access.response;
  if (access.user.role !== 'student') return errorResponse('forbidden');

  const now = new Date();
  const { data, error } = await admin
    .from('study_sessions')
    .select('id, started_at')
    .eq('student_id', access.user.id)
    .eq('mode', 'voice')
    .is('ended_at', null)
    .gte('started_at', new Date(now.getTime() - 2 * STALE_AFTER_MS).toISOString())
    .order('started_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) {
    serverLog.error('voice.end', error);
    return errorResponse('upstream');
  }
  if (!data) return jsonResponse({ ok: true });
  const seconds = Math.min(
    VOICE_MAX_SECONDS,
    Math.max(0, Math.round((now.getTime() - Date.parse(data.started_at)) / 1000)),
  );
  const { error: updateError } = await admin
    .from('study_sessions')
    .update({ ended_at: now.toISOString(), duration_seconds: seconds })
    .eq('id', data.id);
  if (updateError) {
    serverLog.error('voice.end', updateError);
    return errorResponse('upstream');
  }
  return jsonResponse({ ok: true });
}
