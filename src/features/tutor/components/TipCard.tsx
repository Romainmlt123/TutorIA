import { StyleSheet, View } from 'react-native';

import { Icon } from '@/components/Icon';
import { Text } from '@/components/Text';
import { fr } from '@/i18n/fr';
import { theme } from '@/theme';

/** Carte Conseil : violet doux, alignée sur les bulles du tuteur. */
export function TipCard({ text }: { text: string }) {
  return (
    <View accessible accessibilityLabel={`${fr.tutor.tipLabel} : ${text}`} style={styles.card}>
      <View style={styles.icon}>
        <Icon name="ampoule" size={18} color={theme.colors.textOnColor} />
      </View>
      <View style={styles.texts}>
        <Text variant="overline" color="accent">
          {fr.tutor.tip}
        </Text>
        <Text variant="bodySm" color={theme.palette.gray[700]}>
          {text}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    alignSelf: 'flex-start',
    maxWidth: 310,
    marginLeft: theme.space[10],
    flexDirection: 'row',
    gap: theme.space[3],
    padding: theme.space[4],
    borderRadius: theme.radius['2xl'],
    backgroundColor: theme.colors.accentSoft,
  },
  icon: {
    width: 32,
    height: 32,
    borderRadius: theme.radius.full,
    backgroundColor: theme.colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  texts: { flexShrink: 1, gap: theme.space[1] },
});
