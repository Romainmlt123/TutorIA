/**
 * Journalisation explicite des erreurs. Point unique à brancher plus tard sur un service
 * de suivi (sans traceur tiers pour les mineurs) ; en attendant, la console en développement.
 */
export function logError(scope: string, error: unknown): void {
  if (__DEV__) {
    console.error(`[${scope}]`, error);
  }
}
