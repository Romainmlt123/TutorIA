import { StyleSheet, View } from 'react-native';

import { Icon, type IconName } from '@/components/Icon';
import { Text } from '@/components/Text';
import { fr } from '@/i18n/fr';
import { theme } from '@/theme';

const t = fr.parent.home.weekly;
const P = theme.spaces.parent;
const ICONS: readonly IconName[] = ['etoile', 'horloge', 'ampoule'];

/**
 * J3 · « Chaque semaine, vous verrez » (FeatureList, v2.19) : ce que le parent suivra, et ce qu'il
 * ne lira jamais (les conversations avec le tuteur).
 */
export function WeeklyPreviewCard() {
  return (
    <View accessibilityLabel={t.title} style={styles.card}>
      <Text variant="metric" accessibilityRole="header">
        {t.title}
      </Text>
      <View style={styles.list}>
        {t.items.map((item, index) => (
          <View key={item} style={styles.item}>
            <View style={styles.icon}>
              <Icon name={ICONS[index] ?? 'etoile'} size={18} color={P.ink} strokeWidth={2} />
            </View>
            <Text variant="lead" style={styles.text}>
              {item}
            </Text>
          </View>
        ))}
      </View>
      <View style={styles.never}>
        <Icon name="cadenas" size={16} color={P.ink} strokeWidth={2} />
        <Text variant="hint" color="textSecondary" style={styles.text}>
          {t.never}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: 14,
    padding: theme.space[5],
    borderRadius: theme.radius['3xl'],
    backgroundColor: theme.colors.surface,
    boxShadow: theme.shadow.md,
  },
  list: { gap: theme.space[3] },
  item: { flexDirection: 'row', alignItems: 'center', gap: theme.space[3] },
  icon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: P.soft,
  },
  text: { flex: 1 },
  never: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.space[2],
    paddingTop: theme.space[3],
    borderTopWidth: 1,
    borderTopColor: P.soft,
  },
});
