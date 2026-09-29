import { StyleSheet, View } from 'react-native';

import { Logo } from '@/components/Logo';
import { Text } from '@/components/Text';
import { fr } from '@/i18n/fr';
import { theme } from '@/theme';

/** Bulle de bienvenue du tuteur (O1). */
export function TutorBubble({ text }: { text: string }) {
  return (
    <View style={styles.row}>
      <View style={styles.avatar}>
        <Logo
          variant="onBlue"
          size={40}
          borderRadius={theme.radius.full}
          accessibilityLabel={fr.onboarding.tutorLabel}
        />
      </View>
      <View style={styles.bubble}>
        <Text variant="lead">{text}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'flex-end', gap: 10 },
  avatar: { borderRadius: theme.radius.full, boxShadow: theme.shadow.sm },
  bubble: {
    flex: 1,
    paddingVertical: theme.space[3],
    paddingHorizontal: theme.space[4],
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderBottomRightRadius: 20,
    borderBottomLeftRadius: 6,
    backgroundColor: theme.colors.surface,
    boxShadow: theme.shadow.md,
  },
});
