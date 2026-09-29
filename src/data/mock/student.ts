import type { StudentProfile } from '../types';

/** Persona de démonstration : Léa, en 4e (design/README.md). */
export const student: StudentProfile = {
  firstName: 'Léa',
  grade: '4e',
  streakDays: 12,
  recordStreakDays: 15,
  level: 7,
  xp: 340,
  xpForNextLevel: 500,
  unreadNotifications: 2,
  dailyGoal: { minutes: 15, sessionsDone: 2, sessionsTarget: 3 },
  resume: {
    subjectId: 'maths',
    chapterId: 'maths-equations',
    lesson: 3,
    lessonCount: 5,
    lessonTitle: 'isoler x',
    chapterProgress: 0.6,
  },
};
