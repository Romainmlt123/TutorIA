import { TUTOR_LIMITS } from '@/services/tutor/api-contract';

import { IMAGE_DATA_URL } from '../guards/limits';
import { moderateImage } from '../guards/moderation';
import { limiters } from '../guards/rateLimit';
import { errorResponse, identify, jsonResponse, readJsonBody } from '../http';
import { serverLog } from '../log';
import { getOpenAI } from '../openai';

/** POST /api/tutor/image-check : taille et modération de la photo d'exercice avant envoi. */
export async function handleImageCheck(request: Request): Promise<Response> {
  const { clientId } = identify(request);
  if (!clientId) return errorResponse('bad_request');
  if (!limiters.imageClient.consume(clientId)) return errorResponse('rate_limited');

  let body: unknown;
  try {
    body = await readJsonBody(request, TUTOR_LIMITS.imageMaxBytes + 1_000);
  } catch {
    return errorResponse('too_long');
  }
  const dataUrl = (body as { dataUrl?: unknown } | null)?.dataUrl;
  if (typeof dataUrl !== 'string' || !IMAGE_DATA_URL.test(dataUrl))
    return errorResponse('bad_request');

  try {
    const verdict = await moderateImage(getOpenAI(), dataUrl);
    if (verdict !== 'ok') {
      serverLog.warn('image', { verdict });
      return errorResponse(verdict);
    }
    return jsonResponse({ ok: true });
  } catch (error) {
    serverLog.error('image.moderation', error);
    return errorResponse('upstream');
  }
}
