import { StyleSheet, View, type StyleProp, type TextStyle, type ViewStyle } from 'react-native';

import { Text } from '@/components/Text';
import { gameFontFamily } from '@/theme';
import { explorerArt } from '@/theme/explorerArt';

const HUD = explorerArt.hud;

/** Contour : le texte est redessiné en 8 copies décalées tout autour, sous le texte lui-même. */
const AROUND = [
  [1, 0],
  [-1, 0],
  [0, 1],
  [0, -1],
  [0.7, 0.7],
  [-0.7, 0.7],
  [0.7, -0.7],
  [-0.7, -0.7],
] as const;

type Props = {
  children: string;
  size: number;
  color?: string;
  outline?: string;
  /** Épaisseur du contour (px) ; 0 pour un texte sans contour. */
  stroke?: number;
  /** Décalage de l'ombre portée vers le bas (px) ; 0 pour aucune ombre. */
  drop?: number;
  align?: TextStyle['textAlign'];
  numberOfLines?: number;
  accessibilityRole?: 'header' | 'text';
  style?: StyleProp<ViewStyle>;
};

/**
 * Texte de jeu (HUD d'Explorer) : police Lilita One, blanc cerné de bleu nuit, avec une ombre
 * portée. Les copies du contour et de l'ombre sont cachées aux lecteurs d'écran.
 */
export function GameText({
  children,
  size,
  color = HUD.white,
  outline = HUD.ink,
  stroke = Math.max(2, Math.round(size / 9)),
  drop = Math.round(size / 8),
  align = 'left',
  numberOfLines,
  accessibilityRole,
  style,
}: Props) {
  const font: TextStyle = {
    fontFamily: gameFontFamily,
    fontSize: size,
    lineHeight: Math.round(size * 1.2),
    letterSpacing: 0.3,
    textAlign: align,
  };
  const copy = (dx: number, dy: number, tint: string, key: string) => (
    <Text
      key={key}
      aria-hidden
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      numberOfLines={numberOfLines}
      maxFontSizeMultiplier={1.3}
      style={[
        font,
        styles.copy,
        { color: tint, transform: [{ translateX: dx }, { translateY: dy }] },
      ]}>
      {children}
    </Text>
  );
  return (
    <View style={style}>
      {drop > 0
        ? AROUND.map(([x, y], i) => copy(x * stroke, y * stroke + drop, HUD.shadow, `ombre-${i}`))
        : null}
      {stroke > 0
        ? AROUND.map(([x, y], i) => copy(x * stroke, y * stroke, outline, `contour-${i}`))
        : null}
      <Text
        accessibilityRole={accessibilityRole}
        numberOfLines={numberOfLines}
        maxFontSizeMultiplier={1.3}
        style={[font, { color }]}>
        {children}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  copy: { position: 'absolute', top: 0, left: 0, right: 0 },
});
