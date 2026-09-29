import { z } from 'zod';

import { isValidEmail, normalizeEmail, normalizeFirstName } from '@/services/auth/api-contract';

import { requireUser } from '../auth';
import { consumeSharedLimits, DAY, hashedKey } from '../guards/sharedRateLimit';
import { errorResponse, jsonResponse, parseJsonBody } from '../http';
import { serverLog } from '../log';
import { defaultAccountDeps, type AccountDeps } from './linkCodes';

const requestBody = z.object({ parentEmail: z.string().max(254).transform(normalizeEmail) });

const acceptBody = z
  .object({
    studentId: z.uuid().optional(),
    firstName: z.string().max(200).transform(normalizeFirstName).optional(),
  })
  .refine((body) => body.studentId !== undefined || Boolean(body.firstName));

/**
 * POST /api/consent/request : un élève demande à un parent de relier (et valider) son compte.
 * - Parent déjà inscrit : une demande apparaît dans son espace.
 * - Adresse inconnue : Supabase Auth envoie une invitation (lien vers /invitation).
 * La réponse est la même dans tous les cas : l'app ne peut pas savoir si une adresse a un compte.
 */
export async function handleConsentRequest(
  request: Request,
  deps: AccountDeps = defaultAccountDeps,
): Promise<Response> {
  const admin = deps.admin();
  const auth = await requireUser(request, admin, { strict: true });
  if (!auth.ok) return auth.response;
  if (auth.user.role !== 'student') return errorResponse('forbidden');

  const body = await parseJsonBody(request, requestBody);
  if (!body || !isValidEmail(body.parentEmail)) return errorResponse('bad_request');
  if (auth.user.email && normalizeEmail(auth.user.email) === body.parentEmail) {
    return errorResponse('same_email');
  }

  const verdict = await consumeSharedLimits(admin, [
    { key: `consent-request:${auth.user.id}`, max: 5, windowSeconds: DAY },
    { key: await hashedKey('consent-target', body.parentEmail), max: 3, windowSeconds: DAY },
  ]);
  if (verdict !== 'allowed')
    return errorResponse(verdict === 'limited' ? 'rate_limited' : 'upstream');

  const { data: accounts, error } = await admin.rpc('find_account_by_email', {
    p_email: body.parentEmail,
  });
  if (error) {
    serverLog.error('consent.lookup', error);
    return errorResponse('upstream');
  }

  const existing = accounts?.[0];
  let parentId: string;
  if (existing) {
    // Une adresse d'élève ne peut pas valider un compte : rien n'est envoyé, sans le dire.
    if (existing.role !== 'parent') return jsonResponse({ ok: true });
    parentId = existing.id;
  } else {
    const invited = await admin.auth.admin.inviteUserByEmail(body.parentEmail, {
      data: { role: 'parent' },
    });
    if (invited.error || !invited.data.user) {
      serverLog.error('consent.invite', invited.error ?? new Error('no user'));
      return errorResponse('upstream');
    }
    parentId = invited.data.user.id;
  }

  // Une seule demande en attente par élève : la nouvelle remplace l'ancienne.
  const { error: upsertError } = await admin
    .from('link_requests')
    .upsert(
      { student_id: auth.user.id, parent_id: parentId, created_at: new Date().toISOString() },
      { onConflict: 'student_id' },
    );
  if (upsertError) {
    serverLog.error('consent.request', upsertError);
    return errorResponse('upstream');
  }
  return jsonResponse({ ok: true });
}

/**
 * POST /api/link-requests/accept : le parent accepte la demande de son enfant.
 * Le lien est créé et, sous 15 ans, le consentement est validé et sa preuve gardée.
 * Un parent invité donne d'abord son prénom : c'est la finalisation de son compte.
 * Sans `studentId` (demande expirée), seule la finalisation a lieu.
 */
export async function handleAcceptLinkRequest(
  request: Request,
  deps: AccountDeps = defaultAccountDeps,
): Promise<Response> {
  const admin = deps.admin();
  const auth = await requireUser(request, admin, { strict: true });
  if (!auth.ok) return auth.response;
  if (auth.user.role !== 'parent') return errorResponse('forbidden');

  const body = await parseJsonBody(request, acceptBody);
  if (!body) return errorResponse('bad_request');

  if (body.firstName) {
    const { error } = await admin.rpc('finalize_parent_account', {
      p_parent_id: auth.user.id,
      p_first_name: body.firstName,
    });
    if (error) {
      serverLog.error('consent.finalize', error);
      return errorResponse('upstream');
    }
  }

  // Parent invité dont la demande a expiré : le compte est finalisé, sans liaison.
  if (!body.studentId) return jsonResponse({ ok: true });

  const { data: status, error } = await admin.rpc('accept_link_request', {
    p_parent_id: auth.user.id,
    p_student_id: body.studentId,
  });
  if (error) {
    serverLog.error('consent.accept', error);
    return errorResponse('upstream');
  }
  switch (status) {
    case 'linked':
      return jsonResponse({ ok: true });
    case 'children_limit':
      return errorResponse('children_limit');
    case 'account_not_ready':
      return errorResponse('bad_request');
    default:
      return errorResponse('not_found');
  }
}
