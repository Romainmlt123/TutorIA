import type { OnboardingAnswers } from '@/data/types';

/** Réponses de l'onboarding (O1 à O4), enregistrées dans le profil de l'élève. */
export interface OnboardingService {
  load(): Promise<OnboardingAnswers>;
  /** Enregistre toutes les réponses (une étape passée enregistre des réponses vides). */
  save(answers: OnboardingAnswers): Promise<void>;
  /** Fin de l'onboarding : l'espace élève s'ouvre. */
  complete(answers: OnboardingAnswers): Promise<void>;
}
