import { GradePicker } from '@/components/GradePicker';
import { fr } from '@/i18n/fr';
import { useStudentAccount } from '@/lib/session/SessionProvider';

import { OnboardingStepLayout } from './components/OnboardingStepLayout';
import { TutorBubble } from './components/TutorBubble';
import { useOnboarding } from './hooks/useOnboarding';

/** O1 · Classe, du CP à la Terminale. */
export function GradeScreen() {
  const student = useStudentAccount();
  const { answers, update } = useOnboarding();
  return (
    <OnboardingStepLayout
      step="classe"
      title={fr.onboarding.grade.title}
      subtitle={fr.onboarding.grade.subtitle}
      intro={<TutorBubble text={fr.onboarding.welcome(student?.firstName ?? '')} />}>
      <GradePicker value={answers.grade} onChange={(grade) => update({ grade })} />
    </OnboardingStepLayout>
  );
}
