import { StyleSheet, View } from 'react-native';

import { theme } from '@/theme';

import { PressableBase } from './PressableBase';
import { Text } from './Text';

type Props = {
  title: string;
  /** Lien d'action à droite (« Tout voir »). */
  actionLabel?: string;
  onAction?: () => void;
  /** Métadonnée à droite (« Programme de 4e »). */
  meta?: string;
};

/** Titre de section : 22/30 Black, lien ou métadonnée à droite. */
export function SectionHeader({ title, actionLabel, onAction, meta }: Props) {
  return (
    <View style={[styles.row, { alignItems: actionLabel ? 'center' : 'baseline' }]}>
      <Text variant="h3" weight="black" accessibilityRole="header" style={styles.title}>
        {title}
      </Text>
      {actionLabel ? (
        <PressableBase accessibilityRole="link" onPress={onAction} style={styles.action}>
          <Text variant="label" color="primary">
            {actionLabel}
          </Text>
        </PressableBase>
      ) : null}
      {meta ? (
        <Text variant="caption" weight="regular" color="textSecondary">
          {meta}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', justifyContent: 'space-between', gap: theme.space[3] },
  title: { flexShrink: 1 },
  action: { minHeight: theme.space[12], justifyContent: 'center' },
});
