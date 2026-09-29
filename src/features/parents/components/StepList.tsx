import { StyleSheet, View } from 'react-native';

import { Icon, type IconName } from '@/components/Icon';
import { Text } from '@/components/Text';
import { theme, type SpaceTone } from '@/theme';

type Props = { title: string; icon: IconName; steps: readonly string[]; tone?: SpaceTone };

/** Étapes numérotées dans des ronds de 32 px de la couleur douce de l'espace (L6). */
export function StepList({ title, icon, steps, tone = 'parent' }: Props) {
  const space = theme.spaces[tone];
  return (
    <View accessibilityLabel={title} style={styles.card}>
      <View style={styles.title}>
        <Icon name={icon} size={20} color={space.ink} strokeWidth={2} />
        <Text variant="body" weight="black" accessibilityRole="header">
          {title}
        </Text>
      </View>
      {steps.map((step, index) => (
        <View key={step} style={styles.step}>
          <View style={[styles.number, { backgroundColor: space.soft }]}>
            <Text variant="label" weight="black" color={space.ink}>
              {index + 1}
            </Text>
          </View>
          <Text variant="label" color={theme.palette.gray[700]} style={styles.stepText}>
            {step}
          </Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: 14,
    padding: theme.space[5],
    borderRadius: theme.radius['3xl'],
    backgroundColor: theme.colors.surface,
    boxShadow: theme.shadow.md,
  },
  title: { flexDirection: 'row', alignItems: 'center', gap: theme.space[2] },
  step: { flexDirection: 'row', alignItems: 'center', gap: theme.space[3] },
  number: {
    width: theme.space[8],
    height: theme.space[8],
    borderRadius: theme.radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepText: { flex: 1 },
});
