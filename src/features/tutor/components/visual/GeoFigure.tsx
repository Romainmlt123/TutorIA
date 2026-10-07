import { useMemo } from 'react';
import Svg, { Circle, G, Line, Path, Rect, Text as SvgText } from 'react-native-svg';

import type { FigureVisual } from '@/services/tutor/visuals';
import { textStyle } from '@/theme';
import { visualArt } from '@/theme/visualArt';

import {
  angleLabelAt,
  angleMark,
  figureScale,
  fitFigure,
  pointLabelAt,
  type Point,
} from '../../logic/visualGeometry';

const FONT = textStyle('caption', { weight: 'bold' }).fontFamily;
const SIZE = textStyle('caption').fontSize;
const NAME_SIZE = textStyle('bodySm').fontSize;
/** Marge autour de la figure, pour les noms des points et les longueurs. */
const PADDING = 28;
const MARK = 14;

type Props = { visual: FigureVisual; width: number; height: number };

/** Figure de géométrie du tuteur : points nommés, segments, angles codés et cercles, sans déformation. */
export function GeoFigure({ visual, width, height }: Props) {
  const layout = useMemo(() => {
    const byName = new Map(visual.points.map((p) => [p.name, p]));
    const toScreen = fitFigure(
      visual.points,
      visual.circles.flatMap((c) => {
        const center = byName.get(c.center);
        return center ? [{ center, radius: c.radius }] : [];
      }),
      width,
      height,
      PADDING,
    );
    const screen = new Map<string, Point>(visual.points.map((p) => [p.name, toScreen(p)]));
    const all = [...screen.values()];
    const center = {
      x: all.reduce((s, p) => s + p.x, 0) / all.length,
      y: all.reduce((s, p) => s + p.y, 0) / all.length,
    };
    return { screen, center, unit: figureScale(toScreen) };
  }, [visual, width, height]);
  const at = (name: string) => layout.screen.get(name)!;

  return (
    <Svg width={width} height={height} accessibilityLabel={visual.description}>
      {visual.circles.map((c, i) => (
        <Circle
          key={`c${i}`}
          cx={at(c.center).x}
          cy={at(c.center).y}
          r={c.radius * layout.unit}
          stroke={visualArt.tones[c.tone]}
          strokeWidth={2.5}
          fill="none"
        />
      ))}
      {visual.segments.map((s, i) => {
        const a = at(s.from);
        const b = at(s.to);
        return (
          <Line
            key={`s${i}`}
            x1={a.x}
            y1={a.y}
            x2={b.x}
            y2={b.y}
            stroke={visualArt.tones[s.tone]}
            strokeWidth={2.5}
            strokeDasharray={s.dashed ? '7 5' : undefined}
            strokeLinecap="round"
          />
        );
      })}
      {visual.angles.map((angle, i) => {
        const vertex = at(angle.vertex);
        const label = angleLabelAt(vertex, at(angle.from), at(angle.to), MARK + 14);
        return (
          <G key={`a${i}`}>
            <Path
              d={angleMark(vertex, at(angle.from), at(angle.to), MARK, angle.right)}
              stroke={visualArt.ink}
              strokeWidth={1.5}
              fill="none"
            />
            {angle.label ? (
              <SvgText
                x={label.x}
                y={label.y + 4}
                fontSize={SIZE}
                fontFamily={FONT}
                fill={visualArt.ink}
                textAnchor="middle">
                {angle.label}
              </SvgText>
            ) : null}
          </G>
        );
      })}
      {visual.segments.map((s, i) => {
        if (!s.label) return null;
        const a = at(s.from);
        const b = at(s.to);
        // La longueur se pose au milieu du segment, décalée vers l'extérieur de la figure.
        const middle = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
        const spot = pointLabelAt(middle, layout.center, 14);
        const w = s.label.length * 7 + 10;
        return (
          <G key={`l${i}`}>
            <Rect
              x={spot.x - w / 2}
              y={spot.y - 10}
              width={w}
              height={20}
              rx={8}
              fill={visualArt.surface}
            />
            <SvgText
              x={spot.x}
              y={spot.y + 4}
              fontSize={SIZE}
              fontFamily={FONT}
              fill={visualArt.tones[s.tone]}
              textAnchor="middle">
              {s.label}
            </SvgText>
          </G>
        );
      })}
      {visual.points.map((p) => {
        const point = at(p.name);
        const label = pointLabelAt(point, layout.center, 16);
        return (
          <G key={p.name}>
            <Circle cx={point.x} cy={point.y} r={4} fill={visualArt.ink} />
            <SvgText
              x={label.x}
              y={label.y + 5}
              fontSize={NAME_SIZE}
              fontFamily={FONT}
              fill={visualArt.ink}
              textAnchor="middle">
              {p.name}
            </SvgText>
          </G>
        );
      })}
    </Svg>
  );
}
