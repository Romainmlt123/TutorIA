import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { extras, theme, type FontWeightName, type SpaceTone } from '@/theme';

import { Icon, type IconName } from './Icon';
import { PressableBase } from './PressableBase';
import { Text } from './Text';

export type ButtonVariant = 'primary' | 'vivid' | 'soft' | 'small' | 'white';

export type ButtonProps = {
  label: string;
  onPress?: () => void;
  variant?: ButtonVariant;
  /** Icône à droite du libellé (flèche). */
  icon?: IconName;
  /** Icône à gauche du libellé (lien, partage). */
  leadingIcon?: IconName;
  iconSize?: number;
  /** `shadow-brand` : l'action principale de l'écran, une seule par écran. */
  highlight?: boolean;
  disabled?: boolean;
  weight?: FontWeightName;
  /** Couleur du libellé pour la variante `white` (par défaut `primary`). */
  labelColor?: string;
  /** `lg` : 52 px, libellé en gras (actions principales des écrans de connexion et d'onboarding). */
  size?: 'md' | 'lg';
  /** Couleur de l'espace pour la variante `primary` : bleu (élève) ou violet (parent). */
  tone?: SpaceTone;
  accessibilityLabel?: string;
  accessibilityHint?: string;
  style?: StyleProp<ViewStyle>;
};

const { colors: c, palette: p } = theme;
const VARIANTS = {
  primary: { bg: c.primary, hover: c.primaryHover, pressed: c.primaryPressed, fg: c.textOnColor },
  vivid: { bg: p.violet[500], hover: p.violet[600], pressed: p.violet[700], fg: c.textOnColor },
  soft: { bg: c.primarySoft, hover: p.blue[200], pressed: p.blue[200], fg: c.primary },
  small: { bg: c.primary, hover: c.primaryHover, pressed: c.primaryPressed, fg: c.textOnColor },
  white: { bg: c.surface, hover: c.bg, pressed: c.bg, fg: c.primary },
} as const;

/** Violet doux (profil : « Relier un autre parent », v2.8). */
const PARENT_SOFT = {
  bg: p.violet[100],
  hover: p.violet[200],
  pressed: p.violet[200],
  fg: p.violet[600],
};

const PARENT_PRIMARY = {
  bg: c.accent,
  hover: p.violet[600],
  pressed: p.violet[700],
  fg: c.textOnColor,
} as const;

export function Button({
  label,
  onPress,
  variant = 'primary',
  icon,
  leadingIcon,
  iconSize = 20,
  highlight = false,
  disabled = false,
  weight = 'medium',
  labelColor,
  size = 'md',
  tone = 'student',
  accessibilityLabel,
  accessibilityHint,
  style,
}: ButtonProps) {
  const colors =
    tone === 'parent' && variant === 'primary'
      ? PARENT_PRIMARY
      : tone === 'parent' && variant === 'soft'
        ? PARENT_SOFT
        : VARIANTS[variant];
  const fg = labelColor ?? colors.fg;
  const shadow = disabled
    ? undefined
    : variant === 'vivid'
      ? extras.vividShadow
      : highlight
        ? theme.spaces[tone].shadow
        : undefined;

  return (
    <PressableBase
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityHint={accessibilityHint}
      aria-disabled={disabled}
      shadow={shadow}
      style={({ pressed, hovered }) => [
        styles.base,
        size === 'lg' && styles.large,
        variant === 'small' && styles.small,
        { backgroundColor: pressed ? colors.pressed : hovered ? colors.hover : colors.bg },
        disabled && styles.disabled,
        style,
      ]}>
      <View style={styles.content}>
        {leadingIcon ? (
          <Icon name={leadingIcon} size={iconSize} color={fg} strokeWidth={2} />
        ) : null}
        <Text
          variant={variant === 'small' ? 'label' : 'body'}
          weight={variant === 'small' || size === 'lg' ? 'bold' : weight}
          color={fg}
          numberOfLines={1}>
          {label}
        </Text>
        {icon ? <Icon name={icon} size={iconSize} color={fg} strokeWidth={2} /> : null}
      </View>
    </PressableBase>
  );
}

const styles = StyleSheet.create({
  base: {
    height: theme.space[12],
    borderRadius: theme.radius['2xl'],
    paddingHorizontal: theme.space[5],
    alignItems: 'center',
    justifyContent: 'center',
  },
  large: { height: 52 },
  small: { paddingHorizontal: theme.space[4] },
  content: { flexDirection: 'row', alignItems: 'center', gap: theme.space[2] },
  disabled: { opacity: 0.4 },
});
