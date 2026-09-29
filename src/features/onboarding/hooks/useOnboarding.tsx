import { useRouter } from 'expo-router';
import { createContext, use, useEffect, useState, type ReactNode } from 'react';

import type { OnboardingAnswers } from '@/data/types';
import { fr } from '@/i18n/fr';
import { logError } from '@/lib/logger';
import { onboardingService } from '@/services/onboarding';

import { EMPTY_ANSWERS, nextStep, skipStep, type OnboardingStep } from '../logic/onboarding';

type OnboardingState = {
  answers: OnboardingAnswers;
  update: (patch: Partial<OnboardingAnswers>) => void;
  /** « Continuer » ou « Passer » : enregistre les réponses et ouvre l'étape suivante. */
  goNext: (step: OnboardingStep, options?: { skip?: boolean }) => void;
  /** O5 : fin de l'onboarding, l'espace élève s'ouvre. */
  complete: () => Promise<void>;
  completing: boolean;
  error: string | null;
};

const OnboardingContext = createContext<OnboardingState | null>(null);

/** Réponses de l'onboarding, partagées par O1 à O5 et enregistrées au fil des étapes. */
export function OnboardingProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [answers, setAnswers] = useState<OnboardingAnswers>(EMPTY_ANSWERS);
  const [completing, setCompleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Reprise : les réponses déjà enregistrées (onboarding interrompu) sont relues.
  useEffect(() => {
    let active = true;
    onboardingService
      .load()
      .then((saved) => {
        if (active) setAnswers(saved);
      })
      .catch((loadError: unknown) => logError('onboarding.load', loadError));
    return () => {
      active = false;
    };
  }, []);

  const update = (patch: Partial<OnboardingAnswers>) =>
    setAnswers((current) => ({ ...current, ...patch }));

  const goNext = (step: OnboardingStep, { skip = false }: { skip?: boolean } = {}) => {
    const next = skip ? skipStep(answers, step) : answers;
    setAnswers(next);
    // Un échec n'empêche pas d'avancer : tout est enregistré de nouveau à la fin.
    onboardingService
      .save(next)
      .catch((saveError: unknown) => logError('onboarding.save', saveError));
    router.push(`/onboarding/${nextStep(step)}`);
  };

  const complete = async () => {
    setCompleting(true);
    setError(null);
    try {
      await onboardingService.complete(answers);
    } catch (completeError) {
      logError('onboarding.complete', completeError);
      setError(fr.onboarding.saveFailed);
      setCompleting(false);
    }
  };

  return (
    <OnboardingContext value={{ answers, update, goNext, complete, completing, error }}>
      {children}
    </OnboardingContext>
  );
}

export function useOnboarding(): OnboardingState {
  const state = use(OnboardingContext);
  if (!state) throw new Error('useOnboarding hors de OnboardingProvider');
  return state;
}
