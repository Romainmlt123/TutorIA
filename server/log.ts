/** Une erreur en une ligne : son nom, son message, et ses causes (l'erreur réseau sous une erreur du SDK). */
function describe(error: unknown, depth = 0): string {
  if (error instanceof Error) {
    const cause =
      depth < 3 && error.cause !== undefined ? ` ← ${describe(error.cause, depth + 1)}` : '';
    return `${error.name}: ${error.message}${cause}`;
  }
  // Erreur de Supabase (PostgrestError) : un objet simple. Seuls son code et son message sont
  // gardés, pas ses détails, qui peuvent citer des valeurs.
  if (typeof error === 'object' && error !== null) {
    const { code, message } = error as { code?: unknown; message?: unknown };
    if (code !== undefined || message !== undefined) return `${String(code)}: ${String(message)}`;
  }
  return String(error);
}

/** Journal du serveur : jamais de clé, jamais de message complet d'un élève. */
export const serverLog = {
  warn(scope: string, details: Record<string, unknown>) {
    console.warn(`[tutor:${scope}]`, JSON.stringify(details));
  },
  error(scope: string, error: unknown) {
    console.error(`[tutor:${scope}]`, describe(error));
  },
};
