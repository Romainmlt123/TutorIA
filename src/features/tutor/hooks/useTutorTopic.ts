import { useLocalSearchParams } from 'expo-router';

import { chapterById } from '@/data/curriculum';
import { subjects } from '@/data/mock/subjects';
import type { SubjectId } from '@/data/types';
import { currentLesson, LESSONS_PER_CHAPTER } from '@/features/home/logic/home';
import { fr } from '@/i18n/fr';
import { useStudentOverview } from '@/lib/session/useStudentOverview';
import type { TutorTopic } from '@/services/tutor';

/** Sujet passé à l'écran (`?chapter=…` ou `?subject=…`) ; un chapitre fixe aussi sa matière. */
export function topicOfParams(params: { subject?: string; chapter?: string }): TutorTopic {
  const chapter = params.chapter ? chapterById(params.chapter) : undefined;
  if (chapter) return { subjectId: chapter.subjectId, chapterId: chapter.id };
  const subject = subjects.find((s) => s.id === params.subject);
  return subject ? { subjectId: subject.id } : {};
}

/** Sujet de la discussion, lu dans l'adresse de l'écran. */
export function useTopicParams(): TutorTopic {
  const params = useLocalSearchParams<{ subject?: string; chapter?: string }>();
  return topicOfParams(params);
}

export const subjectNameOf = (subjectId: SubjectId | undefined) =>
  subjects.find((s) => s.id === subjectId)?.name ?? fr.tutor.chat.allSubjects;

/**
 * Textes de la carte « Sujet de la discussion » : matière, chapitre (ou titre de la discussion
 * libre) et, pour un chapitre, la leçon en cours.
 */
export function useTopicLabels(topic: TutorTopic, title?: string | null) {
  const overview = useStudentOverview();
  const chapter = topic.chapterId ? chapterById(topic.chapterId) : undefined;
  const last = overview.lastChapter;
  return {
    subjectName: subjectNameOf(topic.subjectId),
    chapterTitle: title ?? chapter?.title ?? fr.tutor.chat.freeTopic,
    lessonLabel: chapter
      ? fr.tutor.lesson(
          last?.chapterId === chapter.id ? currentLesson(last.sessions) : 1,
          LESSONS_PER_CHAPTER,
        )
      : undefined,
  };
}
