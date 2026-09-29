import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { theme, type SpaceTone } from '@/theme';

import { Icon } from '../Icon';
import { PressableBase } from '../PressableBase';
import { Text } from '../Text';

type Props = {
  checked: boolean;
  onChange: (checked: boolean) => void;
  /** Couleur de l'espace : bleue côté élève, violette côté parent. */
  tone?: SpaceTone;
  /** Libellé lu par les lecteurs d'écran (le texte visible peut contenir des liens). */
  accessibilityLabel: string;
  children: ReactNode;
};

/** Case à cocher de 24 px avec son texte (conditions d'utilisation, bilan par e-mail). */
export function Checkbox({
  checked,
  onChange,
  tone = 'student',
  accessibilityLabel,
  children,
}: Props) {
  const color = theme.spaces[tone].primary;
  return (
    <View style={styles.row}>
      <PressableBase
        onPress={() => onChange(!checked)}
        role="checkbox"
        aria-checked={checked}
        accessibilityLabel={accessibilityLabel}
        hitSlop={12}
        style={[styles.box, checked ? { backgroundColor: color } : styles.unchecked]}>
        {checked ? (
          <Icon name="coche" size={16} color={theme.colors.textOnColor} strokeWidth={3} />
        ) : null}
      </PressableBase>
      <Text variant="bodySm" style={styles.text} onPress={() => onChange(!checked)}>
        {children}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'flex-start', gap: theme.space[3] },
  box: {
    width: theme.space[6],
    height: theme.space[6],
    marginTop: 1,
    borderRadius: theme.space[2],
    alignItems: 'center',
    justifyContent: 'center',
  },
  unchecked: {
    borderWidth: 2,
    borderColor: theme.palette.gray[200],
    backgroundColor: theme.colors.surface,
  },
  text: { flex: 1 },
});
