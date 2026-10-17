import {
  currentLesson,
  firstChapterId,
  goalProgress,
  isFreshSubject,
  subjectMastery,
} from './home';

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

describe('premier jour (J1)', () => {
  it('commence par la matière la moins à l’aise de l’auto-évaluation', () => {
    expect(firstChapterId({ maths: 'confident', francais: 'struggling' })).toBe(
      'fr-participe-passe',
    );
  });

  it('commence par les équations sans auto-évaluation', () => {
    expect(firstChapterId(undefined)).toBe('maths-equations');
    expect(firstChapterId({})).toBe('maths-equations');
  });

  it('garde « À découvrir » tant qu’aucun chapitre de la matière n’a eu de séance', () => {
    const chapters = [
      { subjectId: 'maths', sessions: 2 },
      { subjectId: 'francais', sessions: 0 },
    ];
    expect(isFreshSubject(chapters, 'maths')).toBe(false);
    expect(isFreshSubject(chapters, 'francais')).toBe(true);
    expect(isFreshSubject(chapters, 'svt')).toBe(true);
  });
});
