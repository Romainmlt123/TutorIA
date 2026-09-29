import { useLocalSearchParams, useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { Button } from '@/components/Button';
import { IconButton } from '@/components/IconButton';
import { ScreenContainer } from '@/components/ScreenContainer';
import { SectionHeader } from '@/components/SectionHeader';
import { SubjectCard } from '@/components/subject/SubjectCard';
import { Text } from '@/components/Text';
import { TwoColumnGrid } from '@/components/TwoColumnGrid';
import { fr } from '@/i18n/fr';
import { theme } from '@/theme';

import { ChapterRow } from './components/ChapterRow';
import { DailyReviewCard } from './components/DailyReviewCard';
import { useFlashcardCatalog } from './hooks/useFlashcardCatalog';

/** 03A · Flashcards · Choix (design/screens/03a-Flashcards-Choix.dc.html). */
export function ChoiceScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ subject?: string; chapter?: string }>();
  const catalog = useFlashcardCatalog(params.subject, params.chapter);
  const subjectName = catalog.subjects.find((s) => s.id === catalog.subjectId)?.name ?? '';
  const chapter = catalog.selectedChapter;

  return (
    <ScreenContainer>
      <View style={styles.header}>
        <Text variant="h2" weight="black" accessibilityRole="header" style={styles.title}>
          {fr.flashcards.title}
        </Text>
        <IconButton
          icon="reglages"
          iconSize={22}
          iconColor={theme.colors.text}
          accessibilityLabel={fr.flashcards.settings}
          onPress={() => router.push({ pathname: '/bientot', params: { sujet: 'reglages' } })}
        />
      </View>

      <View style={styles.daily}>
        <DailyReviewCard
          {...catalog.dailyReview}
          streakDays={catalog.streakDays}
          onStart={() => router.push({ pathname: '/revisions/session', params: { mode: 'daily' } })}
        />
      </View>

      <View accessibilityLabel={fr.flashcards.subjectSection} style={styles.section}>
        <SectionHeader title={fr.flashcards.chooseSubject} />
        <TwoColumnGrid
          items={catalog.subjects}
          keyOf={(s) => s.id}
          renderItem={(subject) => (
            <SubjectCard
              mode="select"
              subjectId={subject.id}
              name={subject.name}
              cardCount={subject.cardCount}
              selected={subject.id === catalog.subjectId}
              onPress={() => catalog.selectSubject(subject.id)}
            />
          )}
        />
      </View>

      <View
        accessibilityLabel={fr.flashcards.chapterSection}
        accessibilityRole="radiogroup"
        style={styles.section}>
        <SectionHeader
          title={fr.flashcards.chapters(subjectName)}
          meta={fr.flashcards.curriculum}
        />
        {catalog.chapters.map((c, index) => (
          <ChapterRow
            key={c.id}
            subjectId={catalog.subjectId}
            number={index + 1}
            title={c.title}
            cardCount={c.cardCount}
            minutes={c.minutes}
            selected={c.id === chapter?.id}
            onPress={() => catalog.selectChapter(c.id)}
          />
        ))}
      </View>

      {chapter ? (
        <Button
          label={fr.flashcards.startSession(chapter.cardCount)}
          icon="fleche-droite"
          highlight
          disabled={chapter.cardCount === 0}
          onPress={() =>
            router.push({ pathname: '/revisions/session', params: { chapter: chapter.id } })
          }
          style={styles.start}
        />
      ) : null}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', gap: theme.space[3] },
  title: { flex: 1 },
  daily: { marginTop: theme.space[6] },
  section: { gap: theme.space[3], marginTop: theme.space[8] },
  start: { marginTop: theme.space[6] },
});
