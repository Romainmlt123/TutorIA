import { StyleSheet, View } from 'react-native';

import { GradientSurface } from '@/components/GradientSurface';
import { Icon } from '@/components/Icon';
import { Text } from '@/components/Text';
import { fr } from '@/i18n/fr';
import { theme } from '@/theme';

/** P1 · Comment l'encourager : conseil choisi parmi des formulations rédigées à l'avance. */
export function AdviceCard({ text }: { text: string }) {
  return (
    <View style={styles.card}>
      <View style={styles.head}>
        <GradientSurface
          gradient={theme.subjects['physique-chimie'].gradient}
          radius={theme.radius.full}
          style={styles.badge}
          contentStyle={styles.center}>
          <Icon name="ampoule" size={20} color={theme.colors.textOnColor} strokeWidth={2} />
        </GradientSurface>
        <Text
          variant="h3"
          weight="black"
          color={theme.palette.violet[600]}
          accessibilityRole="header">
          {fr.parent.home.adviceTitle}
        </Text>
      </View>
      <Text variant="lead" color={theme.palette.violet[800]}>
        {text}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: theme.space[3],
    padding: theme.space[5],
    borderRadius: theme.radius['3xl'],
    backgroundColor: theme.colors.accentSoft,
  },
  head: { flexDirection: 'row', alignItems: 'center', gap: theme.space[3] },
  badge: { width: theme.space[10], height: theme.space[10] },
  center: { flexGrow: 1, alignItems: 'center', justifyContent: 'center' },
});
