import { chapterTitle } from '@/data/curriculum';
import { student } from '@/data/mock/student';
import { subjects } from '@/data/mock/subjects';
import type { TutorTopic } from '@/services/tutor/api-contract';

import { levelOfTopic } from './level';
import type { PromptContext } from './prompt';

/**
 * Contexte pédagogique transmis au prompt (sans le prénom de l'élève). Pour un niveau d'Explorer,
 * la classe et le chapitre viennent du contenu du niveau ; en chat libre, il n'y a parfois ni
 * matière ni chapitre.
 */
export function promptContextOf(topic: TutorTopic, mode: PromptContext['mode']): PromptContext {
  const place = levelOfTopic(topic);
  const chapter = place?.city.name ?? (topic.chapterId ? chapterTitle(topic.chapterId) : '');
  return {
    mode,
    grade: place?.island.grade ?? student.grade,
    subject: topic.subjectId
      ? (subjects.find((s) => s.id === topic.subjectId)?.name ?? topic.subjectId)
      : undefined,
    chapter: chapter || undefined,
  };
}
