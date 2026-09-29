import { StyleSheet, View } from 'react-native';

import { Card } from '@/components/Card';
import { Pill } from '@/components/Pill';
import { SubjectTile } from '@/components/subject/SubjectTile';
import { Text } from '@/components/Text';
import { fr } from '@/i18n/fr';
import { subjectTheme, theme, type SubjectId } from '@/theme';

type Props = {
  subjectId: SubjectId;
  subjectName: string;
  chapterTitle: string;
  /** « Leçon 3/5 » à l'écrit, chrono de l'appel au vocal. */
  badge: { kind: 'lesson'; label: string } | { kind: 'timer'; label: string };
};

/** Carte « Sujet de la discussion ». */
export function TopicCard({ subjectId, subjectName, chapterTitle, badge }: Props) {
  const subject = subjectTheme(subjectId);
  return (
    <Card
      padding={0}
      style={styles.card}
      accessibilityLabel={`${fr.tutor.topicLabel} : ${subjectName}, ${chapterTitle}`}>
      <SubjectTile subjectId={subjectId} size={40} />
      <View style={styles.texts}>
        <Text variant="overline" color={subject.ink}>
          {subjectName}
        </Text>
        <Text variant="body" weight="bold" numberOfLines={1}>
          {chapterTitle}
        </Text>
      </View>
      <Pill
        label={badge.label}
        backgroundColor={subject.soft}
        color={subject.pillInk}
        dotColor={badge.kind === 'timer' ? theme.colors.error : undefined}
        style={styles.pill}
      />
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    alignSelf: 'stretch',
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.space[3],
    paddingVertical: theme.space[3],
    paddingHorizontal: theme.space[4],
  },
  texts: { flex: 1 },
  pill: { alignSelf: 'center' },
});
