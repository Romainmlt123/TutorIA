import { useLocalSearchParams, useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { Button } from '@/components/Button';
import { IconButton } from '@/components/IconButton';
import { ScreenContainer } from '@/components/ScreenContainer';
import { ScreenBand } from '@/components/ScreenBand';
import { SectionCard } from '@/components/SectionCard';
import { SubjectCard } from '@/components/subject/SubjectCard';
import { Text } from '@/components/Text';
import { TwoColumnGrid } from '@/components/TwoColumnGrid';
import { fr } from '@/i18n/fr';
import { theme } from '@/theme';

import { ChapterRow } from './components/ChapterRow';
import { DailyReviewCard } from './components/DailyReviewCard';
import { useFlashcardCatalog } from './hooks/useFlashcardCatalog';

/** 03A · Flashcards · Choix (design/screens/03a-Flashcards-Choix.dc.html), bandeau bleu (v2.5). */
export function ChoiceScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ subject?: string; chapter?: string }>();
  const catalog = useFlashcardCatalog(params.subject, params.chapter);
  const subjectName = catalog.subjects.find((s) => s.id === catalog.subjectId)?.name ?? '';
  const chapter = catalog.selectedChapter;

  const totalCards = catalog.subjects.reduce((sum, s) => sum + s.cardCount, 0);

  return (
    <ScreenContainer
      contentStyle={styles.content}
      band={
        <ScreenBand tone="student" accessibilityLabel={fr.flashcards.title}>
          <View style={styles.header}>
            <Text
              variant="hero"
              color="textOnColor"
              accessibilityRole="header"
              style={styles.title}>
              {fr.flashcards.title}
            </Text>
            <IconButton
              icon="reglages"
              iconSize={22}
              onBand
              accessibilityLabel={fr.flashcards.settings}
              onPress={() => router.push({ pathname: '/bientot', params: { sujet: 'reglages' } })}
            />
          </View>
        </ScreenBand>
      }>
      <DailyReviewCard
        {...catalog.dailyReview}
        streakDays={catalog.streakDays}
        onStart={() => router.push({ pathname: '/revisions/session', params: { mode: 'daily' } })}
      />

      <SectionCard title={fr.flashcards.chooseSubject} meta={fr.flashcards.totalCards(totalCards)}>
        <View accessibilityLabel={fr.flashcards.subjectSection}>
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
      </SectionCard>

      <SectionCard
        title={fr.flashcards.chapters(subjectName)}
        meta={fr.flashcards.curriculum}
        gap={theme.space[2]}>
        <View
          accessibilityLabel={fr.flashcards.chapterSection}
          accessibilityRole="radiogroup"
          style={styles.chapters}>
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
      </SectionCard>

      {chapter ? (
        <Button
          label={fr.flashcards.startSession(chapter.cardCount)}
          icon="fleche-droite"
          highlight
          disabled={chapter.cardCount === 0}
          onPress={() =>
            router.push({ pathname: '/revisions/session', params: { chapter: chapter.id } })
          }
        />
      ) : null}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: { gap: theme.space[4] },
  header: { flexDirection: 'row', alignItems: 'center', gap: theme.space[3] },
  title: { flex: 1 },
  chapters: { gap: theme.space[2] },
});
