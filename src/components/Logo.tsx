import { Image, type ImageStyle, type StyleProp } from 'react-native';

/* Le logo est toujours bleu : jamais recoloré, jamais déformé, sans ombre dure. */
const SOURCES = {
  onWhite: require('../../assets/logo/Logo_tutoria_fond_blanc.png'),
  onBlue: require('../../assets/logo/Logo_tutoria_fond_bleu.png'),
} as const;

export type LogoProps = {
  /** `onWhite` : sur fond clair ; `onBlue` : carré bleu arrondi (avatar, icône d'app). */
  variant: 'onWhite' | 'onBlue';
  size: number;
  borderRadius?: number;
  /** Sans libellé, le logo est décoratif. */
  accessibilityLabel?: string;
  style?: StyleProp<ImageStyle>;
};

export function Logo({ variant, size, borderRadius, accessibilityLabel, style }: LogoProps) {
  return (
    <Image
      source={SOURCES[variant]}
      resizeMode="contain"
      accessible={Boolean(accessibilityLabel)}
      accessibilityLabel={accessibilityLabel}
      alt={accessibilityLabel ?? ''}
      style={[{ width: size, height: size, borderRadius }, style]}
    />
  );
}
