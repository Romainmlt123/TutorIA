import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { theme } from '@/theme';

type Props<T> = {
  items: readonly T[];
  renderItem: (item: T) => ReactNode;
  keyOf: (item: T) => string;
};

/** Grille de 2 colonnes égales, 12 px d'écart (matières, chiffres clés). */
export function TwoColumnGrid<T>({ items, renderItem, keyOf }: Props<T>) {
  const rows: T[][] = [];
  for (let i = 0; i < items.length; i += 2) rows.push(items.slice(i, i + 2));
  return (
    <View style={styles.grid}>
      {rows.map((row) => (
        <View key={row.map(keyOf).join('|')} style={styles.row}>
          {row.map((item) => (
            <View key={keyOf(item)} style={styles.cell}>
              {renderItem(item)}
            </View>
          ))}
          {row.length === 1 ? <View style={styles.cell} /> : null}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: { gap: theme.space[3] },
  row: { flexDirection: 'row', gap: theme.space[3] },
  cell: { flex: 1 },
});
