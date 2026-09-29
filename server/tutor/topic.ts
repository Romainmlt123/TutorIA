import { chapters } from '@/data/mock/chapters';
import { student } from '@/data/mock/student';
import { subjects } from '@/data/mock/subjects';
import type { TutorTopic } from '@/services/tutor/api-contract';

import type { PromptContext } from './prompt';

/** Contexte pédagogique transmis au prompt (sans le prénom de l'élève). */
export function promptContextOf(topic: TutorTopic, mode: PromptContext['mode']): PromptContext {
  return {
    mode,
    grade: student.grade,
    subject: subjects.find((s) => s.id === topic.subjectId)?.name ?? topic.subjectId,
    chapter: chapters.find((c) => c.id === topic.chapterId)?.title ?? '',
  };
}
