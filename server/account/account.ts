import { z } from 'zod';

import { requireUser, type AuthenticatedUser } from '../auth';
import { errorResponse, jsonResponse, parseJsonBody } from '../http';
import { serverLog } from '../log';
import type { AdminClient } from '../supabase';
import { defaultAccountDeps, type AccountDeps } from './linkCodes';

/**
 * POST /api/account/delete : suppression réelle du compte (RGPD, règle Apple 5.1.1).
 * Supabase Auth supprime l'utilisateur ; la base efface ses données en cascade.
 * Les comptes des enfants d'un parent restent : ils sont autonomes.
 */
export async function handleDeleteAccount(
  request: Request,
  deps: AccountDeps = defaultAccountDeps,
): Promise<Response> {
  const admin = deps.admin();
  const auth = await requireUser(request, admin, { strict: true });
  if (!auth.ok) return auth.response;

  const { error } = await admin.auth.admin.deleteUser(auth.user.id);
  if (error) {
    serverLog.error('account.delete', error);
    return errorResponse('upstream');
  }
  return jsonResponse({ ok: true });
}

const childBody = z.object({ studentId: z.uuid() });

/**
 * POST /api/account/delete-child : le parent qui a validé le compte d'un enfant de moins de 15 ans
 * retire son consentement, ce qui supprime le compte de l'enfant.
 */
export async function handleDeleteChild(
  request: Request,
  deps: AccountDeps = defaultAccountDeps,
): Promise<Response> {
  const admin = deps.admin();
  const auth = await requireUser(request, admin, { strict: true });
  if (!auth.ok) return auth.response;
  if (auth.user.role !== 'parent') return errorResponse('forbidden');

  const body = await parseJsonBody(request, childBody);
  if (!body) return errorResponse('bad_request');

  const [link, consent, student] = await Promise.all([
    admin
      .from('parent_links')
      .select('student_id')
      .eq('parent_id', auth.user.id)
      .eq('student_id', body.studentId)
      .maybeSingle(),
    admin
      .from('parental_consents')
      .select('id')
      .eq('parent_id', auth.user.id)
      .eq('student_id', body.studentId)
      .limit(1),
    admin.from('students').select('under_15').eq('id', body.studentId).maybeSingle(),
  ]);
  const failure = link.error ?? consent.error ?? student.error;
  if (failure) {
    serverLog.error('account.deleteChild', failure);
    return errorResponse('upstream');
  }
  if (!link.data || !consent.data?.length || !student.data?.under_15) {
    return errorResponse('forbidden');
  }

  const { error } = await admin.auth.admin.deleteUser(body.studentId);
  if (error) {
    serverLog.error('account.deleteChild', error);
    return errorResponse('upstream');
  }
  return jsonResponse({ ok: true });
}

type Section = { name: string; rows: unknown };

type Query = PromiseLike<{ data: unknown; error: unknown }>;

async function collect(sections: readonly (readonly [string, Query])[]): Promise<Section[] | null> {
  const results = await Promise.all(sections.map(([, query]) => query));
  const failed = results.find((r) => r.error);
  if (failed) {
    serverLog.error('account.export', failed.error);
    return null;
  }
  return sections.map(([name], i) => ({ name, rows: results[i]?.data ?? null }));
}

function studentSections(admin: AdminClient, id: string) {
  return [
    ['profil', admin.from('profiles').select('first_name, role, created_at').eq('id', id).single()],
    [
      'eleve',
      admin
        .from('students')
        .select(
          'grade, under_15, consent_status, daily_minutes, goals, modes, moments, reminder_enabled, onboarding_completed_at, terms_accepted_at, created_at',
        )
        .eq('id', id)
        .single(),
    ],
    [
      'auto_evaluation',
      admin.from('self_assessments').select('subject_id, level, updated_at').eq('student_id', id),
    ],
    [
      'parents_relies',
      admin.from('parent_links').select('parent_id, origin, created_at').eq('student_id', id),
    ],
    [
      'consentements',
      admin.from('parental_consents').select('parent_id, method, granted_at').eq('student_id', id),
    ],
    [
      'reglages_parentaux',
      admin.from('parental_settings').select('*').eq('student_id', id).single(),
    ],
  ] as const;
}

function parentSections(admin: AdminClient, id: string) {
  return [
    ['profil', admin.from('profiles').select('first_name, role, created_at').eq('id', id).single()],
    [
      'parent',
      admin
        .from('parents')
        .select('weekly_report, alerts, terms_accepted_at, created_at')
        .eq('id', id)
        .single(),
    ],
    [
      'enfants_relies',
      admin.from('parent_links').select('student_id, origin, created_at').eq('parent_id', id),
    ],
    [
      'codes_de_liaison',
      admin
        .from('link_codes')
        .select('child_first_name, child_grade, created_at, expires_at, used_at')
        .eq('parent_id', id),
    ],
    [
      'consentements_donnes',
      admin.from('parental_consents').select('student_id, method, granted_at').eq('parent_id', id),
    ],
  ] as const;
}

/**
 * GET /api/account/export : toutes les données du compte, en JSON (RGPD, droit d'accès et portabilité).
 * L'export d'un parent ne contient jamais les conversations de ses enfants.
 */
export async function handleExport(
  request: Request,
  deps: AccountDeps = defaultAccountDeps,
): Promise<Response> {
  const admin = deps.admin();
  const auth = await requireUser(request, admin, { strict: true });
  if (!auth.ok) return auth.response;

  const user: AuthenticatedUser = auth.user;
  const sections = await collect(
    user.role === 'student' ? studentSections(admin, user.id) : parentSections(admin, user.id),
  );
  if (!sections) return errorResponse('upstream');

  return jsonResponse({
    exportedAt: new Date().toISOString(),
    email: user.email,
    ...Object.fromEntries(sections.map((s) => [s.name, s.rows])),
  });
}
