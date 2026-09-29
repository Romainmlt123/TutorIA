import type { UserRole } from '@/data/types';

import { errorResponse } from './http';
import { serverLog } from './log';
import type { AdminClient } from './supabase';

export type AuthenticatedUser = {
  id: string;
  role: UserRole;
  firstName: string | null;
  email: string | null;
};

export type AuthResult = { ok: true; user: AuthenticatedUser } | { ok: false; response: Response };

function bearerToken(request: Request): string | null {
  const header = request.headers.get('authorization');
  const match = header?.match(/^Bearer\s+(\S+)$/i);
  return match?.[1] ?? null;
}

/**
 * Vérifie le jeton Supabase de la requête et lit le rôle en base.
 * - Par défaut, `getClaims` vérifie la signature localement (clés JWKS), sans aller-retour.
 * - `strict` : `getUser` interroge Supabase Auth, qui refuse un compte supprimé ou déconnecté.
 *   À utiliser pour les actions sensibles (suppression, consentement, export).
 * Un jeton valide dont le profil n'existe plus (compte supprimé) est refusé.
 */
export async function requireUser(
  request: Request,
  admin: AdminClient,
  { strict = false }: { strict?: boolean } = {},
): Promise<AuthResult> {
  const token = bearerToken(request);
  if (!token) return { ok: false, response: errorResponse('unauthorized') };

  let id: string | undefined;
  let email: string | null = null;
  if (strict) {
    const { data, error } = await admin.auth.getUser(token);
    id = data.user?.id;
    email = data.user?.email ?? null;
    if (error || !id) return { ok: false, response: errorResponse('unauthorized') };
  } else {
    const { data, error } = await admin.auth.getClaims(token);
    id = data?.claims.sub;
    email = typeof data?.claims.email === 'string' ? data.claims.email : null;
    if (error || !id) return { ok: false, response: errorResponse('unauthorized') };
  }

  const { data: profile, error } = await admin
    .from('profiles')
    .select('role, first_name')
    .eq('id', id)
    .maybeSingle();
  if (error) {
    serverLog.error('auth.profile', error);
    return { ok: false, response: errorResponse('upstream') };
  }
  if (!profile) return { ok: false, response: errorResponse('unauthorized') };

  return { ok: true, user: { id, role: profile.role, firstName: profile.first_name, email } };
}
