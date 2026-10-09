/**
 * Code parent tapé avant la connexion (v2.7, option A) : gardé en mémoire seulement, puis relié
 * juste après la connexion de l'élève, car il faut être connecté pour l'utiliser.
 */
let pending: string | null = null;

export function setPendingLinkCode(code: string | null): void {
  pending = code;
}

export function getPendingLinkCode(): string | null {
  return pending;
}
