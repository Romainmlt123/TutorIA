import { StyleSheet, View } from 'react-native';

import { Pill } from '@/components/Pill';
import { ProgressRing } from '@/components/ProgressRing';
import { Text } from '@/components/Text';
import { fr } from '@/i18n/fr';
import type { ProgressPeriod } from '@/services/parents/ParentService';
import { theme } from '@/theme';

import type { GlobalMastery } from '../logic/parentSpace';
import { HeroCard } from './HeroCard';

type Props = { global: GlobalMastery; period: ProgressPeriod };

/** P2 · Maîtrise globale : anneau blanc de 96 px et évolution sur la période. */
export function MasteryHeroCard({ global, period }: Props) {
  const t = fr.parent.progress;
  return (
    <HeroCard icon="cible" contentStyle={styles.content}>
      <ProgressRing
        value={global.mastery / 100}
        label={`${global.mastery} %`}
        size={96}
        strokeWidth={10}
        onColor
        labelVariant="h3"
      />
      <View style={styles.text}>
        <Text variant="h3" weight="black" color="textOnColor" accessibilityRole="header">
          {t.global}
        </Text>
        <Pill
          label={t.delta(global.delta, period)}
          backgroundColor={theme.palette.green[500]}
          color={theme.palette.green[900]}
          size="md"
        />
        <Text variant="hint" weight="medium" color="textOnColor">
          {t.globalMeta(global.acquired, global.toConsolidate)}
        </Text>
      </View>
    </HeroCard>
  );
}

const styles = StyleSheet.create({
  content: { flexDirection: 'row', alignItems: 'center', gap: theme.space[5] },
  text: { flex: 1, gap: theme.space[2] },
});
