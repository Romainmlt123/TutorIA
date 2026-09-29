import { apiUrl } from '@/lib/api';
import { logError } from '@/lib/logger';

import type { AccountErrorCode, AccountErrorResponse } from './api-contract';
import { AuthError } from './AuthService';

const REQUEST_TIMEOUT_MS = 15_000;

const KNOWN_CODES: readonly AccountErrorCode[] = [
  'bad_request',
  'unauthorized',
  'forbidden',
  'rate_limited',
  'invalid_code',
  'name_mismatch',
  'children_limit',
  'same_email',
  'not_found',
  'upstream',
  'network',
  'timeout',
];

async function errorCodeOf(response: Response): Promise<AccountErrorCode> {
  try {
    const body = (await response.json()) as Partial<AccountErrorResponse>;
    if (body.error && KNOWN_CODES.includes(body.error)) return body.error;
  } catch (error) {
    logError('account.http', error);
  }
  return response.status === 429 ? 'rate_limited' : 'upstream';
}

/** Appel authentifié d'une route des comptes ; les erreurs prévues deviennent des AuthError. */
export async function callAccountApi<T>(
  path: string,
  token: string | null,
  { method = 'POST', body }: { method?: 'GET' | 'POST'; body?: unknown } = {},
): Promise<T> {
  if (!token) throw new AuthError('unauthorized');
  const timeout = AbortSignal.timeout(REQUEST_TIMEOUT_MS);
  let response: Response;
  try {
    response = await fetch(apiUrl(path), {
      method,
      headers: {
        Authorization: `Bearer ${token}`,
        ...(body === undefined ? {} : { 'Content-Type': 'application/json' }),
      },
      body: body === undefined ? undefined : JSON.stringify(body),
      signal: timeout,
    });
  } catch (error) {
    logError('account.http', error);
    throw new AuthError(timeout.aborted ? 'timeout' : 'network');
  }
  if (!response.ok) throw new AuthError(await errorCodeOf(response));
  return (await response.json()) as T;
}
