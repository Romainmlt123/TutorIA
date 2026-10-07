import { memo, useEffect, useMemo } from 'react';
import Animated, {
  Easing,
  useAnimatedProps,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import Svg, {
  ClipPath,
  Defs,
  G,
  LinearGradient,
  Path,
  Rect,
  Stop,
  Text as SvgText,
} from 'react-native-svg';

import { theme, fontFamily } from '@/theme';

import type { Shape } from './iso';

import { drawMathsIsland, ISLAND_VIEW, ISLAND_VIEWBOX, waterfallRect } from './islandMaths';

const P = theme.palette;
const AnimatedG = Animated.createAnimatedComponent(G);

/** Tracés figés de l'illustration : calculés une fois, jamais re-rendus pendant les animations. */
const Shapes = memo(function Shapes({ shapes }: { shapes: readonly Shape[] }) {
  return (
    <>
      {shapes.map((s, i) => (
        <Path
          key={i}
          d={s.d}
          fill={s.fill}
          stroke={s.stroke}
          strokeWidth={s.strokeWidth}
          strokeLinejoin="round"
          strokeLinecap="round"
          opacity={s.opacity}
        />
      ))}
    </>
  );
});

/** Écume au pied et en haut de la cascade. */
function Foam({ x, y, r }: { x: number; y: number; r: number }) {
  return (
    <G>
      {[
        [-r * 0.7, 0, r * 0.7],
        [r * 0.6, r * 0.1, r * 0.65],
        [0, -r * 0.3, r * 0.8],
      ].map(([dx, dy, rr], i) => (
        <Path
          key={i}
          d={`M${x + dx! - rr!} ${y + dy!}a${rr} ${rr! * 0.8} 0 1 0 ${2 * rr!} 0a${rr} ${rr! * 0.8} 0 1 0 ${-2 * rr!} 0Z`}
          fill={P.gray[100]}
          stroke={P.azure[300]}
          strokeWidth={1.4}
        />
      ))}
    </G>
  );
}

const DIGITS = '314159265358979323846264338327';
const DIGIT_STEP = 16;

/** Cascade de chiffres : dégradé d'eau et chiffres qui tombent en boucle, comme l'inspiration. */
function Waterfall({ animate }: { animate: boolean }) {
  const rect = waterfallRect(ISLAND_VIEW);
  const offset = useSharedValue(0);
  useEffect(() => {
    if (!animate) return;
    offset.value = withRepeat(
      withTiming(DIGIT_STEP * 2, { duration: 1400, easing: Easing.linear }),
      -1,
      false,
    );
  }, [animate, offset]);
  const animatedProps = useAnimatedProps(() => ({ transform: [{ translateY: offset.value }] }));
  const rows = Array.from({ length: Math.ceil(rect.height / DIGIT_STEP) + 3 }, (_, i) => i);
  return (
    <>
      <Defs>
        <ClipPath id="cascade">
          <Rect x={rect.x} y={rect.y} width={rect.width} height={rect.height} rx={6} />
        </ClipPath>
        <LinearGradient id="cascade-eau" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor={P.azure[300]} />
          <Stop offset="1" stopColor={P.azure[200]} stopOpacity={0.2} />
        </LinearGradient>
      </Defs>
      <G clipPath="url(#cascade)">
        <Rect
          x={rect.x}
          y={rect.y}
          width={rect.width}
          height={rect.height}
          fill="url(#cascade-eau)"
        />
        <AnimatedG animatedProps={animatedProps}>
          {rows.map((i) => (
            <SvgText
              key={i}
              x={rect.x + (i % 2 ? rect.width * 0.32 : rect.width * 0.68)}
              y={rect.y - DIGIT_STEP * 2 + i * DIGIT_STEP}
              fontFamily={fontFamily.black}
              fontSize={11}
              textAnchor="middle"
              fill={P.gray[100]}
              opacity={0.9}>
              {DIGITS[i % DIGITS.length]}
            </SvgText>
          ))}
        </AnimatedG>
      </G>
      <Foam x={rect.x + rect.width / 2} y={rect.y + 2} r={7} />
    </>
  );
}

type Props = {
  /** Largeur affichée, en points ; la hauteur suit les proportions du dessin. */
  width: number;
  /** Flottement et cascade (coupés si « Réduire les animations » est actif). */
  animated?: boolean;
};

/** Île des Maths illustrée (X1). Décorative : l'information est portée par l'interface. */
export function IslandArt({ width, animated = true }: Props) {
  const reduceMotion = useReducedMotion();
  const animate = animated && !reduceMotion;
  const shapes = useMemo(() => drawMathsIsland(), []);
  const float = useSharedValue(0);
  useEffect(() => {
    if (!animate) return;
    float.value = withRepeat(
      withTiming(-8, { duration: 2000, easing: Easing.inOut(Easing.sin) }),
      -1,
      true,
    );
  }, [animate, float]);
  const style = useAnimatedStyle(() => ({ transform: [{ translateY: float.value }] }));
  const height = (width * ISLAND_VIEWBOX.height) / ISLAND_VIEWBOX.width;

  return (
    <Animated.View style={style} accessible={false} importantForAccessibility="no-hide-descendants">
      <Svg
        width={width}
        height={height}
        viewBox={`0 0 ${ISLAND_VIEWBOX.width} ${ISLAND_VIEWBOX.height}`}>
        <Shapes shapes={shapes} />
        <Waterfall animate={animate} />
      </Svg>
    </Animated.View>
  );
}
