import { useLocalSearchParams, useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { Button } from '@/components/Button';
import { ProgressBar } from '@/components/ProgressBar';
import { ScreenContainer } from '@/components/ScreenContainer';
import { DAILY_SESSIONS_TARGET } from '@/features/home/logic/home';
import { fr } from '@/i18n/fr';
import { useStudentOverview } from '@/lib/session/useStudentOverview';
import { subjectTheme, theme } from '@/theme';

import { QuizCard } from './components/QuizCard';
import { SessionComplete } from './components/SessionComplete';
import { SessionTopBar } from './components/SessionTopBar';
import { TallyChips } from './components/TallyChips';
import { useFlashcardSession } from './hooks/useFlashcardSession';

/**
 * 03B à 3C · Flashcards · Session (design/screens/03b-…, 03b2-…, 03b3-…, 03c-…) : plein écran, sans
 * barre de navigation (v2.12), on sort par « Quitter ».
 */
export function SessionScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ chapter?: string; mode?: string }>();
  const session = useFlashcardSession(params);
  const subject = subjectTheme(session.subjectId);
  const overview = useStudentOverview();
  const quit = () => (router.canGoBack() ? router.back() : router.replace('/revisions'));

  return (
    <ScreenContainer withNav={false}>
      <SessionTopBar
        title={session.title}
        subtitle={session.subtitle}
        streakDays={session.streakDays}
        onQuit={quit}
      />
      <View style={styles.progress}>
        <ProgressBar
          value={session.progress}
          height={8}
          trackColor={subject.soft}
          fill={subject.tile}
          animationMs={400}
        />
      </View>

      {session.done || !session.card ? (
        <View style={styles.card}>
          <SessionComplete
            known={session.state.known.length}
            toReview={session.state.toReview.length}
            xp={session.xp}
            sessionsDone={overview.todaySessions}
            sessionsTarget={DAILY_SESSIONS_TARGET}
            onRestart={() => session.dispatch({ type: 'restart' })}
            onOtherChapter={() => router.replace('/revisions')}
          />
        </View>
      ) : (
        <>
          <View style={styles.card}>
            <QuizCard
              key={session.card.id}
              card={session.card}
              subjectId={session.subjectId}
              answered={session.answered}
              optionState={session.optionState}
              feedback={session.feedback}
              onPick={(option) => session.dispatch({ type: 'pick', option })}
            />
          </View>
          {/* Gris avant la réponse (il dit ce qu'on attend), violet ensuite (v2.12). */}
          <Button
            label={
              !session.answered
                ? fr.flashcards.waitingAnswer
                : session.isLast
                  ? fr.flashcards.seeResults
                  : fr.flashcards.next
            }
            variant={session.answered ? 'vivid' : 'waiting'}
            icon={session.answered ? 'fleche-droite' : undefined}
            weight="bold"
            disabled={!session.answered}
            onPress={() => session.dispatch({ type: 'next' })}
            style={styles.next}
          />
          <View style={styles.tally}>
            <TallyChips
              known={session.state.known.length}
              toReview={session.state.toReview.length}
            />
          </View>
        </>
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  progress: { marginTop: theme.space[3] },
  card: { marginTop: theme.space[5] },
  next: { marginTop: theme.space[4] },
  tally: { marginTop: theme.space[3] },
});
