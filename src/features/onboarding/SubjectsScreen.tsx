import { StyleSheet, View } from 'react-native';

import type { SubjectId } from '@/data/types';
import { fr } from '@/i18n/fr';
import { theme } from '@/theme';

import { OnboardingStepLayout } from './components/OnboardingStepLayout';
import { SelfAssessmentRow } from './components/SelfAssessmentRow';
import { useOnboarding } from './hooks/useOnboarding';

/** Ordre de la maquette O2. */
const SUBJECTS: readonly SubjectId[] = [
  'maths',
  'francais',
  'histoire-geo',
  'physique-chimie',
  'svt',
  'anglais',
];

/** O2 · Auto-évaluation par matière : pas de note, pas de jugement. */
export function SubjectsScreen() {
  const { answers, update } = useOnboarding();
  return (
    <OnboardingStepLayout
      step="matieres"
      title={fr.onboarding.subjects.title}
      subtitle={fr.onboarding.subjects.subtitle}>
      <View style={styles.list}>
        {SUBJECTS.map((subjectId) => (
          <SelfAssessmentRow
            key={subjectId}
            subjectId={subjectId}
            value={answers.selfAssessment[subjectId]}
            onChange={(level) =>
              update({ selfAssessment: { ...answers.selfAssessment, [subjectId]: level } })
            }
          />
        ))}
      </View>
    </OnboardingStepLayout>
  );
}

const styles = StyleSheet.create({
  list: { gap: theme.space[3] },
});
