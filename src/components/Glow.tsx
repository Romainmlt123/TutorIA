import { View, type StyleProp, type ViewStyle } from 'react-native';
import Svg, { Defs, Ellipse, RadialGradient, Stop } from 'react-native-svg';

/** Lueur en dégradé radial, qui s'efface vers ses bords (halo, ombre au sol), comme la maquette. */
export function Glow({
  id,
  width,
  height,
  color,
  fade,
  style,
}: {
  id: string;
  width: number;
  height: number;
  color: string;
  /** Distance au centre (0 à 1) où la lueur a disparu. */
  fade: number;
  style: StyleProp<ViewStyle>;
}) {
  return (
    <View aria-hidden pointerEvents="none" style={style}>
      <Svg width={width} height={height}>
        <Defs>
          <RadialGradient id={id} cx="50%" cy="50%" rx="50%" ry="50%">
            <Stop offset={0} stopColor={color} />
            <Stop offset={fade} stopColor={color} stopOpacity={0} />
          </RadialGradient>
        </Defs>
        <Ellipse
          cx={width / 2}
          cy={height / 2}
          rx={width / 2}
          ry={height / 2}
          fill={`url(#${id})`}
        />
      </Svg>
    </View>
  );
}
