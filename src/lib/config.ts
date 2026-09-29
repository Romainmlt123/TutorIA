/**
 * Configuration publique de l'app (variables EXPO_PUBLIC_*, lisibles par tous : aucun secret ici).
 * - EXPO_PUBLIC_SUPABASE_URL et EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY : projet Supabase.
 *   La clé publiable est publique par nature : la sécurité repose sur la RLS.
 * - EXPO_PUBLIC_BACKEND : `supabase` (par défaut si le projet est configuré) ou `mock`
 *   (comptes de démonstration en mémoire, hors ligne). Le mode `mock` simule aussi le tuteur.
 * - EXPO_PUBLIC_TUTOR_MODE : `live` (par défaut, vrai tuteur via le serveur) ou `mock` (simulé).
 * - EXPO_PUBLIC_API_BASE_URL : adresse du serveur intermédiaire si elle diffère de celle de l'app.
 */
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL?.replace(/\/$/, '') ?? '';
const supabasePublishableKey = process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? '';

const backend: 'supabase' | 'mock' =
  process.env.EXPO_PUBLIC_BACKEND === 'mock' || !supabaseUrl || !supabasePublishableKey
    ? 'mock'
    : 'supabase';

export const config = {
  backend,
  supabaseUrl,
  supabasePublishableKey,
  tutorMode: backend === 'mock' || process.env.EXPO_PUBLIC_TUTOR_MODE === 'mock' ? 'mock' : 'live',
  apiBaseUrl: process.env.EXPO_PUBLIC_API_BASE_URL?.replace(/\/$/, '') ?? '',
} as const;
