import { StyleSheet, View } from 'react-native';

import { Button } from '@/components/Button';
import { GradientSurface } from '@/components/GradientSurface';
import { Icon } from '@/components/Icon';
import { Text } from '@/components/Text';
import { fr } from '@/i18n/fr';
import { liftShadow, theme } from '@/theme';

const t = fr.parent.home.noChild;
const P = theme.spaces.parent;

/**
 * J3 · Espace Parents sans enfant (v2.19) : posée sur le bandeau, la carte dit en trois étapes ce
 * qui commence, puis mène à « Ajouter un enfant » (F1).
 */
export function AddChildCard({ onAdd }: { onAdd: () => void }) {
  return (
    <View accessibilityLabel={t.title} style={styles.card}>
      <View style={styles.head}>
        <GradientSurface
          gradient={P.gradient}
          radius={theme.radius['2xl']}
          style={styles.tile}
          contentStyle={styles.tileContent}>
          <Icon name="famille" size={24} color={theme.colors.textOnColor} />
        </GradientSurface>
        <Text variant="h3" weight="black" accessibilityRole="header" style={styles.title}>
          {t.title}
        </Text>
      </View>
      <View style={styles.steps}>
        {t.steps.map((step, index) => (
          <View key={step} style={styles.step}>
            <View style={styles.number}>
              <Text variant="label" weight="black" color={P.ink}>
                {index + 1}
              </Text>
            </View>
            <Text variant="lead" style={styles.stepText}>
              {step}
            </Text>
          </View>
        ))}
      </View>
      <Button label={t.cta} onPress={onAdd} tone="parent" size="lg" leadingIcon="plus" highlight />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: theme.space[4],
    paddingTop: theme.space[6],
    paddingHorizontal: theme.space[5],
    paddingBottom: theme.space[5],
    borderRadius: theme.radius['3xl'],
    backgroundColor: theme.colors.surface,
    boxShadow: liftShadow('white', true),
  },
  head: { flexDirection: 'row', alignItems: 'center', gap: theme.space[3] },
  tile: { width: 48, height: 48 },
  tileContent: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  title: { flex: 1 },
  steps: { gap: theme.space[3] },
  step: { flexDirection: 'row', alignItems: 'flex-start', gap: theme.space[3] },
  number: {
    width: 28,
    height: 28,
    borderRadius: theme.radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: P.soft,
  },
  stepText: { flex: 1, paddingTop: 3 },
});
