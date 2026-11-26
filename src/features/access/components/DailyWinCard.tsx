import { StyleSheet, View } from 'react-native';

import { GradientSurface } from '@/components/GradientSurface';
import { Icon } from '@/components/Icon';
import { Text } from '@/components/Text';
import { Watermark } from '@/components/Watermark';
import { fr } from '@/i18n/fr';
import { formatDuration } from '@/lib/format';
import { extras, theme } from '@/theme';

const t = fr.studyPause;
const P = extras.studyPause;

type Props = { todaySeconds: number; streakDays: number };

/**
 * R3 · Temps du jour atteint : la carte verte qui félicite (temps révisé, jauge pleine, maximum
 * décidé avec les parents, série qui continue) avant de proposer la suite.
 */
export function DailyWinCard({ todaySeconds, streakDays }: Props) {
  const time = formatDuration(todaySeconds / 60);
  return (
    <GradientSurface
      gradient={P.win}
      angle={theme.gradientAngle}
      shadow={P.buttonShadow}
      contentStyle={styles.card}>
      <Watermark icon="trophee" size={120} offset={-28} opacity={0.14} strokeWidth={2} />
      <View accessible accessibilityLabel={t.todayLabel(time)} style={styles.head}>
        <View style={styles.tile}>
          <Icon name="trophee" size={26} color={theme.colors.textOnColor} strokeWidth={2} />
        </View>
        <View>
          <Text variant="hero" color="textOnColor">
            {time}
          </Text>
          <Text variant="body" weight="bold" color="textOnColor">
            {t.today}
          </Text>
        </View>
      </View>
      <View aria-hidden style={styles.gauge} />
      <Text variant="hint" weight="medium" color="textOnColor" style={styles.max}>
        {t.dailyMax}
      </Text>
      {streakDays > 0 ? (
        <View style={styles.streak}>
          <Icon name="flamme" size={14} color={theme.colors.textOnColor} />
          <Text variant="hint" weight="bold" color="textOnColor">
            {t.streak(streakDays)}
          </Text>
        </View>
      ) : null}
    </GradientSurface>
  );
}

const styles = StyleSheet.create({
  card: { gap: 14, padding: theme.space[5] },
  head: { flexDirection: 'row', alignItems: 'center', gap: theme.space[3] },
  tile: {
    width: 48,
    height: 48,
    borderRadius: theme.radius['2xl'],
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: P.tile,
  },
  gauge: {
    height: 10,
    borderRadius: theme.radius.full,
    backgroundColor: theme.colors.surface,
  },
  max: { marginTop: -6, opacity: 0.9 },
  streak: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    height: 30,
    paddingLeft: 10,
    paddingRight: theme.space[3],
    borderRadius: theme.radius.full,
    backgroundColor: P.pill,
  },
});
