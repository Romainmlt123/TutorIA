import { StyleSheet, View } from 'react-native';

import { Icon } from '@/components/Icon';
import { Pill } from '@/components/Pill';
import { Text } from '@/components/Text';
import { fr } from '@/i18n/fr';
import { formatDuration } from '@/lib/format';
import type { SessionMode } from '@/services/parents/ParentService';
import { extras, theme } from '@/theme';

import type { SessionStats } from '../logic/parentSpace';
import { HeroCard } from './HeroCard';
import { StrongText } from './StrongText';

const MODES: readonly SessionMode[] = ['written', 'voice', 'flashcards'];

type Props = { stats: SessionStats; childName: string };

/** P3 · Cette semaine : total, répartition par mode et rappel de confidentialité. */
export function SessionsWeekCard({ stats, childName }: Props) {
  const t = fr.parent.sessions;
  return (
    <HeroCard icon="sessions">
      <View style={styles.head}>
        <Text variant="overline" color="textOnColor" style={styles.kicker}>
          {t.weekKicker}
        </Text>
        <Text variant="h2" weight="black" color="textOnColor" accessibilityRole="header">
          {t.weekTotal(stats.count, formatDuration(stats.minutes))}
        </Text>
      </View>
      <View style={styles.modes}>
        {MODES.filter((mode) => stats.byMode[mode] > 0).map((mode) => (
          <Pill
            key={mode}
            label={t.modeCount(t.modes[mode], stats.byMode[mode])}
            backgroundColor={theme.onColor.veil}
            color={theme.colors.textOnColor}
            size="md"
            style={styles.modePill}
          />
        ))}
      </View>
      <View style={styles.privacy}>
        <Icon name="bouclier" size={18} color={theme.colors.textOnColor} strokeWidth={2} />
        <StrongText
          variant="hint"
          weight="medium"
          color="textOnColor"
          text={t.privacy(childName)}
          style={styles.privacyText}
        />
      </View>
    </HeroCard>
  );
}

const styles = StyleSheet.create({
  head: { gap: 2 },
  kicker: { opacity: 0.85 },
  modes: { flexDirection: 'row', flexWrap: 'wrap', gap: theme.space[2] },
  modePill: { paddingVertical: 6 },
  privacy: {
    flexDirection: 'row',
    gap: 10,
    paddingVertical: theme.space[3],
    paddingHorizontal: 14,
    borderRadius: theme.radius['2xl'],
    backgroundColor: extras.privacyVeil,
  },
  privacyText: { flex: 1 },
});
