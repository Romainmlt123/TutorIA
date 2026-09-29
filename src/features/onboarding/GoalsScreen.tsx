import { StyleSheet, View } from 'react-native';

import { Icon, type IconName } from '@/components/Icon';
import { Text } from '@/components/Text';
import type { LearningGoal, SubjectId } from '@/data/types';
import { fr } from '@/i18n/fr';
import { theme } from '@/theme';

import { DurationPicker } from './components/DurationPicker';
import { OnboardingStepLayout } from './components/OnboardingStepLayout';
import { SelectableCard } from './components/SelectableCard';
import { useOnboarding } from './hooks/useOnboarding';
import { toggleValue } from './logic/onboarding';

/** Objectifs de O3 : icône et couleur de matière relevées sur la maquette. */
const GOALS: readonly { id: LearningGoal; icon: IconName; color: SubjectId }[] = [
  { id: 'raise_grades', icon: 'tendance-haut', color: 'histoire-geo' },
  { id: 'understand', icon: 'ampoule', color: 'physique-chimie' },
  { id: 'prepare_tests', icon: 'cible', color: 'maths' },
  { id: 'national_exam', icon: 'medaille', color: 'svt' },
  { id: 'get_ahead', icon: 'fusee', color: 'anglais' },
  { id: 'homework_faster', icon: 'livre', color: 'francais' },
];

const HIGH_SCHOOL = ['2de', '1re', 'Tle'];

/** O3 · Objectifs (choix multiple) et temps par jour. */
export function GoalsScreen() {
  const { answers, update } = useOnboarding();
  const t = fr.onboarding.goals;
  const label = (goal: LearningGoal) =>
    goal === 'national_exam' && answers.grade && HIGH_SCHOOL.includes(answers.grade)
      ? t.nationalExamHigh
      : t.items[goal];
  return (
    <OnboardingStepLayout step="objectifs" title={t.title} subtitle={t.subtitle}>
      <View style={styles.grid}>
        {GOALS.map((goal) => (
          <View key={goal.id} style={styles.cell}>
            <SelectableCard
              layout="tile"
              label={label(goal.id)}
              icon={goal.icon}
              gradient={theme.subjects[goal.color].gradient}
              selected={answers.goals.includes(goal.id)}
              onPress={() => update({ goals: toggleValue(answers.goals, goal.id) })}
              style={styles.fill}
            />
          </View>
        ))}
      </View>
      <View style={styles.section}>
        <Text variant="section">{t.time}</Text>
        <DurationPicker
          value={answers.dailyMinutes}
          onChange={(dailyMinutes) => update({ dailyMinutes })}
        />
        <View style={styles.tip}>
          <Icon name="ampoule" size={16} color={theme.colors.accent} strokeWidth={2} />
          <Text variant="hint" color="textSecondary" style={styles.tipText}>
            {t.tip}
          </Text>
        </View>
      </View>
    </OnboardingStepLayout>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: -6, rowGap: theme.space[3] },
  cell: { width: '50%', paddingHorizontal: 6 },
  fill: { flexGrow: 1 },
  section: { gap: theme.space[3] },
  tip: { flexDirection: 'row', gap: theme.space[2], alignItems: 'flex-start' },
  tipText: { flex: 1 },
});
