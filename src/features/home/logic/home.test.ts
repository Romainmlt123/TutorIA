import { quotes } from '@/data/mock/quotes';

import { currentLesson, goalProgress, quoteOfTheDay, subjectMastery } from './home';

describe('accueil', () => {
  it('change de citation chaque jour et boucle sur la liste', () => {
    const first = quoteOfTheDay(quotes, new Date(2026, 0, 1));
    const second = quoteOfTheDay(quotes, new Date(2026, 0, 2));
    const week = quoteOfTheDay(quotes, new Date(2026, 0, 8));
    expect(first).toEqual(quotes[0]);
    expect(second).toEqual(quotes[1]);
    expect(week).toEqual(first);
  });

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
