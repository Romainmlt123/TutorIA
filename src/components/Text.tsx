import {
  Text as NativeText,
  type ColorValue,
  type TextProps as NativeTextProps,
} from 'react-native';

import { textStyle, theme, type ColorRole, type FontWeightName, type TypeVariant } from '@/theme';

export type TextProps = NativeTextProps & {
  /** Style de l'échelle typographique (tokens). */
  variant?: TypeVariant;
  /** Remplace la graisse par défaut de la variante. */
  weight?: FontWeightName;
  italic?: boolean;
  /** Rôle de couleur du thème, ou valeur issue du thème (`theme.palette…`). */
  color?: ColorRole | ColorValue;
  align?: 'left' | 'center' | 'right';
};

function resolveColor(color: ColorRole | ColorValue): ColorValue {
  return typeof color === 'string' && color in theme.colors
    ? theme.colors[color as ColorRole]
    : color;
}

/** Texte Satoshi : toujours utiliser ce composant plutôt que le `Text` de React Native. */
export function Text({
  variant = 'body',
  weight,
  italic = false,
  color = 'text',
  align,
  style,
  ...rest
}: TextProps) {
  return (
    <NativeText
      {...rest}
      style={[
        textStyle(variant, { weight, italic }),
        { color: resolveColor(color) },
        align ? { textAlign: align } : null,
        style,
      ]}
    />
  );
}
