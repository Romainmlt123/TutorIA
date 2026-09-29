import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { Card } from '@/components/Card';
import { Text } from '@/components/Text';
import { theme } from '@/theme';

type Props = { title: string; meta?: string; hint?: string; children: ReactNode };

/** Carte de graphique : titre 16 Black, métadonnée à droite ou sous-titre. */
export function ChartCard({ title, meta, hint, children }: Props) {
  return (
    <Card style={styles.card}>
      <View style={hint ? styles.stacked : styles.header}>
        <Text variant="body" weight="black" accessibilityRole="header">
          {title}
        </Text>
        {meta ? (
          <Text variant="caption" weight="regular" color="textSecondary">
            {meta}
          </Text>
        ) : null}
        {hint ? (
          <Text variant="caption" weight="regular" color="textSecondary">
            {hint}
          </Text>
        ) : null}
      </View>
      {children}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { gap: theme.space[4] },
  header: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    gap: theme.space[2],
  },
  stacked: { gap: theme.space[1] },
});
