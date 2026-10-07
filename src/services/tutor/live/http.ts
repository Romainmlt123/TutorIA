import { fetch } from 'expo/fetch';

import { apiUrl } from '@/lib/api';
import { getClientId } from '@/lib/clientId';
import { logError } from '@/lib/logger';
import { authService } from '@/services/auth';

import type { ErrorResponse, TutorErrorCode } from '../api-contract';

/**
 * Délai maximal avant le début de la réponse du serveur intermédiaire. Une réponse en flux, elle,
 * n'est pas bornée ici : c'est l'appelant qui surveille ses silences.
 */
export const REQUEST_TIMEOUT_MS = 25_000;

export class TutorHttpError extends Error {
  constructor(readonly code: TutorErrorCode) {
    super(code);
  }
}

const KNOWN_CODES: readonly TutorErrorCode[] = [
  'bad_request',
  'unauthorized',
  'consent_required',
  'not_allowed',
  'paused',
  'too_long',
  'rate_limited',
  'flagged',
  'distress',
  'timeout',
  'upstream',
  'network',
];

async function errorCodeOf(response: Response): Promise<TutorErrorCode> {
  try {
    const body = (await response.json()) as Partial<ErrorResponse>;
    if (body.error && KNOWN_CODES.includes(body.error)) return body.error;
  } catch (error) {
    logError('tutor.http', error);
  }
  return response.status === 429 ? 'rate_limited' : 'upstream';
}

/**
 * POST JSON vers une route du tuteur, avec le jeton de l'élève connecté. Le délai maximal ne court
 * que jusqu'au début de la réponse : une réponse longue, reçue en flux, n'est pas coupée.
 */
export async function postTutor(
  path: string,
  body: unknown,
  signal?: AbortSignal,
): Promise<Response> {
  const timeout = new AbortController();
  const timer = setTimeout(() => timeout.abort(), REQUEST_TIMEOUT_MS);
  const combined = signal ? AbortSignal.any([signal, timeout.signal]) : timeout.signal;
  let response: Response;
  try {
    const token = await authService.getAccessToken();
    response = (await fetch(apiUrl(path), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Client-Id': await getClientId(),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(body),
      signal: combined,
    })) as unknown as Response;
  } catch (error) {
    if (signal?.aborted) throw error;
    logError('tutor.http', error);
    throw new TutorHttpError(timeout.signal.aborted ? 'timeout' : 'network');
  } finally {
    clearTimeout(timer);
  }
  if (!response.ok) throw new TutorHttpError(await errorCodeOf(response));
  return response;
}
