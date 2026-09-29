import { StyleSheet, View } from 'react-native';

import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { StreakBadge } from '@/components/StreakBadge';
import { SubjectTile } from '@/components/subject/SubjectTile';
import { Text } from '@/components/Text';
import { fr } from '@/i18n/fr';
import { theme, type SubjectId } from '@/theme';

type Props = {
  cardCount: number;
  minutes: number;
  streakDays: number;
  subjects: readonly { id: SubjectId; name: string }[];
  onStart: () => void;
};

const VISIBLE = 3;

/** Révision du jour : cartes à revoir, matières concernées et bouton violet vif. */
export function DailyReviewCard({ cardCount, minutes, streakDays, subjects, onStart }: Props) {
  const visible = subjects.slice(0, VISIBLE);
  const others = subjects.length - visible.length;
  return (
    <Card
      padding={theme.space[6]}
      radius="3xl"
      clip
      style={styles.card}
      accessibilityLabel={fr.flashcards.dailyReview}>
      <View style={styles.decor} />
      <View style={styles.top}>
        <View style={styles.texts}>
          <Text variant="h3" weight="bold" accessibilityRole="header">
            {fr.flashcards.dailyReview}
          </Text>
          <Text variant="bodySm" color="textSecondary">
            {fr.flashcards.dailyDetail(cardCount, minutes)}
          </Text>
        </View>
        <StreakBadge days={streakDays} size="sm" />
      </View>
      <View style={styles.bottom}>
        <View
          accessible
          accessibilityLabel={fr.flashcards.dailySubjects(
            visible.map((s) => s.name),
            others,
          )}
          style={styles.stack}>
          {visible.map((subject, index) => (
            <View key={subject.id} style={index > 0 ? styles.overlap : null}>
              <SubjectTile subjectId={subject.id} size={36} />
            </View>
          ))}
          {others > 0 ? (
            <View style={[styles.more, styles.overlap]}>
              <Text variant="caption" weight="bold" color="primary">
                {`+${others}`}
              </Text>
            </View>
          ) : null}
        </View>
        <Button
          label={fr.flashcards.start}
          variant="vivid"
          weight="bold"
          icon="fleche-droite"
          iconSize={18}
          onPress={onStart}
        />
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { gap: theme.space[4] },
  decor: {
    position: 'absolute',
    right: -40,
    top: -40,
    width: 140,
    height: 140,
    borderRadius: theme.radius.full,
    backgroundColor: theme.palette.orange[100],
  },
  top: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: theme.space[3],
  },
  texts: { flex: 1, gap: theme.space[1] },
  bottom: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  stack: { flexDirection: 'row', alignItems: 'center' },
  overlap: { marginLeft: -10 },
  more: {
    width: 36,
    height: 36,
    borderRadius: theme.radius.full,
    borderWidth: 2,
    borderColor: theme.colors.surface,
    backgroundColor: theme.colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
