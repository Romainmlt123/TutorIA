import { useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { ScreenBand } from '@/components/ScreenBand';
import { ScreenContainer } from '@/components/ScreenContainer';
import { SectionCard } from '@/components/SectionCard';
import { ConsentBanner } from '@/features/access/ConsentBanner';
import { SubjectCard } from '@/components/subject/SubjectCard';
import { TwoColumnGrid } from '@/components/TwoColumnGrid';
import { fr } from '@/i18n/fr';
import { theme } from '@/theme';

import { GoalCard } from './components/GoalCard';
import { HomeHeader } from './components/HomeHeader';
import { LevelCard } from './components/LevelCard';
import { QuoteOfTheDay } from './components/QuoteOfTheDay';
import { ResumeCard } from './components/ResumeCard';
import { StreakCard } from './components/StreakCard';
import { useHomeData } from './hooks/useHomeData';

/** Ce que les cartes de jeu recouvrent du bandeau, sur l'Accueil seulement. */
const HOME_OVERLAP = 64;

/** 01 · Accueil (design/screens/01-Accueil.dc.html), bandeau de marque bleu (v2.5). */
export function HomeScreen() {
  const router = useRouter();
  const { student, quote, subjects, resume } = useHomeData();

  return (
    <ScreenContainer
      contentStyle={styles.content}
      bandOverlap={HOME_OVERLAP}
      band={
        <ScreenBand tone="student" overlap={HOME_OVERLAP} accessibilityLabel={fr.home.welcome}>
          <HomeHeader
            firstName={student.firstName}
            unreadNotifications={student.unreadNotifications}
            onNotifications={() =>
              router.push({ pathname: '/bientot', params: { sujet: 'notifications' } })
            }
            onProfile={() => router.push('/profil')}
          />
          {quote ? <QuoteOfTheDay quote={quote} /> : null}
        </ScreenBand>
      }>
      <View accessibilityLabel={fr.home.gameSection} style={styles.gameRow}>
        <StreakCard days={student.streakDays} />
        <LevelCard level={student.level} xp={student.xp} xpForNextLevel={student.xpForNextLevel} />
      </View>
      <ConsentBanner />

      <ResumeCard
        subjectId={resume.subjectId}
        chapterTitle={resume.chapterTitle}
        subtitle={resume.subtitle}
        progress={resume.chapterProgress}
        onResume={() =>
          router.push({
            pathname: '/tuteur',
            // La dernière discussion sur ce chapitre, ou une nouvelle s'il n'y en a pas.
            params: { reprendre: '1', chapter: resume.chapterId },
          })
        }
      />

      <GoalCard {...student.dailyGoal} />

      <SectionCard
        title={fr.home.subjects}
        action={{ label: fr.home.seeAll, onPress: () => router.push('/revisions') }}>
        <TwoColumnGrid
          items={subjects}
          keyOf={(s) => s.id}
          renderItem={(subject) => (
            <SubjectCard
              mode="progress"
              subjectId={subject.id}
              name={subject.name}
              mastery={subject.mastery}
              onPress={() =>
                router.push({ pathname: '/revisions', params: { subject: subject.id } })
              }
            />
          )}
        />
      </SectionCard>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: { gap: theme.space[4] },
  gameRow: { flexDirection: 'row', gap: theme.space[3] },
});
