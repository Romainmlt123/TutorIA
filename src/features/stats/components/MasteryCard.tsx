import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, {
  Circle,
  Defs,
  Line,
  LinearGradient,
  Polygon,
  Polyline,
  Stop,
  Text as SvgText,
} from 'react-native-svg';

import { GradientSurface } from '@/components/GradientSurface';
import { Pill } from '@/components/Pill';
import { Text } from '@/components/Text';
import type { MasteryPoint } from '@/data/types';
import { extras, fontFamily, theme } from '@/theme';
import { fr } from '@/i18n/fr';

const HEIGHT = 160;
const LEFT = 40;
const RIGHT_MARGIN = 12;
const TOP = 10;
const BASELINE = 130;

type Props = {
  points: readonly MasteryPoint[];
  /** Une mesure par semaine (données simulées) ou par mois (base). */
  unit?: 'week' | 'month';
};

/** Évolution de la maîtrise : carte en dégradé bleu, courbe blanche, dernier point en vert. */
export function MasteryCard({ points, unit = 'week' }: Props) {
  const [width, setWidth] = useState(318);
  const first = points[0];
  const last = points.at(-1);
  if (!first || !last) return null;

  const min = Math.floor(Math.min(...points.map((p) => p.percent)) / 20) * 20;
  const max = Math.ceil(Math.max(...points.map((p) => p.percent)) / 20) * 20;
  const x = (i: number) =>
    LEFT + (i * (width - LEFT - RIGHT_MARGIN)) / Math.max(points.length - 1, 1);
  const y = (percent: number) => BASELINE - ((percent - min) / (max - min)) * (BASELINE - TOP);
  const coords = points.map((p, i) => `${x(i)},${y(p.percent)}`).join(' ');
  const ticks = [max, (max + min) / 2, min];
  const white = theme.colors.textOnColor;
  const label = {
    fill: white,
    fillOpacity: extras.chartOnColorOpacity.label,
    fontSize: 12,
    fontFamily: fontFamily.regular,
  };

  return (
    <GradientSurface
      gradient={theme.kpi.mastery}
      shadow={theme.shadow.md}
      contentStyle={styles.content}>
      <View style={styles.titles}>
        <Text variant="h3" weight="black" color="textOnColor" accessibilityRole="header">
          {fr.stats.mastery}
        </Text>
        {/* v2.5 : le titre prend toute la largeur, le badge suit le pourcentage. */}
        <View style={styles.header}>
          <Text variant="h1" weight="black" color="textOnColor">
            {`${last.percent} %`}
          </Text>
          <Pill
            label={fr.stats.masteryDelta(last.percent - first.percent, points.length, unit)}
            icon="tendance-haut"
            backgroundColor={theme.palette.green[500]}
            color={theme.palette.green[900]}
          />
        </View>
      </View>
      <View
        accessible
        accessibilityRole="image"
        accessibilityLabel={fr.stats.masteryLabel(
          first.percent,
          last.percent,
          first.label,
          last.label,
          unit,
        )}
        onLayout={(e) => setWidth(e.nativeEvent.layout.width)}>
        <Svg width="100%" height={HEIGHT}>
          <Defs>
            <LinearGradient id="aire" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0" stopColor={white} stopOpacity={extras.chartOnColorOpacity.areaTop} />
              <Stop offset="1" stopColor={white} stopOpacity={0} />
            </LinearGradient>
          </Defs>
          {ticks.map((tick, i) => (
            <Line
              key={tick}
              x1={LEFT}
              x2={width}
              y1={y(tick)}
              y2={y(tick)}
              stroke={white}
              strokeOpacity={
                i === ticks.length - 1
                  ? extras.chartOnColorOpacity.baseline
                  : extras.chartOnColorOpacity.grid
              }
              strokeDasharray={i === ticks.length - 1 ? undefined : '3 3'}
            />
          ))}
          {ticks.map((tick) => (
            <SvgText key={`t${tick}`} x={0} y={y(tick) + 4} {...label}>
              {`${tick} %`}
            </SvgText>
          ))}
          <Polygon
            points={`${coords} ${x(points.length - 1)},${BASELINE} ${LEFT},${BASELINE}`}
            fill="url(#aire)"
          />
          <Polyline
            points={coords}
            fill="none"
            stroke={white}
            strokeWidth={3}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {points.slice(0, -1).map((p, i) => (
            <Circle key={p.label} cx={x(i)} cy={y(p.percent)} r={3} fill={white} />
          ))}
          <Circle
            cx={x(points.length - 1)}
            cy={y(last.percent)}
            r={7}
            fill={theme.palette.green[500]}
            stroke={white}
            strokeWidth={3}
          />
          {points.map((p, i) =>
            i % 2 === 0 ? (
              <SvgText key={`l${p.label}`} x={x(i)} y={152} textAnchor="middle" {...label}>
                {p.label}
              </SvgText>
            ) : null,
          )}
        </Svg>
      </View>
    </GradientSurface>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: theme.space[4],
    paddingTop: theme.space[5],
    paddingHorizontal: theme.space[4],
    paddingBottom: theme.space[4],
  },
  header: { flexDirection: 'row', alignItems: 'center', gap: theme.space[3] },
  titles: { gap: theme.space[1] },
});
