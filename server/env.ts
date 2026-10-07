import { z } from 'zod';

/*
 * Seul point de lecture des secrets. Ces variables ne sont jamais préfixées EXPO_PUBLIC_ :
 * elles restent sur le serveur et ne sont pas embarquées dans l'app.
 */
const schema = z.object({
  OPENAI_API_KEY: z.string().min(1),
  OPENAI_TEXT_MODEL: z.string().min(1),
  OPENAI_VOCAL_MODEL: z.string().min(1),
});

export type ServerEnv = { apiKey: string; textModel: string; vocalModel: string };

/** Modèle de modération : la documentation OpenAI recommande de le passer explicitement. */
export const MODERATION_MODEL = 'omni-moderation-latest';

/** Voix du tuteur vocal. */
export const REALTIME_VOICE = 'marin';

export class ServerConfigError extends Error {}

let cached: ServerEnv | null = null;

export function getServerEnv(): ServerEnv {
  if (cached) return cached;
  const parsed = schema.safeParse(process.env);
  if (!parsed.success) {
    // Seuls les noms des variables manquantes sont indiqués, jamais leur valeur.
    const missing = parsed.error.issues.map((issue) => issue.path.join('.')).join(', ');
    throw new ServerConfigError(`Variables d'environnement manquantes : ${missing}`);
  }
  cached = {
    apiKey: parsed.data.OPENAI_API_KEY,
    textModel: parsed.data.OPENAI_TEXT_MODEL,
    vocalModel: parsed.data.OPENAI_VOCAL_MODEL,
  };
  return cached;
}

/*
 * Supabase côté serveur. La clé secrète (sb_secret_…) contourne la RLS : elle ne sort jamais du serveur.
 * EXPO_PUBLIC_SUPABASE_URL est publique ; elle est lue explicitement pour ne pas dépendre de l'injection.
 */
const supabaseSchema = z.object({
  url: z.url(),
  secretKey: z.string().min(1),
  linkCodePepper: z.string().regex(/^[0-9a-f]{64}$/i),
});

export type SupabaseServerEnv = z.infer<typeof supabaseSchema>;

let cachedSupabase: SupabaseServerEnv | null = null;

export function getSupabaseEnv(): SupabaseServerEnv {
  if (cachedSupabase) return cachedSupabase;
  const parsed = supabaseSchema.safeParse({
    url: process.env.EXPO_PUBLIC_SUPABASE_URL,
    secretKey: process.env.SUPABASE_SECRET_KEY,
    linkCodePepper: process.env.LINK_CODE_PEPPER,
  });
  if (!parsed.success) {
    const names: Record<string, string> = {
      url: 'EXPO_PUBLIC_SUPABASE_URL',
      secretKey: 'SUPABASE_SECRET_KEY',
      linkCodePepper: 'LINK_CODE_PEPPER (64 caractères hexadécimaux)',
    };
    const missing = parsed.error.issues.map((issue) => names[String(issue.path[0])]).join(', ');
    throw new ServerConfigError(`Variables d'environnement manquantes ou invalides : ${missing}`);
  }
  cachedSupabase = parsed.data;
  return cachedSupabase;
}
