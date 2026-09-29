import { StyleSheet, View } from 'react-native';

import { Card } from '@/components/Card';
import { Pill } from '@/components/Pill';
import { ProgressRing } from '@/components/ProgressRing';
import { Text } from '@/components/Text';
import { fr } from '@/i18n/fr';
import { theme } from '@/theme';

import { goalProgress } from '../logic/home';

type Props = { minutes: number; sessionsDone: number; sessionsTarget: number };

/** Objectif du jour : anneau 2/3, détail et encouragement. */
export function GoalCard({ minutes, sessionsDone, sessionsTarget }: Props) {
  return (
    <Card style={styles.card} accessibilityLabel={fr.home.goalSection}>
      <ProgressRing
        value={goalProgress(sessionsDone, sessionsTarget)}
        label={`${sessionsDone}/${sessionsTarget}`}
      />
      <View style={styles.texts}>
        <Text variant="body" weight="bold">
          {fr.home.goalTitle}
        </Text>
        <Text variant="bodySm" color="textSecondary">
          {fr.home.goalDetail(minutes, sessionsDone, sessionsTarget)}
        </Text>
      </View>
      <Pill
        label={fr.home.goalRemaining(sessionsTarget - sessionsDone)}
        backgroundColor={theme.colors.primarySoft}
        color={theme.colors.primary}
        size="md"
        style={styles.pill}
      />
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { flexDirection: 'row', alignItems: 'center', gap: theme.space[4] },
  texts: { flex: 1, gap: 2 },
  pill: { alignSelf: 'center' },
});
