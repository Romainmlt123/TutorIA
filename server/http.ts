import type { AccountErrorCode } from '@/services/auth/api-contract';
import type { TutorErrorCode, TutorStreamEvent } from '@/services/tutor/api-contract';

type ErrorCode = TutorErrorCode | AccountErrorCode;

const STATUS: Record<ErrorCode, number> = {
  bad_request: 400,
  unauthorized: 401,
  forbidden: 403,
  consent_required: 403,
  not_allowed: 403,
  paused: 403,
  not_found: 404,
  children_limit: 409,
  too_long: 413,
  flagged: 422,
  distress: 422,
  invalid_code: 422,
  name_mismatch: 422,
  same_email: 422,
  rate_limited: 429,
  daily_limit: 429,
  timeout: 504,
  upstream: 502,
  network: 502,
};

const NO_STORE = { 'Cache-Control': 'no-store' };

export function jsonResponse(body: unknown, status = 200): Response {
  return Response.json(body, { status, headers: NO_STORE });
}

export function errorResponse(code: ErrorCode): Response {
  return jsonResponse({ error: code }, STATUS[code]);
}

/** Réponse en flux NDJSON : un événement JSON par ligne. */
export function ndjsonResponse(events: AsyncIterable<TutorStreamEvent>): Response {
  const encoder = new TextEncoder();
  const body = new ReadableStream<Uint8Array>({
    async start(controller) {
      for await (const event of events) {
        controller.enqueue(encoder.encode(`${JSON.stringify(event)}\n`));
      }
      controller.close();
    },
  });
  return new Response(body, {
    headers: { 'Content-Type': 'application/x-ndjson; charset=utf-8', ...NO_STORE },
  });
}

const CLIENT_ID = /^[0-9a-f-]{16,64}$/i;

/** Identifiant anonyme de l'installation et adresse IP, pour la limite de débit. */
export function identify(request: Request): { clientId: string | null; ip: string } {
  const header = request.headers.get('x-client-id');
  const forwarded = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim();
  return {
    clientId: header && CLIENT_ID.test(header) ? header : null,
    ip: request.headers.get('cf-connecting-ip') ?? forwarded ?? 'local',
  };
}

/** Lit un corps JSON en refusant les requêtes trop lourdes. */
export async function readJsonBody(request: Request, maxBytes: number): Promise<unknown> {
  const text = await request.text();
  if (text.length > maxBytes) throw new RangeError('Corps de requête trop volumineux');
  return JSON.parse(text) as unknown;
}

/** Empreinte SHA-256 (hex, 64 caractères) : transmise à OpenAI à la place de tout identifiant. */
export async function sha256(value: string): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value));
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

/** Lit et valide un corps JSON ; `null` si la requête est mal formée ou trop lourde. */
export async function parseJsonBody<T>(
  request: Request,
  schema: { safeParse(value: unknown): { success: true; data: T } | { success: false } },
  maxBytes = 2_000,
): Promise<T | null> {
  let raw: unknown;
  try {
    raw = await readJsonBody(request, maxBytes);
  } catch {
    // Corps illisible ou trop volumineux : la route répond « bad_request ».
    return null;
  }
  const parsed = schema.safeParse(raw);
  return parsed.success ? parsed.data : null;
}
