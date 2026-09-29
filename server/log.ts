/** Journal du serveur : jamais de clé, jamais de message complet d'un élève. */
export const serverLog = {
  warn(scope: string, details: Record<string, unknown>) {
    console.warn(`[tutor:${scope}]`, JSON.stringify(details));
  },
  error(scope: string, error: unknown) {
    const message = error instanceof Error ? `${error.name}: ${error.message}` : String(error);
    console.error(`[tutor:${scope}]`, message);
  },
};
