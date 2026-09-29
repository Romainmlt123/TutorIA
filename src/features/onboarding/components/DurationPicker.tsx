import { StyleSheet, View } from 'react-native';

import { GradientSurface } from '@/components/GradientSurface';
import { PressableBase } from '@/components/PressableBase';
import { Text } from '@/components/Text';
import type { DailyMinutes } from '@/data/types';
import { fr } from '@/i18n/fr';
import { theme } from '@/theme';

import { DAILY_MINUTES } from '../logic/onboarding';

type Props = { value: DailyMinutes | null; onChange: (minutes: DailyMinutes) => void };

/** Temps par jour (O3) : 10, 15, 20 ou 30 minutes, choix en dégradé bleu. */
export function DurationPicker({ value, onChange }: Props) {
  const space = theme.spaces.student;
  return (
    <View role="radiogroup" accessibilityLabel={fr.onboarding.goals.time} style={styles.row}>
      {DAILY_MINUTES.map((minutes) => {
        const selected = minutes === value;
        const content = (
          <>
            <Text variant="metric" color={selected ? 'textOnColor' : 'text'}>
              {minutes}
            </Text>
            <Text variant="caption" weight="bold" color={selected ? 'textOnColor' : 'text'}>
              {fr.onboarding.goals.minutes}
            </Text>
          </>
        );
        return (
          <PressableBase
            key={minutes}
            onPress={() => onChange(minutes)}
            role="radio"
            aria-checked={selected}
            accessibilityLabel={fr.onboarding.goals.timeLabel(minutes)}
            shadow={selected ? space.shadow : theme.shadow.sm}
            style={[styles.option, !selected && styles.idle]}>
            {selected ? (
              <GradientSurface
                gradient={space.gradient}
                radius={theme.radius['2xl']}
                style={StyleSheet.absoluteFill}
                contentStyle={styles.center}>
                {content}
              </GradientSurface>
            ) : (
              content
            )}
          </PressableBase>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: theme.space[2] },
  option: {
    flex: 1,
    height: 64,
    borderRadius: theme.radius['2xl'],
    alignItems: 'center',
    justifyContent: 'center',
  },
  idle: { borderWidth: 1, borderColor: theme.colors.border, backgroundColor: theme.colors.surface },
  center: { flexGrow: 1, alignItems: 'center', justifyContent: 'center' },
});
