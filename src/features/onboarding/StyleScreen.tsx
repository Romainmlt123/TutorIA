import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { Switch } from '@/components/form/Switch';
import { Icon, type IconName } from '@/components/Icon';
import { Text } from '@/components/Text';
import type { LearningMode, StudyMoment, SubjectId } from '@/data/types';
import { fr } from '@/i18n/fr';
import { theme } from '@/theme';

import { OnboardingStepLayout } from './components/OnboardingStepLayout';
import { SelectableCard } from './components/SelectableCard';
import { ToggleChip } from './components/ToggleChip';
import { useOnboarding } from './hooks/useOnboarding';
import { toggleValue } from './logic/onboarding';
import { requestReminderPermission } from './logic/reminder';

const MODES: readonly { id: LearningMode; icon: IconName; color: SubjectId }[] = [
  { id: 'written', icon: 'bulle-chat', color: 'francais' },
  { id: 'voice', icon: 'micro', color: 'physique-chimie' },
  { id: 'visual', icon: 'graphique', color: 'maths' },
  { id: 'quiz', icon: 'cartes', color: 'anglais' },
];

const MOMENTS: readonly { id: StudyMoment; icon: IconName }[] = [
  { id: 'morning', icon: 'soleil' },
  { id: 'after_school', icon: 'horloge' },
  { id: 'evening', icon: 'lune' },
  { id: 'weekend', icon: 'calendrier' },
];

/** O4 · Façon d'apprendre, moment de révision et rappel. */
export function StyleScreen() {
  const { answers, update } = useOnboarding();
  const [denied, setDenied] = useState(false);
  const t = fr.onboarding.style;

  // La permission n'est demandée qu'au moment où l'élève active le rappel (jamais au lancement).
  const toggleReminder = async (enabled: boolean) => {
    if (!enabled) {
      update({ reminder: false });
      return;
    }
    const granted = await requestReminderPermission();
    setDenied(!granted);
    update({ reminder: granted });
  };

  return (
    <OnboardingStepLayout step="style" title={t.title} subtitle={t.subtitle} ctaLabel={t.finish}>
      <View style={styles.modes}>
        {MODES.map((mode) => (
          <SelectableCard
            key={mode.id}
            layout="row"
            label={t.modes[mode.id].label}
            hint={t.modes[mode.id].hint}
            icon={mode.icon}
            gradient={theme.subjects[mode.color].gradient}
            selected={answers.modes.includes(mode.id)}
            onPress={() => update({ modes: toggleValue(answers.modes, mode.id) })}
          />
        ))}
      </View>
      <View style={styles.section}>
        <Text variant="section">{t.momentsTitle}</Text>
        <View role="group" accessibilityLabel={t.momentsTitle} style={styles.grid}>
          {MOMENTS.map((moment) => (
            <View key={moment.id} style={styles.cell}>
              <ToggleChip
                label={t.moments[moment.id]}
                icon={moment.icon}
                selected={answers.moments.includes(moment.id)}
                onPress={() => update({ moments: toggleValue(answers.moments, moment.id) })}
              />
            </View>
          ))}
        </View>
        <View style={styles.reminder}>
          <View style={styles.bell}>
            <Icon name="cloche" size={18} color={theme.colors.textOnColor} strokeWidth={2} />
          </View>
          <Text variant="lead" weight="bold" style={styles.reminderLabel}>
            {t.reminder}
          </Text>
          <Switch
            value={answers.reminder}
            onValueChange={(enabled) => void toggleReminder(enabled)}
            accessibilityLabel={t.reminder}
          />
        </View>
        {denied ? (
          <Text variant="hint" color="textSecondary">
            {t.reminderDenied}
          </Text>
        ) : null}
      </View>
    </OnboardingStepLayout>
  );
}

const styles = StyleSheet.create({
  modes: { gap: 10 },
  section: { gap: 10 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: -4, rowGap: theme.space[2] },
  cell: { width: '50%', paddingHorizontal: theme.space[1], flexDirection: 'row' },
  reminder: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.space[3],
    paddingVertical: theme.space[3],
    paddingHorizontal: theme.space[4],
    borderRadius: theme.radius['2xl'],
    backgroundColor: theme.colors.surface,
    boxShadow: theme.shadow.sm,
  },
  bell: {
    width: 36,
    height: 36,
    borderRadius: theme.space[3],
    backgroundColor: theme.palette.orange[500],
    alignItems: 'center',
    justifyContent: 'center',
  },
  reminderLabel: { flex: 1 },
});
