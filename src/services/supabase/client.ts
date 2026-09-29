import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { AppState, Platform } from 'react-native';

import { config } from '@/lib/config';

import type { Database } from '../db/database.types';

export type AppSupabaseClient = SupabaseClient<Database>;

let client: AppSupabaseClient | null = null;

/**
 * Client Supabase de l'app : URL du projet et clé publiable seulement (jamais la clé secrète).
 * - Session gardée dans AsyncStorage (localStorage sur le web).
 * - Rendu web côté serveur : ni stockage ni rafraîchissement, `window` n'existe pas.
 * - `detectSessionInUrl` désactivé : tous les parcours passent par des codes ou un `token_hash`.
 */
export function getSupabase(): AppSupabaseClient {
  if (client) return client;
  if (config.backend !== 'supabase') throw new Error('Supabase non configuré (mode simulé)');

  const inBrowserOrApp = typeof window !== 'undefined';
  const created = createClient<Database>(config.supabaseUrl, config.supabasePublishableKey, {
    auth: {
      storage: inBrowserOrApp ? AsyncStorage : undefined,
      persistSession: inBrowserOrApp,
      autoRefreshToken: inBrowserOrApp,
      detectSessionInUrl: false,
    },
  });

  // Mobile : le jeton n'est rafraîchi que lorsque l'app est au premier plan.
  if (Platform.OS !== 'web') {
    AppState.addEventListener('change', (state) => {
      if (state === 'active') void created.auth.startAutoRefresh();
      else void created.auth.stopAutoRefresh();
    });
  }
  client = created;
  return created;
}
