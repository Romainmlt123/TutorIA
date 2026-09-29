import { StyleSheet, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

import { extras, theme, type TypeVariant } from '@/theme';

import { Text } from './Text';

type Props = {
  /** Avancement de 0 à 1. */
  value: number;
  label: string;
  size?: number;
  strokeWidth?: number;
  /** Sur une carte colorée (maîtrise globale, P2) : progression et libellé blancs. */
  onColor?: boolean;
  labelVariant?: TypeVariant;
};

/** Anneau d'objectif (01-Accueil) : piste bleu 100, progression `primary`, libellé centré. */
export function ProgressRing({
  value,
  label,
  size = 56,
  strokeWidth = 6,
  onColor = false,
  labelVariant = 'label',
}: Props) {
  const radius = (size - strokeWidth) / 2 - 2;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.min(1, Math.max(0, value)) * circumference;
  const center = size / 2;
  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden>
        <Circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke={onColor ? extras.ringTrackOnColor : theme.palette.blue[100]}
          strokeWidth={strokeWidth}
        />
        <Circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke={onColor ? theme.colors.textOnColor : theme.colors.primary}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={`${progress} ${circumference}`}
          transform={`rotate(-90 ${center} ${center})`}
        />
      </Svg>
      <View style={[StyleSheet.absoluteFill, styles.label]}>
        <Text
          variant={labelVariant}
          weight={labelVariant === 'label' ? 'bold' : 'black'}
          color={onColor ? 'textOnColor' : 'text'}>
          {label}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  label: { alignItems: 'center', justifyContent: 'center' },
});
