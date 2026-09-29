import { StyleSheet, View } from 'react-native';

import { Icon } from '@/components/Icon';
import { PressableBase } from '@/components/PressableBase';
import { Text } from '@/components/Text';
import { Watermark } from '@/components/Watermark';
import { fr } from '@/i18n/fr';
import { theme } from '@/theme';

import { StrongText } from './StrongText';

type Props = { text: string; onDetail: () => void };

/** P1 · À surveiller : n'est affichée que s'il y a une alerte réelle. */
export function AlertCard({ text, onDetail }: Props) {
  const t = fr.parent.home;
  return (
    <View style={styles.card}>
      <Watermark icon="alerte" size={120} offset={-26} opacity={0.18} />
      <View style={styles.head}>
        <View style={styles.badge}>
          <Icon name="alerte" size={20} color={theme.palette.orange[500]} strokeWidth={2} />
        </View>
        <Text variant="section" color="textOnColor" accessibilityRole="header">
          {t.alertTitle}
        </Text>
      </View>
      <StrongText variant="lead" weight="medium" color="textOnColor" text={text} />
      <PressableBase
        onPress={onDetail}
        accessibilityRole="button"
        style={({ pressed }) => [styles.action, pressed && styles.pressed]}>
        <Text variant="label" weight="bold" color={theme.palette.orange[800]}>
          {t.seeDetail}
        </Text>
        <Icon name="fleche-droite" size={16} color={theme.palette.orange[800]} strokeWidth={2.25} />
      </PressableBase>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: theme.space[3],
    padding: theme.space[5],
    borderRadius: theme.radius['3xl'],
    backgroundColor: theme.palette.orange[500],
    boxShadow: theme.shadow.md,
    overflow: 'hidden',
  },
  head: { flexDirection: 'row', alignItems: 'center', gap: theme.space[3] },
  badge: {
    width: theme.space[10],
    height: theme.space[10],
    borderRadius: theme.radius.full,
    backgroundColor: theme.colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  action: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    height: 44,
    paddingHorizontal: theme.space[4],
    borderRadius: 14,
    backgroundColor: theme.colors.surface,
  },
  pressed: { backgroundColor: theme.palette.orange[100] },
});
