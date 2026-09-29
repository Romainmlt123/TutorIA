import { StyleSheet, View } from 'react-native';

import { Text } from '@/components/Text';
import { fr } from '@/i18n/fr';
import { extras, theme } from '@/theme';

import type { Heatmap } from '../logic/heatmap';

const CELL = 18;
const GAP = 4;
const DAY_COLUMN = 16;

/** Calendrier d'activité : 13 semaines × 7 jours, 5 niveaux de bleu. */
export function ActivityHeatmap({ heatmap }: { heatmap: Heatmap }) {
  return (
    <View
      accessible
      accessibilityRole="image"
      accessibilityLabel={fr.stats.activeDays(heatmap.activeDays, heatmap.totalDays)}
      style={styles.wrapper}>
      <View style={styles.months}>
        {heatmap.months.map((month) => (
          <Text
            key={month.label}
            variant="caption"
            weight="regular"
            color="textSecondary"
            style={[
              styles.month,
              { left: DAY_COLUMN + theme.space[2] + month.week * (CELL + GAP) },
            ]}>
            {month.label}
          </Text>
        ))}
      </View>
      <View style={styles.body}>
        <View style={styles.days}>
          {fr.stats.weekdays.map((day, i) => (
            <Text
              key={i}
              variant="caption"
              weight="regular"
              color="textSecondary"
              style={styles.day}>
              {day}
            </Text>
          ))}
        </View>
        <View style={styles.grid}>
          {heatmap.weeks.map((week, w) => (
            <View key={w} style={styles.week}>
              {week.map((day) => (
                <View
                  key={day.date.toISOString()}
                  style={[styles.cell, { backgroundColor: extras.heatmapLevels[day.level] }]}
                />
              ))}
            </View>
          ))}
        </View>
      </View>
      <View style={styles.legend}>
        <Text variant="caption" weight="regular" color="textSecondary" style={styles.legendText}>
          {fr.stats.less}
        </Text>
        {extras.heatmapLevels.map((color) => (
          <View key={color} style={[styles.legendCell, { backgroundColor: color }]} />
        ))}
        <Text variant="caption" weight="regular" color="textSecondary" style={styles.legendMore}>
          {fr.stats.more}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { gap: theme.space[2] },
  months: { height: 16 },
  month: { position: 'absolute', top: 0 },
  body: { flexDirection: 'row', gap: theme.space[2] },
  days: { width: DAY_COLUMN, gap: GAP },
  day: { lineHeight: CELL },
  grid: { flexDirection: 'row', gap: GAP },
  week: { gap: GAP },
  cell: { width: CELL, height: CELL, borderRadius: 4 },
  legend: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: GAP,
    marginTop: theme.space[2],
  },
  legendText: { marginRight: GAP },
  legendMore: { marginLeft: GAP },
  legendCell: { width: 12, height: 12, borderRadius: 3 },
});
