import { StyleSheet } from 'react-native';

import { theme } from '@/theme';

import { PressableBase } from './PressableBase';
import { Text } from './Text';

/** « Supprimer le compte » : fond `red-100`, texte `red-600`, séparé du reste (exigence des stores). */
export function DangerButton({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <PressableBase
      onPress={onPress}
      accessibilityRole="button"
      style={({ pressed }) => [styles.button, pressed && styles.pressed]}>
      <Text variant="label" weight="bold" color={theme.palette.red[600]}>
        {label}
      </Text>
    </PressableBase>
  );
}

const styles = StyleSheet.create({
  button: {
    height: theme.space[12],
    borderRadius: theme.radius['2xl'],
    backgroundColor: theme.palette.red[100],
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: { backgroundColor: theme.palette.red[200] },
});
