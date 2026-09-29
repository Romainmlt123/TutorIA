import { subjectProgressGradient } from './extras';
import { subjects } from './tokens.generated';

export type SubjectKey = keyof typeof subjects;

/**
 * Couleurs d'une matière, avec les dérivés relevés sur les maquettes :
 * - `tile` : tuile et liseré (1er arrêt du dégradé → encre), ex. #E95555 → #C21A1A pour les Maths ;
 * - `pillInk` : texte des pastilles sur fond doux (dernier arrêt du dégradé), ex. « Leçon 3/5 » ;
 * - `progress` : barre de la progression par matière (04-Stats).
 */
export function subjectTheme(id: SubjectKey) {
  const subject = subjects[id];
  const stops = subject.gradient.colors;
  return {
    ...subject,
    tile: [stops[0], subject.ink] as const,
    pillInk: stops[stops.length - 1] ?? subject.ink,
    progress: subjectProgressGradient[id],
  };
}

export type SubjectTheme = ReturnType<typeof subjectTheme>;
