import { parseTopic } from '../guards/limits';
import { errorResponse, jsonResponse, readJsonBody } from '../http';
import { serverLog } from '../log';
import { getAdminClient, type AdminClient } from '../supabase';
import { requireTutorAccess } from './access';
import { TUTOR_PROMPT_VERSION } from './prompt';

export type ReportDeps = { admin: () => AdminClient };

const defaultDeps: ReportDeps = { admin: getAdminClient };

/**
 * POST /api/tutor/report : signalement d'une réponse du tuteur (exigence Google Play pour l'IA).
 * Enregistré pour relecture (6 mois), avec la version du prompt.
 */
export async function handleReport(
  request: Request,
  deps: ReportDeps = defaultDeps,
): Promise<Response> {
  let admin: AdminClient;
  try {
    admin = deps.admin();
  } catch (error) {
    serverLog.error('config', error);
    return errorResponse('upstream');
  }
  const access = await requireTutorAccess(request, admin, 'report');
  if (!access.ok) return access.response;

  let body: unknown;
  try {
    body = await readJsonBody(request, 4_000);
  } catch {
    return errorResponse('bad_request');
  }
  const topic = parseTopic(body);
  const excerpt = (body as { excerpt?: unknown } | null)?.excerpt;
  if (!topic.ok || typeof excerpt !== 'string' || !excerpt.trim()) {
    return errorResponse('bad_request');
  }

  const { error } = await admin.from('tutor_reports').insert({
    student_id: access.user.id,
    subject_id: topic.value.subjectId,
    chapter_id: topic.value.chapterId,
    excerpt: excerpt.trim().slice(0, 500),
    prompt_version: TUTOR_PROMPT_VERSION,
  });
  if (error) {
    serverLog.error('report', error);
    return errorResponse('upstream');
  }
  serverLog.warn('report', { promptVersion: TUTOR_PROMPT_VERSION, topic: topic.value });
  return jsonResponse({ ok: true });
}
