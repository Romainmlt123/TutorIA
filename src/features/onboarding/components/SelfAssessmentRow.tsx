import { StyleSheet, View } from 'react-native';

import { GradientSurface } from '@/components/GradientSurface';
import { Icon } from '@/components/Icon';
import { PressableBase } from '@/components/PressableBase';
import { Text } from '@/components/Text';
import type { ComfortLevel, SubjectId } from '@/data/types';
import { fr } from '@/i18n/fr';
import { subjectTheme, theme } from '@/theme';

export const COMFORT_LEVELS: readonly ComfortLevel[] = ['struggling', 'meh', 'ok', 'confident'];

type Props = {
  subjectId: SubjectId;
  value: ComfortLevel | undefined;
  onChange: (level: ComfortLevel) => void;
};

/**
 * Auto-évaluation d'une matière (O2) : « Galère · Bof · Ça va · À l'aise », jamais une note.
 * Le niveau choisi est en dégradé, ceux d'avant en fond doux, ceux d'après en `bg`.
 */
export function SelfAssessmentRow({ subjectId, value, onChange }: Props) {
  const subject = subjectTheme(subjectId);
  const chosen = value === undefined ? -1 : COMFORT_LEVELS.indexOf(value);
  const labels = fr.onboarding.subjects.levels;
  return (
    <View style={styles.card}>
      <View style={styles.head}>
        <GradientSurface
          gradient={subject.gradient}
          radius={14}
          style={styles.tile}
          contentStyle={styles.center}>
          <Icon name={subject.icon} size={20} color={theme.colors.textOnColor} />
        </GradientSurface>
        <Text variant="cardTitle" style={styles.name}>
          {subject.name}
        </Text>
        {value ? (
          <Text variant="hint" weight="bold" color={subject.ink}>
            {labels[value]}
          </Text>
        ) : null}
      </View>
      <View
        role="radiogroup"
        accessibilityLabel={fr.onboarding.subjects.groupLabel(subject.name)}
        style={styles.levels}>
        {COMFORT_LEVELS.map((level, index) => {
          const selected = index === chosen;
          const before = chosen >= 0 && index < chosen;
          const label = (
            <Text
              variant="hint"
              weight="bold"
              color={selected ? 'textOnColor' : before ? subject.ink : 'textSecondary'}
              numberOfLines={1}
              maxFontSizeMultiplier={1.2}>
              {labels[level]}
            </Text>
          );
          return (
            <PressableBase
              key={level}
              onPress={() => onChange(level)}
              role="radio"
              aria-checked={selected}
              accessibilityLabel={`${subject.name} : ${labels[level]}`}
              style={[
                styles.level,
                !selected && { backgroundColor: before ? subject.soft : theme.colors.bg },
              ]}>
              {selected ? (
                <GradientSurface
                  gradient={subject.gradient}
                  radius={theme.space[3]}
                  style={StyleSheet.absoluteFill}
                  contentStyle={styles.center}>
                  {label}
                </GradientSurface>
              ) : (
                label
              )}
            </PressableBase>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: theme.space[3],
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderRadius: theme.radius['3xl'],
    backgroundColor: theme.colors.surface,
    boxShadow: theme.shadow.md,
  },
  head: { flexDirection: 'row', alignItems: 'center', gap: theme.space[3] },
  tile: { width: theme.space[10], height: theme.space[10] },
  center: { flexGrow: 1, alignItems: 'center', justifyContent: 'center' },
  name: { flex: 1 },
  levels: { flexDirection: 'row', gap: 6 },
  level: {
    flex: 1,
    height: theme.space[10],
    borderRadius: theme.space[3],
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
});
