import type OpenAI from 'openai';
import { z } from 'zod';

import type { VisualCheckResponse } from '@/services/tutor/api-contract';

import { moderateText } from '../guards/moderation';
import { errorResponse, jsonResponse, readJsonBody } from '../http';
import { serverLog } from '../log';
import { getOpenAI } from '../openai';
import { getAdminClient, type AdminClient } from '../supabase';
import { requireTutorAccess } from './access';
import { parseVisualCall, VISUAL_TOOL_NAMES, visualText } from './visuals';

export type VisualCheckDeps = {
  admin: () => AdminClient;
  openai: () => Pick<OpenAI, 'moderations'>;
};

const defaultDeps: VisualCheckDeps = { admin: getAdminClient, openai: getOpenAI };

const callSchema = z.object({ name: z.string().max(40), arguments: z.string().max(12_000) });

/**
 * POST /api/tutor/visual-check : pendant un appel vocal, les appels d'outils du tuteur arrivent
 * sur le téléphone sans passer par le serveur. Avant de dessiner un visuel, l'app le fait valider
 * (mêmes règles qu'à l'écrit) et modérer ici ; un visuel refusé n'est jamais affiché.
 */
export async function handleVisualCheck(
  request: Request,
  deps: VisualCheckDeps = defaultDeps,
): Promise<Response> {
  let admin: AdminClient;
  try {
    admin = deps.admin();
  } catch (error) {
    serverLog.error('config', error);
    return errorResponse('upstream');
  }
  const access = await requireTutorAccess(request, admin, 'visual');
  if (!access.ok) return access.response;
  if (!access.visualsEnabled) return errorResponse('not_allowed');

  let body: unknown;
  try {
    body = await readJsonBody(request, 16_000);
  } catch {
    return errorResponse('bad_request');
  }
  const call = callSchema.safeParse(body);
  if (!call.success || !VISUAL_TOOL_NAMES.has(call.data.name)) return errorResponse('bad_request');
  const visual = parseVisualCall(call.data.name, call.data.arguments);
  if (!visual) return errorResponse('bad_request');

  try {
    const verdict = await moderateText(deps.openai(), visualText(visual));
    if (verdict !== 'ok') {
      serverLog.warn('visual.check', { verdict });
      return errorResponse(verdict);
    }
  } catch (error) {
    serverLog.error('visual.moderation', error);
    return errorResponse('upstream');
  }
  const response: VisualCheckResponse = { visual };
  return jsonResponse(response);
}
