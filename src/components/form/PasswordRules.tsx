import { StyleSheet, View } from 'react-native';

import { fr } from '@/i18n/fr';
import { theme } from '@/theme';

import { Icon } from '../Icon';
import { Text } from '../Text';

export type PasswordRule = { label: string; ok: boolean };

type Props = {
  rules: readonly PasswordRule[];
  /** Sur une ligne (E1) ou en colonne (L4). */
  inline?: boolean;
};

/** Règles du mot de passe, cochées en vert au fil de la saisie. */
export function PasswordRules({ rules, inline = false }: Props) {
  return (
    <View
      accessibilityLabel={fr.form.passwordRules}
      style={[styles.list, inline ? styles.inline : styles.column]}>
      {rules.map((rule) => (
        <View
          key={rule.label}
          accessible
          accessibilityLabel={`${rule.label}, ${rule.ok ? fr.form.ruleDone : fr.form.ruleTodo}`}
          style={styles.rule}>
          <View
            style={[
              styles.dot,
              { backgroundColor: rule.ok ? theme.colors.success : theme.palette.gray[200] },
            ]}>
            <Icon name="coche" size={12} color={theme.colors.textOnColor} strokeWidth={3} />
          </View>
          <Text
            variant="hint"
            weight="medium"
            color={rule.ok ? theme.colors.successStrong : 'textSecondary'}>
            {rule.label}
          </Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  list: { flexWrap: 'wrap' },
  column: { gap: 6 },
  inline: { flexDirection: 'row', columnGap: 14, rowGap: 6 },
  rule: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  dot: {
    width: 18,
    height: 18,
    borderRadius: theme.radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
