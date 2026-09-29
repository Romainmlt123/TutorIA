import { useLocalSearchParams } from 'expo-router';

import { chapterById } from '@/data/curriculum';
import { student as demoStudent } from '@/data/mock/student';
import { subjects } from '@/data/mock/subjects';
import { currentLesson, LESSONS_PER_CHAPTER } from '@/features/home/logic/home';
import { fr } from '@/i18n/fr';
import { config } from '@/lib/config';
import { useStudentOverview } from '@/lib/session/useStudentOverview';
import type { TutorTopic } from '@/services/tutor';

/** Sujet de la discussion : le chapitre demandé, sinon celui de la dernière séance (« Reprendre »). */
export function useTutorTopic() {
  const { chapter } = useLocalSearchParams<{ chapter?: string }>();
  const overview = useStudentOverview();
  const resumeChapterId = overview.lastChapter?.chapterId ?? demoStudent.resume.chapterId;
  const entry = chapterById(chapter ?? '') ?? chapterById(resumeChapterId);
  const chapterId = entry?.id ?? resumeChapterId;
  const subjectId = entry?.subjectId ?? demoStudent.resume.subjectId;
  const resuming = chapterId === resumeChapterId;
  const topic: TutorTopic = { subjectId, chapterId };
  return {
    topic,
    subjectName: subjects.find((s) => s.id === subjectId)?.name ?? '',
    chapterTitle: entry?.title ?? '',
    lessonLabel: fr.tutor.lesson(
      resuming ? currentLesson(overview.lastChapter?.sessions ?? 0) : 1,
      LESSONS_PER_CHAPTER,
    ),
    // La conversation de démonstration (maquette 02a) n'existe qu'en mode simulé.
    isResume: config.backend === 'mock' && chapterId === demoStudent.resume.chapterId,
  };
}
