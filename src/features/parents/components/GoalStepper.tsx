import { StyleSheet, View } from 'react-native';

import { GradientSurface } from '@/components/GradientSurface';
import { PressableBase } from '@/components/PressableBase';
import { Text } from '@/components/Text';
import { Watermark } from '@/components/Watermark';
import { fr } from '@/i18n/fr';
import { theme } from '@/theme';

import { dailyGoalMinutes } from '../logic/parentSpace';

type Props = { hours: number; childName: string; onChange: (hours: number) => void };

const MIN_HOURS = 1;
const MAX_HOURS = 10;

/** P4 · Objectif hebdomadaire, réglable avec − et +, à fixer avec l'enfant. */
export function GoalStepper({ hours, childName, onChange }: Props) {
  const t = fr.parent.settings.goal;
  const set = (value: number) => onChange(Math.max(MIN_HOURS, Math.min(MAX_HOURS, value)));
  return (
    <GradientSurface
      gradient={theme.subjects['histoire-geo'].gradient}
      shadow={theme.shadow.md}
      contentStyle={styles.content}>
      <Watermark icon="cible" size={120} offset={-28} placement="top" opacity={0.14} />
      <View style={styles.head}>
        <Text variant="overline" color="textOnColor">
          {t.title}
        </Text>
        <Text variant="label" weight="medium" color="textOnColor">
          {t.hint(childName, dailyGoalMinutes(hours))}
        </Text>
      </View>
      <View style={styles.row}>
        <PressableBase
          onPress={() => set(hours - 1)}
          disabled={hours <= MIN_HOURS}
          accessibilityRole="button"
          accessibilityLabel={t.decrease}
          style={[styles.button, styles.minus]}>
          <Text variant="title" weight="bold" color="textOnColor">
            −
          </Text>
        </PressableBase>
        <Text
          variant="display"
          weight="black"
          color="textOnColor"
          aria-live="polite"
          accessibilityLabel={t.label(hours)}>
          {t.value(hours)}
        </Text>
        <PressableBase
          onPress={() => set(hours + 1)}
          disabled={hours >= MAX_HOURS}
          accessibilityRole="button"
          accessibilityLabel={t.increase}
          style={[styles.button, styles.plus]}>
          <Text variant="title" weight="bold" color={theme.palette.green[800]}>
            +
          </Text>
        </PressableBase>
      </View>
    </GradientSurface>
  );
}

const styles = StyleSheet.create({
  content: { gap: theme.space[4], padding: theme.space[5] },
  head: { gap: 2 },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  button: {
    width: 52,
    height: 52,
    borderRadius: theme.radius['2xl'],
    alignItems: 'center',
    justifyContent: 'center',
  },
  minus: { backgroundColor: theme.onColor.veil },
  plus: { backgroundColor: theme.colors.surface },
});
