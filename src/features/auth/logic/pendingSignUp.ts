import type { SpaceTone } from '@/theme';

/**
 * Inscription en attente du code reçu par e-mail. Gardée en mémoire seulement :
 * après un rechargement, l'écran de vérification redemande l'adresse.
 */
export type PendingSignUp = { tone: SpaceTone; email: string; parentEmail: string | null };

let pending: PendingSignUp | null = null;

export function setPendingSignUp(value: PendingSignUp | null): void {
  pending = value;
}

export function getPendingSignUp(): PendingSignUp | null {
  return pending;
}
