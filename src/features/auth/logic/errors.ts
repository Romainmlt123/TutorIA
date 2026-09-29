import { fr } from '@/i18n/fr';
import { logError } from '@/lib/logger';
import { AuthError } from '@/services/auth';
import type { SpaceTone } from '@/theme';

import type { SignUpError } from './validation';

type Messages = (typeof fr)['studentAuth']['errors'] | (typeof fr)['parent']['errors'];

export function errorMessages(tone: SpaceTone): Messages {
  return tone === 'parent' ? fr.parent.errors : fr.studentAuth.errors;
}

/** Message d'un champ invalide, au ton de l'espace. */
export function fieldMessage(error: SignUpError | undefined, tone: SpaceTone): string | undefined {
  return error ? errorMessages(tone)[error] : undefined;
}

/** Message d'une erreur de parcours ; une erreur imprévue est journalisée et reste générique. */
export function authErrorMessage(error: unknown, tone: SpaceTone): string {
  const messages = errorMessages(tone);
  if (error instanceof AuthError && error.code in messages) {
    return messages[error.code as keyof Messages];
  }
  if (!(error instanceof AuthError)) logError('auth', error);
  return messages.default;
}
