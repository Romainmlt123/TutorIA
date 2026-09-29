import { StyleSheet, View } from 'react-native';

import { theme } from '@/theme';

import { Icon, type IconName } from './Icon';

type Props = {
  icon: IconName;
  size?: number;
  /** Décalage vers l'extérieur de la carte, en bas à droite. */
  offset?: number;
  opacity: number;
  variant?: 'stroke' | 'fill';
  strokeWidth?: number;
  /** Coin de la carte : en bas à droite (par défaut) ou en haut à droite (en-têtes). */
  placement?: 'bottom' | 'top';
};

/** Grande icône blanche en filigrane dans le coin d'une carte colorée. */
export function Watermark({
  icon,
  size = 96,
  offset = -20,
  opacity,
  variant,
  strokeWidth = 1.5,
  placement = 'bottom',
}: Props) {
  const corner =
    placement === 'top' ? { right: offset, top: offset } : { right: offset, bottom: offset };
  return (
    <View style={[styles.watermark, corner, { opacity }]}>
      <Icon
        name={icon}
        size={size}
        color={theme.colors.textOnColor}
        variant={variant}
        strokeWidth={strokeWidth}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  watermark: { position: 'absolute', pointerEvents: 'none' },
});
