import { StyleSheet, View } from 'react-native';

import { GradientSurface } from '@/components/GradientSurface';
import { Pill } from '@/components/Pill';
import { ProgressRing } from '@/components/ProgressRing';
import { Text } from '@/components/Text';
import { Watermark } from '@/components/Watermark';
import { fr } from '@/i18n/fr';
import { extras, theme } from '@/theme';

import { goalProgress } from '../logic/home';

type Props = { minutes: number; sessionsDone: number; sessionsTarget: number };

/** Objectif du jour (v2.5) : carte en dégradé violet → bleu, anneau blanc, détail et encouragement. */
export function GoalCard({ minutes, sessionsDone, sessionsTarget }: Props) {
  return (
    <View accessible accessibilityLabel={fr.home.goalSection}>
      <GradientSurface
        gradient={theme.goal.gradient}
        radius={theme.radius['3xl']}
        shadow={theme.shadow.md}
        contentStyle={styles.card}>
        <Watermark icon="cible" size={120} offset={-30} opacity={extras.watermarkOpacity.goal} />
        <ProgressRing
          value={goalProgress(sessionsDone, sessionsTarget)}
          label={`${sessionsDone}/${sessionsTarget}`}
          size={64}
          strokeWidth={7}
          labelVariant="body"
          onColor
        />
        <View style={styles.texts}>
          <Text variant="h3" weight="black" color="textOnColor">
            {fr.home.goalTitle}
          </Text>
          <Text variant="bodySm" weight="medium" color="textOnColor">
            {fr.home.goalDetail(minutes, sessionsDone, sessionsTarget)}
          </Text>
          <Pill
            label={fr.home.goalRemaining(sessionsTarget - sessionsDone)}
            backgroundColor={theme.colors.surface}
            color={theme.goal.gradient.colors[1]}
            style={styles.pill}
          />
        </View>
      </GradientSurface>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.space[4],
    paddingVertical: theme.space[5],
    paddingHorizontal: theme.space[5],
  },
  texts: { flex: 1, alignItems: 'flex-start', gap: 2 },
  pill: { marginTop: theme.space[2] },
});
