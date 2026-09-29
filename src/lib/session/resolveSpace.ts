import type { Session } from '@/services/auth/AuthService';

/**
 * Espace affiché selon la session :
 * - `auth` : connexion et inscription ;
 * - `account` : compte à finaliser (nouveau mot de passe, parent invité) ;
 * - `onboarding` : élève qui n'a pas terminé l'onboarding ;
 * - `student` et `parent` : les deux espaces de l'app ;
 * - `unavailable` : compte illisible (hors ligne), l'écran propose de réessayer.
 */
export type Space =
  'loading' | 'unavailable' | 'auth' | 'account' | 'onboarding' | 'student' | 'parent';

export function resolveSpace(session: Session): Space {
  if (session.status === 'loading' || session.status === 'unavailable') return session.status;
  if (session.status === 'signedOut') return 'auth';
  const { account, recovery } = session;
  if (recovery) return 'account';
  if (account.role === 'parent') return account.accountReady ? 'parent' : 'account';
  return account.onboardingCompleted ? 'student' : 'onboarding';
}
