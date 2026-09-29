import { StyleSheet, View } from 'react-native';

import { Button } from '@/components/Button';
import { GradientSurface } from '@/components/GradientSurface';
import { Icon } from '@/components/Icon';
import { Text } from '@/components/Text';
import { fr } from '@/i18n/fr';
import { theme } from '@/theme';

export type InsightItem = { id: string; notion: string; subjectName: string; percent: number };

type Props =
  | { kind: 'strengths'; items: readonly InsightItem[] }
  | { kind: 'toWork'; items: readonly InsightItem[]; onReview: (item: InsightItem) => void };

/** Points forts (dégradé vert) et À retravailler (orange uni, bouton « Réviser »). */
export function InsightList(props: Props) {
  const strengths = props.kind === 'strengths';
  const content = (
    <>
      <View style={styles.header}>
        <View style={styles.title}>
          <Icon name={strengths ? 'etoile' : 'cible'} size={20} color={theme.colors.textOnColor} />
          <Text variant="body" weight="black" color="textOnColor" accessibilityRole="header">
            {strengths ? fr.stats.strengths : fr.stats.toWork}
          </Text>
        </View>
        {strengths ? null : (
          <Text variant="label" color="textOnColor">
            {fr.stats.toWorkHint}
          </Text>
        )}
      </View>
      <View style={styles.list}>
        {props.items.map((item) => (
          <View key={item.id} style={styles.row}>
            <View
              style={[
                styles.tile,
                {
                  backgroundColor: strengths ? theme.colors.successSoft : theme.colors.warningSoft,
                },
              ]}>
              <Icon
                name={strengths ? 'coche' : 'retour'}
                size={20}
                color={strengths ? theme.colors.success : theme.colors.warning}
                strokeWidth={strengths ? 2 : 1.75}
              />
            </View>
            <View style={styles.texts}>
              <Text variant="label">{item.notion}</Text>
              <Text variant="caption" weight="regular" color="textSecondary">
                {strengths ? item.subjectName : `${item.subjectName} · ${item.percent} %`}
              </Text>
            </View>
            {props.kind === 'strengths' ? (
              <Text variant="label" weight="bold" color="successStrong">
                {`${item.percent} %`}
              </Text>
            ) : (
              <Button
                label={fr.stats.review}
                variant="small"
                accessibilityLabel={fr.stats.reviewLabel(item.notion)}
                onPress={() => props.onReview(item)}
              />
            )}
          </View>
        ))}
      </View>
    </>
  );

  if (strengths) {
    return (
      <GradientSurface
        gradient={theme.subjects['histoire-geo'].gradient}
        shadow={theme.shadow.md}
        contentStyle={styles.card}>
        {content}
      </GradientSurface>
    );
  }
  return (
    <View style={styles.shadow}>
      <View style={[styles.card, styles.solid]}>{content}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  shadow: { borderRadius: theme.radius['3xl'], boxShadow: theme.shadow.md },
  card: { gap: theme.space[4], padding: theme.space[4], borderRadius: theme.radius['3xl'] },
  solid: { backgroundColor: theme.game.streak.background },
  header: { gap: theme.space[1] },
  title: { flexDirection: 'row', alignItems: 'center', gap: theme.space[2] },
  list: { gap: theme.space[3] },
  row: {
    minHeight: theme.space[12],
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.space[3],
    paddingVertical: theme.space[2],
    paddingLeft: theme.space[2],
    paddingRight: theme.space[3],
    borderRadius: theme.radius['2xl'],
    backgroundColor: theme.colors.surface,
    boxShadow: theme.shadow.sm,
  },
  tile: {
    width: 40,
    height: 40,
    borderRadius: theme.radius['2xl'],
    alignItems: 'center',
    justifyContent: 'center',
  },
  texts: { flex: 1 },
});
