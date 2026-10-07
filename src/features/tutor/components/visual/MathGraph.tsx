import { useMemo } from 'react';
import Svg, { Circle, G, Line, Path, Rect, Text as SvgText } from 'react-native-svg';

import type { GraphVisual, VisualTone } from '@/services/tutor/visuals';
import { textStyle } from '@/theme';
import { visualArt } from '@/theme/visualArt';

import { parseExpression } from '../../logic/expression';
import { graphScale, niceTicks, polylinePath, sampleCurve } from '../../logic/visualGeometry';

/** Marges du repère : graduations des y à gauche, des x en bas. */
const PAD = { left: 30, right: 14, top: 14, bottom: 24 };
const FONT = textStyle('caption').fontFamily;
const BOLD = textStyle('caption', { weight: 'bold' }).fontFamily;
const SIZE = textStyle('caption').fontSize;

const format = (n: number) => String(n).replace('.', ',');

type Props = {
  visual: GraphVisual;
  width: number;
  height: number;
  /** Couleur que le tuteur vient de nommer à la voix (2D) : sa courbe passe au premier plan. */
  focus?: VisualTone | null;
};

/** 2C · repère du tuteur : quadrillage, axes gradués, droites et courbes, points clés. */
export function MathGraph({ visual, width, height, focus = null }: Props) {
  const plotW = width - PAD.left - PAD.right;
  const plotH = height - PAD.top - PAD.bottom;
  const { xRange, yRange } = visual;
  const scale = graphScale(xRange, yRange, plotW, plotH);
  const sx = (x: number) => PAD.left + scale.x(x);
  const sy = (y: number) => PAD.top + scale.y(y);
  const xTicks = niceTicks(xRange[0], xRange[1]);
  const yTicks = niceTicks(yRange[0], yRange[1], 5);
  // Les axes passent par l'origine quand elle est dans le repère, sinon sur les bords.
  const axisX = sy(Math.min(Math.max(0, yRange[0]), yRange[1]));
  const axisY = sx(Math.min(Math.max(0, xRange[0]), xRange[1]));

  const curves = useMemo(
    () =>
      visual.curves.map((curve) => {
        const f = parseExpression(curve.expression);
        const runs = f ? sampleCurve(f, xRange, yRange) : [];
        return { ...curve, runs };
      }),
    [visual.curves, xRange, yRange],
  );

  return (
    <Svg width={width} height={height} accessibilityLabel={visual.description}>
      {xTicks.map((t) => (
        <Line
          key={`gx${t}`}
          x1={sx(t)}
          x2={sx(t)}
          y1={PAD.top}
          y2={PAD.top + plotH}
          stroke={visualArt.grid}
          strokeWidth={1}
        />
      ))}
      {yTicks.map((t) => (
        <Line
          key={`gy${t}`}
          x1={PAD.left}
          x2={PAD.left + plotW}
          y1={sy(t)}
          y2={sy(t)}
          stroke={visualArt.grid}
          strokeWidth={1}
        />
      ))}
      <Line
        x1={PAD.left}
        x2={PAD.left + plotW}
        y1={axisX}
        y2={axisX}
        stroke={visualArt.axis}
        strokeWidth={1.5}
      />
      <Line
        x1={axisY}
        x2={axisY}
        y1={PAD.top}
        y2={PAD.top + plotH}
        stroke={visualArt.axis}
        strokeWidth={1.5}
      />
      {xTicks.map((t) => (
        <SvgText
          key={`tx${t}`}
          x={sx(t)}
          y={height - 6}
          fontSize={SIZE}
          fontFamily={FONT}
          fill={visualArt.tick}
          textAnchor="middle">
          {format(t)}
        </SvgText>
      ))}
      {yTicks.map((t) => (
        <SvgText
          key={`ty${t}`}
          x={PAD.left - 6}
          y={sy(t) + 4}
          fontSize={SIZE}
          fontFamily={FONT}
          fill={visualArt.tick}
          textAnchor="end">
          {format(t)}
        </SvgText>
      ))}

      <G>
        {curves.map((curve, i) =>
          curve.runs.map((run, j) => {
            const d = polylinePath(run.map((p) => ({ x: sx(p.x), y: sy(p.y) })));
            const focused = focus === curve.tone;
            return (
              <G key={`c${i}-${j}`}>
                {/* Courbe nommée par le tuteur : halo de sa couleur et trait plus épais. */}
                {focused ? (
                  <Path
                    d={d}
                    stroke={visualArt.tones[curve.tone]}
                    strokeOpacity={0.16}
                    strokeWidth={13}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    fill="none"
                  />
                ) : null}
                <Path
                  d={d}
                  stroke={visualArt.tones[curve.tone]}
                  strokeWidth={focused ? 5 : 3}
                  strokeDasharray={curve.dashed ? '8 6' : undefined}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  fill="none"
                />
              </G>
            );
          }),
        )}
      </G>

      {visual.points.map((point, i) => {
        const x = sx(point.x);
        const y = sy(point.y);
        const color = visualArt.tones[point.tone];
        const labelWidth = point.label.length * 6.5 + 14;
        // L'étiquette passe sous le point s'il est trop près du haut.
        const above = y - 30 > PAD.top;
        return (
          <G key={`p${i}`}>
            {point.highlight ? (
              <>
                <Line
                  x1={x}
                  x2={x}
                  y1={y}
                  y2={axisX}
                  stroke={color}
                  strokeWidth={1.5}
                  strokeDasharray="4 4"
                />
                <Line
                  x1={x}
                  x2={axisY}
                  y1={y}
                  y2={y}
                  stroke={color}
                  strokeWidth={1.5}
                  strokeDasharray="4 4"
                />
                <Circle cx={x} cy={y} r={11} fill={visualArt.soft[point.tone]} />
              </>
            ) : null}
            <Circle cx={x} cy={y} r={5} fill={color} stroke={visualArt.surface} strokeWidth={2} />
            {point.label ? (
              <G>
                <Rect
                  x={Math.min(Math.max(x - labelWidth / 2, 2), width - labelWidth - 2)}
                  y={above ? y - 32 : y + 12}
                  width={labelWidth}
                  height={20}
                  rx={10}
                  fill={color}
                />
                <SvgText
                  x={Math.min(Math.max(x, labelWidth / 2 + 2), width - labelWidth / 2 - 2)}
                  y={above ? y - 18 : y + 26}
                  fontSize={SIZE}
                  fontFamily={BOLD}
                  fill={visualArt.surface}
                  textAnchor="middle">
                  {point.label}
                </SvgText>
              </G>
            ) : null}
          </G>
        );
      })}
    </Svg>
  );
}
