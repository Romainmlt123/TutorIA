import { StyleSheet, View } from 'react-native';
import Svg, { Line } from 'react-native-svg';

import { GradientSurface } from '@/components/GradientSurface';
import { Text } from '@/components/Text';
import { extras, theme } from '@/theme';

import { formatAxis, formatDuration, niceAxis, scaleBars } from '../logic/format';

type Props = { series: readonly { label: string; minutes: number }[]; accessibilityLabel: string };

const HEIGHT = 140;
const PLOT = HEIGHT - 1;
const AXIS_WIDTH = 44;
const BARS_LEFT = 52;

/** Histogramme du temps d'étude : barres en dégradé violet → bleu, grille en pointillés. */
export function BarChart({ series, accessibilityLabel }: Props) {
  const axis = niceAxis(Math.max(...series.map((s) => s.minutes)));
  const heights = scaleBars(
    series.map((s) => s.minutes),
    axis.max,
    PLOT,
  );
  const values = series.map((s) => `${s.label} ${formatDuration(s.minutes)}`).join(', ');
  return (
    <View
      accessible
      accessibilityRole="image"
      accessibilityLabel={`${accessibilityLabel} : ${values}`}
      style={styles.wrapper}>
      <View style={styles.plot}>
        <View style={styles.grid}>
          <Svg width="100%" height={HEIGHT}>
            <Line
              x1="0"
              x2="100%"
              y1="0.5"
              y2="0.5"
              stroke={theme.colors.border}
              strokeDasharray="4 4"
            />
            <Line
              x1="0"
              x2="100%"
              y1={HEIGHT / 2}
              y2={HEIGHT / 2}
              stroke={theme.colors.border}
              strokeDasharray="4 4"
            />
            <Line x1="0" x2="100%" y1={PLOT + 0.5} y2={PLOT + 0.5} stroke={theme.colors.border} />
          </Svg>
        </View>
        <Text
          variant="caption"
          weight="regular"
          color="textSecondary"
          style={[styles.tick, { top: -8 }]}>
          {formatAxis(axis.max, axis.max)}
        </Text>
        <Text
          variant="caption"
          weight="regular"
          color="textSecondary"
          style={[styles.tick, { top: HEIGHT / 2 - 8 }]}>
          {formatAxis(axis.mid, axis.max)}
        </Text>
        <Text
          variant="caption"
          weight="regular"
          color="textSecondary"
          style={[styles.tick, { top: PLOT - 7 }]}>
          0
        </Text>
        <View style={styles.bars}>
          {series.map((s, i) => (
            <GradientSurface
              key={`${s.label}-${i}`}
              gradient={extras.chartBarGradient}
              angle={180}
              radius={0}
              style={[styles.bar, { height: heights[i] ?? 0 }]}
            />
          ))}
        </View>
      </View>
      <View style={styles.labels}>
        {series.map((s, i) => (
          <Text
            key={`${s.label}-${i}`}
            variant="caption"
            weight="regular"
            color="textSecondary"
            align="center"
            style={styles.label}>
            {s.label}
          </Text>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { gap: theme.space[2] },
  plot: { height: HEIGHT },
  grid: { position: 'absolute', left: AXIS_WIDTH, right: 0, top: 0, height: HEIGHT },
  tick: { position: 'absolute', left: 0 },
  bars: {
    position: 'absolute',
    left: BARS_LEFT,
    right: theme.space[2],
    top: 0,
    bottom: 1,
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: theme.space[3],
  },
  bar: {
    flex: 1,
    borderTopLeftRadius: 6,
    borderTopRightRadius: 6,
    borderBottomLeftRadius: 2,
    borderBottomRightRadius: 2,
    overflow: 'hidden',
  },
  labels: {
    flexDirection: 'row',
    gap: theme.space[3],
    paddingLeft: BARS_LEFT,
    paddingRight: theme.space[2],
  },
  label: { flex: 1 },
});
