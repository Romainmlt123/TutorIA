import { StyleSheet, View } from 'react-native';

import { GradientSurface } from '@/components/GradientSurface';
import { Icon, type IconName } from '@/components/Icon';
import { Text } from '@/components/Text';
import { theme, type Gradient } from '@/theme';

type Props = {
  icon: IconName;
  value: string;
  label: string;
  gradient: Gradient;
};

/** Chiffre clé de P1 (grille de 3 colonnes) : pastille d'icône, valeur 22 Black, libellé 12, centrés. */
export function ParentKpiCard({ icon, value, label, gradient }: Props) {
  return (
    <View accessible accessibilityLabel={`${value} ${label}`} style={styles.cell}>
      <GradientSurface
        gradient={gradient}
        shadow={theme.shadow.md}
        style={styles.fill}
        contentStyle={styles.content}>
        <View style={styles.icon}>
          <Icon name={icon} size={18} color={theme.colors.textOnColor} strokeWidth={2} />
        </View>
        <Text
          variant="h3"
          weight="black"
          color="textOnColor"
          numberOfLines={1}
          adjustsFontSizeToFit>
          {value}
        </Text>
        <Text variant="caption" color="textOnColor" style={styles.label}>
          {label}
        </Text>
      </GradientSurface>
    </View>
  );
}

const styles = StyleSheet.create({
  cell: { flex: 1 },
  fill: { flex: 1 },
  content: {
    alignItems: 'center',
    gap: theme.space[2],
    paddingVertical: theme.space[4],
    paddingHorizontal: theme.space[3],
  },
  label: { textAlign: 'center' },
  icon: {
    width: theme.space[8],
    height: theme.space[8],
    borderRadius: theme.radius.full,
    backgroundColor: theme.onColor.veil,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
