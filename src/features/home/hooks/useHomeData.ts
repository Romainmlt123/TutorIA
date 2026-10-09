import { chapterById } from '@/data/curriculum';
import { quotes } from '@/data/mock/quotes';
import { student as demoStudent } from '@/data/mock/student';
import type { StudentProfile, Subject, SubjectId } from '@/data/types';
import { fr } from '@/i18n/fr';
import { useStudentAccount } from '@/lib/session/SessionProvider';
import { useStudentChapters, useStudentOverview } from '@/lib/session/useStudentOverview';
import { levelOf } from '@/lib/xpLevel';
import { subjectTheme } from '@/theme';

import {
  currentLesson,
  DAILY_SESSIONS_TARGET,
  LESSONS_PER_CHAPTER,
  quoteOfTheDay,
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

/** Premier chapitre proposé tant que l'élève n'a encore rien travaillé. */
const FIRST_CHAPTER = 'maths-equations';

/** Titre de leçon connu seulement pour le chapitre de démonstration (01-Accueil). */
const DEMO_LESSON_TITLES: Record<string, Record<number, string>> = {
  [demoStudent.resume.chapterId]: { [demoStudent.resume.lesson]: demoStudent.resume.lessonTitle },
};

/** Données de l'Accueil : progression lue en base (ou simulée hors ligne). */
export function useHomeData(today = new Date()) {
  const account = useStudentAccount();
  const overview = useStudentOverview();
  const chapters = useStudentChapters();

  const lastChapterId = overview.lastChapter?.chapterId ?? FIRST_CHAPTER;
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

  const subjects: Subject[] = SUBJECTS.map((id) => ({
    id,
    name: subjectTheme(id).name,
    mastery: subjectMastery(chapters, id),
  }));

  return {
    student,
    quote: quoteOfTheDay(quotes, today),
    subjects,
    resume: {
      ...student.resume,
      chapterTitle: chapter?.title ?? '',
      subtitle: fr.home.resumeSubtitle(
        subjectTheme(subjectId).name,
        lesson,
        LESSONS_PER_CHAPTER,
        lessonTitle,
      ),
    },
  };
}
