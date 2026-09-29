import { StyleSheet, View } from 'react-native';

import { GradientSurface } from '@/components/GradientSurface';
import { Icon } from '@/components/Icon';
import { Text } from '@/components/Text';
import type { SubjectId } from '@/data/types';
import { subjectTheme, theme } from '@/theme';

type Props = { subjectId: SubjectId; kicker: string; title: string; reason: string };

/** Étape du plan de O5 : tuile de la matière, surtitre, titre et raison du choix. */
export function PlanRow({ subjectId, kicker, title, reason }: Props) {
  const subject = subjectTheme(subjectId);
  return (
    <View accessible accessibilityLabel={`${kicker} : ${title}. ${reason}`} style={styles.card}>
      <GradientSurface
        gradient={subject.gradient}
        radius={theme.radius['2xl']}
        style={styles.tile}
        contentStyle={styles.center}>
        <Icon name={subject.icon} size={22} color={theme.colors.textOnColor} />
      </GradientSurface>
      <View style={styles.text}>
        <Text variant="overline" color="textSecondary">
          {kicker}
        </Text>
        <Text variant="rowTitle">{title}</Text>
        <Text variant="hint" color="textSecondary">
          {reason}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: 14,
    paddingHorizontal: theme.space[4],
    borderRadius: theme.radius['3xl'],
    backgroundColor: theme.colors.surface,
    boxShadow: theme.shadow.md,
  },
  tile: { width: theme.space[12], height: theme.space[12] },
  center: { flexGrow: 1, alignItems: 'center', justifyContent: 'center' },
  text: { flex: 1, gap: 2 },
});
