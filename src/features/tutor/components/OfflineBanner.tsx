import { StyleSheet, View } from 'react-native';

import { Icon } from '@/components/Icon';
import { PressableBase } from '@/components/PressableBase';
import { Text } from '@/components/Text';
import { fr } from '@/i18n/fr';
import { extras, theme } from '@/theme';

const O = extras.offlineNotice;
const INK = theme.palette.orange[900];
/** Bouton rond de 40 px, touchable sur 48 px. */
const RETRY_SIZE = 40;

/**
 * H1 · Pas de connexion (v2.19.1) : une carte jaune dans la discussion, sous la question restée en
 * attente, et un bouton rond pour la renvoyer.
 */
export function OfflineBanner({ onRetry }: { onRetry: () => void }) {
  return (
    <View accessibilityRole="alert" style={styles.card}>
      <View style={styles.icon}>
        <Icon name="wifi-barre" size={18} color={INK} strokeWidth={2.25} />
      </View>
      <View style={styles.texts}>
        <Text variant="lead" weight="bold" color={INK}>
          {fr.tutor.offlineTitle}
        </Text>
        <Text variant="hint" weight="medium" color={INK}>
          {fr.tutor.offlineBody}
        </Text>
      </View>
      <PressableBase
        onPress={onRetry}
        accessibilityRole="button"
        accessibilityLabel={fr.tutor.retry}
        hitSlop={(48 - RETRY_SIZE) / 2}
        style={({ pressed }) => [styles.retry, pressed && styles.pressed]}>
        <Icon name="actualiser" size={20} color={INK} strokeWidth={2.25} />
      </PressableBase>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.space[3],
    paddingVertical: theme.space[3],
    paddingLeft: 14,
    paddingRight: theme.space[3],
    borderRadius: theme.radius['2xl'],
    backgroundColor: O.background,
    boxShadow: O.shadow,
  },
  icon: {
    width: 36,
    height: 36,
    borderRadius: theme.radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: O.iconVeil,
  },
  texts: { flex: 1, gap: 2 },
  retry: {
    width: RETRY_SIZE,
    height: RETRY_SIZE,
    borderRadius: theme.radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.surface,
  },
  pressed: { opacity: 0.85 },
});
