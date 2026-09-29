import { z } from 'zod';

import { GRADES } from '@/data/grades';
import type { Grade } from '@/data/types';
import {
  isLinkCodeFormat,
  normalizeFirstName,
  normalizeLinkCode,
  type CreateLinkCodeResponse,
  type RedeemLinkCodeResponse,
} from '@/services/auth/api-contract';

import { requireUser } from '../auth';
import { getSupabaseEnv } from '../env';
import { consumeSharedLimits, DAY, hashedKey, HOUR } from '../guards/sharedRateLimit';
import { errorResponse, identify, jsonResponse, parseJsonBody } from '../http';
import { serverLog } from '../log';
import { getAdminClient, type AdminClient } from '../supabase';
import { generateLinkCode, hmacLinkCode } from './linkCode';

export type AccountDeps = {
  admin: () => AdminClient;
  pepper: () => string;
  generateCode?: () => string;
};

export const defaultAccountDeps: AccountDeps = {
  admin: getAdminClient,
  pepper: () => getSupabaseEnv().linkCodePepper,
};

const createBody = z.object({
  childFirstName: z.string().max(200).transform(normalizeFirstName).pipe(z.string().min(1)),
  childGrade: z.enum(GRADES as [Grade, ...Grade[]]),
});

const redeemBody = z.object({ code: z.string().max(20).transform(normalizeLinkCode) });

const MAX_DRAWS = 5;

/** POST /api/link-codes/create : un parent crée le code de son enfant (L5, L6). */
export async function handleCreateLinkCode(
  request: Request,
  deps: AccountDeps = defaultAccountDeps,
): Promise<Response> {
  const admin = deps.admin();
  const auth = await requireUser(request, admin);
  if (!auth.ok) return auth.response;
  if (auth.user.role !== 'parent') return errorResponse('forbidden');

  const body = await parseJsonBody(request, createBody);
  if (!body) return errorResponse('bad_request');

  const verdict = await consumeSharedLimits(admin, [
    { key: `link-create:${auth.user.id}`, max: 10, windowSeconds: DAY },
  ]);
  if (verdict !== 'allowed')
    return errorResponse(verdict === 'limited' ? 'rate_limited' : 'upstream');

  const draw = deps.generateCode ?? generateLinkCode;
  for (let attempt = 0; attempt < MAX_DRAWS; attempt += 1) {
    const code = draw();
    const { data, error } = await admin.rpc('create_link_code', {
      p_parent_id: auth.user.id,
      p_child_first_name: body.childFirstName,
      p_child_grade: body.childGrade,
      p_code_hmac: await hmacLinkCode(deps.pepper(), code),
    });
    const result = data?.[0];
    if (error || !result) {
      serverLog.error('linkCode.create', error ?? new Error('empty result'));
      return errorResponse('upstream');
    }
    if (result.status === 'children_limit') return errorResponse('children_limit');
    if (result.status === 'created') {
      const response: CreateLinkCodeResponse = { code, expiresAt: result.expires_at };
      return jsonResponse(response);
    }
    // collision : un code identique est déjà actif, on en tire un autre.
  }
  serverLog.warn('linkCode.create', { reason: 'collisions' });
  return errorResponse('upstream');
}

/** POST /api/link-codes/redeem : un élève relie son compte à celui d'un parent (L2, profil, O5). */
export async function handleRedeemLinkCode(
  request: Request,
  deps: AccountDeps = defaultAccountDeps,
): Promise<Response> {
  const admin = deps.admin();
  const auth = await requireUser(request, admin);
  if (!auth.ok) return auth.response;
  if (auth.user.role !== 'student') return errorResponse('forbidden');

  const body = await parseJsonBody(request, redeemBody);
  if (!body || !isLinkCodeFormat(body.code)) return errorResponse('invalid_code');

  // 5 essais par heure et par élève, 20 par adresse IP : 10^6 codes possibles, aucun devinable.
  const { ip } = identify(request);
  const verdict = await consumeSharedLimits(admin, [
    { key: `link-redeem:${auth.user.id}`, max: 5, windowSeconds: HOUR },
    { key: await hashedKey('link-redeem-ip', ip), max: 20, windowSeconds: HOUR },
  ]);
  if (verdict !== 'allowed')
    return errorResponse(verdict === 'limited' ? 'rate_limited' : 'upstream');

  const { data, error } = await admin.rpc('redeem_link_code', {
    p_student_id: auth.user.id,
    p_code_hmac: await hmacLinkCode(deps.pepper(), body.code),
  });
  const result = data?.[0];
  if (error || !result) {
    serverLog.error('linkCode.redeem', error ?? new Error('empty result'));
    return errorResponse('upstream');
  }

  switch (result.status) {
    case 'linked':
    case 'already_linked': {
      const response: RedeemLinkCodeResponse = { status: result.status };
      return jsonResponse(response);
    }
    case 'name_mismatch':
      return errorResponse('name_mismatch');
    case 'children_limit':
      return errorResponse('children_limit');
    case 'not_student':
      return errorResponse('forbidden');
    default:
      return errorResponse('invalid_code');
  }
}
