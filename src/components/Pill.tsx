import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { theme, type FontWeightName } from '@/theme';

import { Icon, type IconName } from './Icon';
import { Text } from './Text';

export type PillProps = {
  label: string;
  backgroundColor: string;
  color: string;
  /** Icône avant le libellé (flamme, tendance…). */
  icon?: IconName;
  iconSize?: number;
  /** Petit point avant le libellé (chrono de l'appel vocal). */
  dotColor?: string;
  /** `sm` : 12 px, padding 4 × 8 ; `md` : 12 px, padding 4 × 12 ; `lg` : 14 px, padding 4 × 12. */
  size?: 'xs' | 'sm' | 'md' | 'lg';
  weight?: FontWeightName;
  /** Autorise le retour à la ligne (légendes longues des chiffres clés). */
  wrap?: boolean;
  accessibilityLabel?: string;
  style?: StyleProp<ViewStyle>;
};

/** Pastille : pourcentage, leçon, chrono, évolution, XP, compteurs… */
export function Pill({
  label,
  backgroundColor,
  color,
  icon,
  iconSize = 14,
  dotColor,
  size = 'sm',
  weight = 'bold',
  wrap = false,
  accessibilityLabel,
  style,
}: PillProps) {
  return (
    <View
      accessible={Boolean(accessibilityLabel)}
      accessibilityLabel={accessibilityLabel}
      style={[styles.pill, styles[size], { backgroundColor }, style]}>
      {dotColor ? <View style={[styles.dot, { backgroundColor: dotColor }]} /> : null}
      {icon ? <Icon name={icon} size={iconSize} color={color} strokeWidth={2.25} /> : null}
      <Text
        variant={size === 'lg' ? 'label' : 'caption'}
        weight={weight}
        color={color}
        numberOfLines={wrap ? undefined : 1}
        maxFontSizeMultiplier={1.3}
        style={wrap ? styles.wrap : null}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    maxWidth: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: theme.space[1],
    borderRadius: theme.radius.full,
  },
  xs: { paddingVertical: 2, paddingHorizontal: theme.space[2] },
  sm: { paddingVertical: theme.space[1], paddingHorizontal: theme.space[2] },
  md: { paddingVertical: theme.space[1], paddingHorizontal: theme.space[3] },
  lg: { paddingVertical: theme.space[1], paddingHorizontal: theme.space[3] },
  dot: { width: 6, height: 6, borderRadius: theme.radius.full, marginRight: 2 },
  wrap: { flexShrink: 1 },
});
