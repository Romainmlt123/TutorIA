import { useQuery } from '@tanstack/react-query';

import { chapterById } from '@/data/curriculum';
import { student as demoStudent } from '@/data/mock/student';
import type { StudentProfile, Subject, SubjectId } from '@/data/types';
import { fr } from '@/i18n/fr';
import { useStudentAccount } from '@/lib/session/SessionProvider';
import {
  studentKeys,
  useStudentChapters,
  useStudentOverview,
  useStudentProgressReady,
} from '@/lib/session/useStudentOverview';
import { levelOf } from '@/lib/xpLevel';
import { onboardingService } from '@/services/onboarding';
import { subjectTheme } from '@/theme';

import {
  currentLesson,
  DAILY_SESSIONS_TARGET,
  FIRST_CHAPTER,
  firstChapterId,
  FIRST_SESSION_MINUTES,
  isFreshSubject,
  LESSONS_PER_CHAPTER,
  subjectMastery,
} from '../logic/home';

/** Ordre des matières de l'Accueil (01-Accueil). */
const SUBJECTS: readonly SubjectId[] = [
  'maths',
  'francais',
  'histoire-geo',
  'anglais',
  'svt',
  'physique-chimie',
];

/** Titre de leçon connu seulement pour le chapitre de démonstration (01-Accueil). */
const DEMO_LESSON_TITLES: Record<string, Record<number, string>> = {
  [demoStudent.resume.chapterId]: { [demoStudent.resume.lesson]: demoStudent.resume.lessonTitle },
};

/** Données de l'Accueil : progression lue en base (ou simulée hors ligne). */
export function useHomeData() {
  const account = useStudentAccount();
  const overview = useStudentOverview();
  const chapters = useStudentChapters();
  const ready = useStudentProgressReady();
  // Premier jour (J1, v2.19) : aucune séance sur un chapitre, une fois la progression lue.
  const firstDay = ready && overview.lastChapter === null;
  const answers = useQuery({
    queryKey: studentKeys.onboarding,
    queryFn: () => onboardingService.load(),
    enabled: firstDay,
  });

  const lastChapterId =
    overview.lastChapter?.chapterId ??
    (firstDay ? firstChapterId(answers.data?.selfAssessment) : FIRST_CHAPTER);
  const chapter = chapterById(lastChapterId) ?? chapterById(FIRST_CHAPTER);
  const subjectId: SubjectId = chapter?.subjectId ?? 'maths';
  const lesson = currentLesson(overview.lastChapter?.sessions ?? 0);
  const lessonTitle = DEMO_LESSON_TITLES[lastChapterId]?.[lesson] ?? '';

  const student: StudentProfile = {
    firstName: account?.firstName ?? '',
    grade: account?.grade ?? '4e',
    streakDays: overview.streakDays,
    recordStreakDays: overview.recordStreak,
    ...levelOf(overview.xp),
    unreadNotifications: 0,
    dailyGoal: {
      minutes: overview.dailyMinutes,
      sessionsDone: overview.todaySessions,
      sessionsTarget: DAILY_SESSIONS_TARGET,
    },
    resume: {
      subjectId,
      chapterId: chapter?.id ?? FIRST_CHAPTER,
      lesson,
      lessonCount: LESSONS_PER_CHAPTER,
      lessonTitle,
      chapterProgress: overview.lastChapter?.mastery ?? 0,
    },
  };

  const subjects: (Subject & { fresh: boolean })[] = SUBJECTS.map((id) => ({
    id,
    name: subjectTheme(id).name,
    mastery: subjectMastery(chapters, id),
    fresh: ready && isFreshSubject(chapters, id),
  }));

  return {
    student,
    subjects,
    resume: {
      ...student.resume,
      chapterTitle: chapter?.title ?? '',
      first: firstDay ? { minutes: FIRST_SESSION_MINUTES } : undefined,
      subtitle: fr.home.resumeSubtitle(
        subjectTheme(subjectId).name,
        lesson,
        LESSONS_PER_CHAPTER,
        lessonTitle,
      ),
    },
  };
}
