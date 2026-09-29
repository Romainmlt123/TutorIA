import { useLocalSearchParams, useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { Button } from '@/components/Button';
import { ProgressBar } from '@/components/ProgressBar';
import { ScreenContainer } from '@/components/ScreenContainer';
import { fr } from '@/i18n/fr';
import { subjectTheme, theme } from '@/theme';

import { QuizCard } from './components/QuizCard';
import { SessionComplete } from './components/SessionComplete';
import { SessionTopBar } from './components/SessionTopBar';
import { TallyChips } from './components/TallyChips';
import { useFlashcardSession } from './hooks/useFlashcardSession';

/** 03B · Flashcards · Session (design/screens/03b-Flashcards-Session.dc.html). */
export function SessionScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ chapter?: string; mode?: string }>();
  const session = useFlashcardSession(params);
  const subject = subjectTheme(session.subjectId);
  const quit = () => (router.canGoBack() ? router.back() : router.replace('/revisions'));

  return (
    <ScreenContainer>
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
            onRestart={() => session.dispatch({ type: 'restart' })}
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
          <Button
            label={session.isLast ? fr.flashcards.seeResults : fr.flashcards.next}
            icon="fleche-droite"
            weight="bold"
            highlight
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
