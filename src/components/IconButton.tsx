import { StyleSheet, View } from 'react-native';

import { theme } from '@/theme';

import { Icon, type IconName } from './Icon';
import { PressableBase } from './PressableBase';

export type IconButtonProps = {
  icon: IconName;
  /** Libellé d'accessibilité obligatoire : le bouton n'a pas de texte visible. */
  accessibilityLabel: string;
  onPress?: () => void;
  iconColor?: string;
  iconSize?: number;
  /** Point violet (`accent`) : nouveauté ou notification. */
  badge?: boolean;
  /** Posé sur un bandeau de marque (v2.5) : fond blanc translucide, icône blanche, sans ombre. */
  onBand?: boolean;
};

export function IconButton({
  icon,
  accessibilityLabel,
  onPress,
  iconColor,
  iconSize = 24,
  badge = false,
  onBand = false,
}: IconButtonProps) {
  return (
    <PressableBase
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      shadow={onBand ? undefined : theme.shadow.sm}
      style={({ pressed }) => [
        styles.button,
        onBand && styles.onBand,
        pressed && (onBand ? styles.onBandPressed : styles.pressed),
      ]}>
      <Icon
        name={icon}
        size={iconSize}
        color={iconColor ?? (onBand ? theme.colors.textOnColor : theme.colors.textSecondary)}
      />
      {badge ? <View style={styles.badge} /> : null}
    </PressableBase>
  );
}

const styles = StyleSheet.create({
  button: {
    width: theme.space[12],
    height: theme.space[12],
    borderRadius: theme.radius['2xl'],
    backgroundColor: theme.colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: { backgroundColor: theme.colors.bg },
  onBand: { backgroundColor: theme.screenBand.controlVeil },
  onBandPressed: { opacity: 0.8 },
  badge: {
    position: 'absolute',
    top: 10,
    right: theme.space[3],
    width: 10,
    height: 10,
    borderRadius: theme.radius.full,
    backgroundColor: theme.colors.accent,
    borderWidth: 2,
    borderColor: theme.colors.surface,
  },
});
