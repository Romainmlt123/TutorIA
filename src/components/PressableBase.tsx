import {
  Platform,
  Pressable,
  type PressableProps,
  type PressableStateCallbackType,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import { isKeyboardModality } from '@/lib/inputModality';
import { theme } from '@/theme';

/** État d'interaction : React Native Web ajoute `hovered` et `focused` à `pressed`. */
export type InteractionState = PressableStateCallbackType & {
  hovered?: boolean;
  focused?: boolean;
};

export type PressableBaseProps = Omit<PressableProps, 'style'> & {
  style?: StyleProp<ViewStyle> | ((state: InteractionState) => StyleProp<ViewStyle>);
  /** Ombre du composant (token), combinée à l'anneau de focus clavier sur le web. */
  shadow?: string;
};

/**
 * Base de tous les éléments interactifs : anneau `shadow-focus` au clavier (web),
 * ombre composée, pas de contour natif du navigateur.
 */
export function PressableBase({ style, shadow, ...rest }: PressableBaseProps) {
  return (
    <Pressable
      {...rest}
      style={(state: InteractionState) => {
        const focusRing = state.focused && isKeyboardModality() ? theme.shadow.focus : undefined;
        const boxShadow = [shadow, focusRing].filter(Boolean).join(', ');
        return [
          typeof style === 'function' ? style(state) : style,
          boxShadow ? { boxShadow } : null,
          Platform.OS === 'web' ? { outlineWidth: 0 } : null,
        ];
      }}
    />
  );
}
