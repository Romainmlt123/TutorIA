import type { OnboardingAnswers } from '@/data/types';

import type { MockAuthService } from '../../auth/mock/MockAuthService';
import type { OnboardingService } from '../OnboardingService';

const EMPTY: OnboardingAnswers = {
  grade: null,
  selfAssessment: {},
  goals: [],
  dailyMinutes: null,
  modes: [],
  moments: [],
  reminder: false,
};

/** Onboarding simulé, en mémoire. */
export class MockOnboardingService implements OnboardingService {
  private answers: OnboardingAnswers = EMPTY;

  constructor(private readonly auth: MockAuthService) {}

  async load(): Promise<OnboardingAnswers> {
    return this.answers;
  }

  async save(answers: OnboardingAnswers): Promise<void> {
    this.answers = answers;
  }

  async complete(answers: OnboardingAnswers): Promise<void> {
    this.answers = answers;
    this.auth.updateAccount({ onboardingCompleted: true, grade: answers.grade });
  }
}
