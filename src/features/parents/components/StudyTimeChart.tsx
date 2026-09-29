import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, View } from 'react-native';
import Svg, { Line } from 'react-native-svg';

import { Pill } from '@/components/Pill';
import { Text } from '@/components/Text';
import { fr } from '@/i18n/fr';
import { formatDuration } from '@/lib/format';
import { weekdayIndex } from '@/lib/parisTime';
import { extras, theme } from '@/theme';

import { dayBarKind } from '../logic/parentSpace';
import type { DayActivity } from '@/services/parents/ParentService';

const CHART_HEIGHT = 130;
const MIN_BAR = 6;
const INITIALS = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];

type Props = { days: readonly DayActivity[]; goalMinutes: number; note: string };

/** P1 · Temps d'étude par jour : dégradé quand l'objectif est atteint, ligne d'objectif en pointillés. */
export function StudyTimeChart({ days, goalMinutes, note }: Props) {
  const t = fr.parent.home;
  const scaleMax = Math.max(goalMinutes * 2, ...days.map((d) => d.minutes), 1);
  const goalTop = CHART_HEIGHT - (goalMinutes / scaleMax) * CHART_HEIGHT;
  return (
    <View style={styles.card}>
      <View style={styles.head}>
        <Text variant="section" accessibilityRole="header">
          {t.chartTitle}
        </Text>
        <Pill
          label={t.goalPill(goalMinutes)}
          backgroundColor={theme.colors.primarySoft}
          color={theme.colors.primaryHover}
        />
      </View>
      <View style={styles.chart}>
        <Svg style={[styles.goal, { top: goalTop }]} height={2} width="100%">
          <Line
            x1="0"
            y1="1"
            x2="100%"
            y2="1"
            stroke={theme.palette.gray[300]}
            strokeWidth={1.5}
            strokeDasharray="4 4"
          />
        </Svg>
        <View style={styles.bars}>
          {days.map((day) => {
            const kind = dayBarKind(day.minutes, goalMinutes);
            const height = Math.max(MIN_BAR, Math.round((day.minutes / scaleMax) * CHART_HEIGHT));
            const label = t.chartLabel(
              fr.dates.weekdays[weekdayIndex(day.date)] ?? '',
              day.minutes > 0 ? formatDuration(day.minutes) : t.noSession,
            );
            return (
              <View
                key={day.date}
                accessible
                accessibilityLabel={label}
                style={[styles.bar, { height }]}>
                {kind === 'reached' ? (
                  <LinearGradient
                    colors={[...extras.chartBarGradient]}
                    style={StyleSheet.absoluteFill}
                  />
                ) : (
                  <View
                    style={[
                      StyleSheet.absoluteFill,
                      {
                        backgroundColor:
                          kind === 'below' ? theme.palette.blue[200] : theme.palette.gray[200],
                      },
                    ]}
                  />
                )}
              </View>
            );
          })}
        </View>
      </View>
      <View
        style={styles.labels}
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants">
        {days.map((day) => (
          <Text
            key={day.date}
            variant="caption"
            color="textSecondary"
            align="center"
            style={styles.label}>
            {INITIALS[weekdayIndex(day.date)]}
          </Text>
        ))}
      </View>
      <View style={styles.note}>
        <Text variant="hint" color="textSecondary">
          {note}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: theme.space[4],
    padding: theme.space[5],
    borderRadius: theme.radius['3xl'],
    backgroundColor: theme.colors.surface,
    boxShadow: theme.shadow.md,
  },
  // Comme la maquette, le titre et l'objectif tiennent sur une ligne à 390 px ; avec un texte agrandi,
  // l'objectif passe dessous plutôt que de couper le titre.
  head: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'space-between',
    columnGap: theme.space[1],
    rowGap: theme.space[2],
  },
  chart: { height: CHART_HEIGHT },
  goal: { position: 'absolute', left: 0, right: 0 },
  bars: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: theme.space[3],
  },
  bar: {
    flex: 1,
    overflow: 'hidden',
    borderTopLeftRadius: theme.space[2],
    borderTopRightRadius: theme.space[2],
    borderBottomLeftRadius: 3,
    borderBottomRightRadius: 3,
  },
  labels: { flexDirection: 'row', gap: theme.space[3] },
  label: { flex: 1 },
  note: {
    paddingVertical: theme.space[3],
    paddingHorizontal: 14,
    borderRadius: 14,
    backgroundColor: theme.colors.bg,
  },
});
