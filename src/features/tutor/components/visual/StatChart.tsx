import { StyleSheet, View } from 'react-native';
import Svg, { G, Line, Path, Rect, Text as SvgText } from 'react-native-svg';

import { Text } from '@/components/Text';
import { fr } from '@/i18n/fr';
import type { ChartVisual } from '@/services/tutor/visuals';
import { textStyle, theme } from '@/theme';
import { visualArt } from '@/theme/visualArt';

import { niceTicks, pieSlices, slicePath } from '../../logic/visualGeometry';

const FONT = textStyle('caption').fontFamily;
const BOLD = textStyle('caption', { weight: 'bold' }).fontFamily;
const SIZE = textStyle('caption').fontSize;
const PAD = { left: 30, right: 8, top: 22, bottom: 24 };

const format = (n: number) => String(Math.round(n * 100) / 100).replace('.', ',');

type Props = { visual: ChartVisual; width: number; height: number };

function Bars({ visual, width, height }: Props) {
  const plotW = width - PAD.left - PAD.right;
  const plotH = height - PAD.top - PAD.bottom;
  const max = Math.max(...visual.data.map((d) => d.value));
  const ticks = niceTicks(0, max, 4);
  const top = Math.max(max, ticks.at(-1) ?? max) || 1;
  const y = (v: number) => PAD.top + plotH - (v / top) * plotH;
  const slot = plotW / visual.data.length;
  const barW = Math.min(36, slot * 0.6);
  return (
    <Svg width={width} height={height} accessibilityLabel={visual.description}>
      {ticks.map((t) => (
        <G key={t}>
          <Line
            x1={PAD.left}
            x2={width - PAD.right}
            y1={y(t)}
            y2={y(t)}
            stroke={visualArt.grid}
            strokeWidth={1}
          />
          <SvgText
            x={PAD.left - 6}
            y={y(t) + 4}
            fontSize={SIZE}
            fontFamily={FONT}
            fill={visualArt.tick}
            textAnchor="end">
            {format(t)}
          </SvgText>
        </G>
      ))}
      {visual.data.map((d, i) => {
        const cx = PAD.left + slot * (i + 0.5);
        const barH = (d.value / top) * plotH;
        return (
          <G key={i}>
            <Rect
              x={cx - barW / 2}
              y={y(d.value)}
              width={barW}
              height={Math.max(barH, 1)}
              rx={6}
              fill={visualArt.tones[d.tone]}
            />
            <SvgText
              x={cx}
              y={y(d.value) - 6}
              fontSize={SIZE}
              fontFamily={BOLD}
              fill={visualArt.ink}
              textAnchor="middle">
              {format(d.value)}
            </SvgText>
            <SvgText
              x={cx}
              y={height - 6}
              fontSize={SIZE}
              fontFamily={FONT}
              fill={visualArt.tick}
              textAnchor="middle">
              {d.label.length > 10 ? `${d.label.slice(0, 9)}…` : d.label}
            </SvgText>
          </G>
        );
      })}
      <Line
        x1={PAD.left}
        x2={width - PAD.right}
        y1={y(0)}
        y2={y(0)}
        stroke={visualArt.axis}
        strokeWidth={1.5}
      />
    </Svg>
  );
}

function Pie({ visual, width, height }: Props) {
  const slices = pieSlices(visual.data.map((d) => d.value));
  const size = Math.min(height, width * 0.5);
  const r = size / 2 - 4;
  return (
    <View style={styles.pie} accessible accessibilityLabel={visual.description}>
      <Svg width={size} height={size}>
        {slices.map((slice, i) => (
          <Path
            key={i}
            d={slicePath(size / 2, size / 2, r, slice)}
            fill={visualArt.tones[visual.data[i]!.tone]}
            stroke={visualArt.surface}
            strokeWidth={2}
          />
        ))}
      </Svg>
      <View style={styles.legend}>
        {visual.data.map((d, i) => (
          <View key={i} style={styles.legendRow}>
            <View style={[styles.swatch, { backgroundColor: visualArt.tones[d.tone] }]} />
            <Text variant="caption" style={styles.legendText} numberOfLines={2}>
              {fr.tutor.visual.chartValue(d.label, format(d.value), visual.unit)}
              {slices[i] ? ` · ${Math.round(slices[i]!.share * 100)} %` : ''}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

/** Statistiques du tuteur : diagramme en barres (effectifs) ou circulaire (répartition). */
export function StatChart(props: Props) {
  return props.visual.chart === 'pie' ? <Pie {...props} /> : <Bars {...props} />;
}

const styles = StyleSheet.create({
  pie: { flexDirection: 'row', alignItems: 'center', gap: theme.space[3] },
  legend: { flex: 1, gap: theme.space[1] },
  legendRow: { flexDirection: 'row', alignItems: 'center', gap: theme.space[2] },
  swatch: { width: 12, height: 12, borderRadius: theme.radius.full },
  legendText: { flex: 1 },
});
