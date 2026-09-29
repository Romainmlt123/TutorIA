import { StyleSheet, View } from 'react-native';

import { fr } from '@/i18n/fr';
import { theme } from '@/theme';

import { PressableBase } from '../PressableBase';
import { Text } from '../Text';

type Props = {
  /** Empilés (L3) ou côte à côte (E1). */
  layout?: 'stack' | 'row';
  onApple: () => void;
  onGoogle: () => void;
};

/**
 * Boutons Apple et Google, toujours sous le formulaire.
 * À remplacer par les boutons officiels des SDK quand la connexion sera branchée (règle Apple 4.8).
 */
export function AuthProviderButtons({ layout = 'stack', onApple, onGoogle }: Props) {
  const row = layout === 'row';
  const labels = row ? fr.form.providersShort : fr.form.providers;
  return (
    <View style={[styles.group, row && styles.row]}>
      <PressableBase
        onPress={onApple}
        accessibilityRole="button"
        style={({ pressed }) => [
          styles.button,
          row && styles.half,
          styles.apple,
          pressed && styles.applePressed,
        ]}>
        <Text variant={row ? 'lead' : 'body'} weight="bold" color="textOnColor">
          {labels.apple}
        </Text>
      </PressableBase>
      <PressableBase
        onPress={onGoogle}
        accessibilityRole="button"
        shadow={theme.shadow.sm}
        style={({ pressed }) => [
          styles.button,
          row && styles.half,
          styles.google,
          pressed && styles.googlePressed,
        ]}>
        <Text variant={row ? 'lead' : 'body'} weight="bold">
          {labels.google}
        </Text>
      </PressableBase>
    </View>
  );
}

/** Séparateur « ou » entre le formulaire et les connexions Apple / Google. */
export function OrDivider() {
  return (
    <View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={styles.divider}>
      <View style={styles.line} />
      <Text variant="hint" weight="bold" color="textSecondary">
        {fr.form.or}
      </Text>
      <View style={styles.line} />
    </View>
  );
}

const styles = StyleSheet.create({
  group: { gap: theme.space[3] },
  row: { flexDirection: 'row' },
  button: {
    height: 52,
    borderRadius: theme.radius['2xl'],
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: theme.space[4],
  },
  half: { flex: 1 },
  apple: { backgroundColor: theme.palette.gray[900] },
  applePressed: { backgroundColor: theme.palette.gray[800] },
  google: {
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  googlePressed: { backgroundColor: theme.colors.bg },
  divider: { flexDirection: 'row', alignItems: 'center', gap: theme.space[3] },
  line: { flex: 1, height: 1, backgroundColor: theme.colors.border },
});
