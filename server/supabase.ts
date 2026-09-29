import { createClient, type SupabaseClient } from '@supabase/supabase-js';

import type { Database } from '@/services/db/database.types';

import { getSupabaseEnv } from './env';

export type AdminClient = SupabaseClient<Database>;

let cached: AdminClient | null = null;

/**
 * Client Supabase du serveur, avec la clé secrète : il contourne la RLS.
 * Chaque route vérifie donc elle-même l'utilisateur et ses droits avant d'écrire.
 * Les requêtes passent par l'API HTTP (PostgREST et son pool), adaptée au serverless.
 */
export function getAdminClient(): AdminClient {
  if (cached) return cached;
  const { url, secretKey } = getSupabaseEnv();
  cached = createClient<Database>(url, secretKey, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });
  return cached;
}
