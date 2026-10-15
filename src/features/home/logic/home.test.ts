import { currentLesson, goalProgress, subjectMastery } from './home';

describe('accueil', () => {
  it('calcule la part de l’objectif du jour', () => {
    expect(goalProgress(2, 3)).toBeCloseTo(2 / 3);
    expect(goalProgress(4, 3)).toBe(1);
    expect(goalProgress(0, 0)).toBe(0);
  });
});

describe('progression de l’accueil', () => {
  it('avance d’une leçon par séance, cinq au plus', () => {
    expect(currentLesson(0)).toBe(1);
    expect(currentLesson(2)).toBe(3);
    expect(currentLesson(9)).toBe(5);
  });

  it('calcule la maîtrise d’une matière sur les chapitres travaillés', () => {
    const chapters = [
      { subjectId: 'maths', mastery: 0.8, sessions: 2 },
      { subjectId: 'maths', mastery: 0.6, sessions: 1 },
      { subjectId: 'maths', mastery: null, sessions: 0 },
      { subjectId: 'svt', mastery: 0.2, sessions: 1 },
    ];
    expect(subjectMastery(chapters, 'maths')).toBeCloseTo(0.7);
    expect(subjectMastery(chapters, 'anglais')).toBe(0);
  });
});
