import { StyleSheet, View } from 'react-native';

import { PressableBase } from '@/components/PressableBase';
import { Text } from '@/components/Text';
import { fr } from '@/i18n/fr';
import { subjectTheme, theme, type SubjectId } from '@/theme';

type Props = {
  subjectId: SubjectId;
  number: number;
  title: string;
  cardCount: number;
  minutes: number;
  selected: boolean;
  onPress: () => void;
};

/** Ligne de chapitre sélectionnable : numéro sur le fond doux de la matière, bouton radio. */
export function ChapterRow({
  subjectId,
  number,
  title,
  cardCount,
  minutes,
  selected,
  onPress,
}: Props) {
  const subject = subjectTheme(subjectId);
  const detail = fr.flashcards.chapterDetail(cardCount, minutes);
  return (
    <PressableBase
      onPress={onPress}
      accessibilityRole="radio"
      accessibilityLabel={`${title}, ${detail}`}
      aria-checked={selected}
      shadow={theme.shadow.md}
      style={[styles.row, { borderColor: selected ? subject.ink : theme.colors.surface }]}>
      <View style={[styles.number, { backgroundColor: subject.soft }]}>
        <Text variant="label" weight="bold" color={subject.ink}>
          {String(number).padStart(2, '0')}
        </Text>
      </View>
      <View style={styles.texts}>
        <Text variant="body" weight="bold">
          {title}
        </Text>
        <Text variant="bodySm" color="textSecondary">
          {detail}
        </Text>
      </View>
      <View
        style={[
          styles.radio,
          selected
            ? { borderWidth: 7, borderColor: subject.ink }
            : { borderWidth: 2, borderColor: theme.palette.gray[400] },
        ]}
      />
    </PressableBase>
  );
}

const styles = StyleSheet.create({
  row: {
    minHeight: 68,
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.space[3],
    paddingVertical: theme.space[3],
    paddingHorizontal: theme.space[4],
    borderRadius: theme.radius['2xl'],
    borderWidth: 2,
    backgroundColor: theme.colors.surface,
  },
  number: {
    width: 40,
    height: 40,
    borderRadius: theme.radius['2xl'],
    alignItems: 'center',
    justifyContent: 'center',
  },
  texts: { flex: 1, gap: 2 },
  radio: {
    width: 24,
    height: 24,
    borderRadius: theme.radius.full,
    backgroundColor: theme.colors.surface,
  },
});
