import { sha256 } from '../http';
import { serverLog } from '../log';
import type { AdminClient } from '../supabase';

export type SharedLimit = { key: string; max: number; windowSeconds: number };

export type SharedLimitVerdict = 'allowed' | 'limited' | 'error';

/**
 * Limite de débit partagée entre toutes les instances du serveur (table rate_limits).
 * Les limites sont vérifiées dans l'ordre ; la première atteinte bloque la requête.
 */
export async function consumeSharedLimits(
  admin: AdminClient,
  limits: readonly SharedLimit[],
): Promise<SharedLimitVerdict> {
  for (const limit of limits) {
    const { data, error } = await admin.rpc('consume_rate_limit', {
      p_key: limit.key,
      p_limit: limit.max,
      p_window_seconds: limit.windowSeconds,
    });
    if (error) {
      serverLog.error('rateLimit', error);
      return 'error';
    }
    if (data !== true) return 'limited';
  }
  return 'allowed';
}

/** Clé pseudonyme : une adresse IP ou e-mail n'est jamais stockée en clair. */
export async function hashedKey(scope: string, value: string): Promise<string> {
  return `${scope}:${await sha256(value)}`;
}

export const HOUR = 3600;
export const DAY = 24 * HOUR;
