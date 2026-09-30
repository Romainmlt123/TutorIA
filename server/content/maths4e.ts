import referentiel from './maths-4e-2020/referentiel.json';
import { MATHS_4E_BANK } from './maths-4e-2020/bank';

/*
 * Référentiel de Maths de 4e (programme 2020) côté serveur : capacités, attendus et exercices
 * corrigés de chaque niveau d'Explorer. Il ne part jamais dans l'app (règle ESLint sur server/) :
 * l'app n'a que la structure de l'île (src/features/explorer/content/maths-4e-2020.ts).
 */

export type Exercise = (typeof referentiel.exercices)[number];
export type Chapter = (typeof referentiel.chapitres)[number];

const chapters = new Map(referentiel.chapitres.map((c) => [c.id, c]));
const exercises = new Map(referentiel.exercices.map((e) => [e.id, e]));
const attendus = new Map(referentiel.attendus.map((a) => [a.id, a]));

/** Un exercice encore en brouillon n'est jamais proposé à un élève. */
export function isUsable(exercise: Exercise): boolean {
  return exercise.statut_validation !== 'brouillon';
}

export function chapterByRef(ref: string): Chapter | undefined {
  return chapters.get(ref);
}

/** Chapitre d'un niveau (`maths-equations.isoler-x` → M4-C06), d'après la banque. */
export function chapterOfLevel(levelId: string): Chapter | undefined {
  const entry = MATHS_4E_BANK[levelId];
  return entry ? chapters.get(entry.ref) : undefined;
}

/** Capacités travaillées par un niveau, en toutes lettres. */
export function capacitesOfLevel(levelId: string): string[] {
  const entry = MATHS_4E_BANK[levelId];
  const chapter = entry ? chapters.get(entry.ref) : undefined;
  if (!entry || !chapter) return [];
  return entry.capacites.flatMap((i) => chapter.capacites[i] ?? []);
}

/** Attendus de fin d'année du chapitre d'un niveau (résumés reformulés du référentiel). */
export function attendusOfLevel(levelId: string): string[] {
  const chapter = chapterOfLevel(levelId);
  return (chapter?.attendus ?? []).flatMap((id) => attendus.get(id)?.resume ?? []);
}

/** Exercices corrigés d'un niveau, du plus facile au plus difficile, sans les brouillons. */
export function exercisesOfLevel(levelId: string): Exercise[] {
  const entry = MATHS_4E_BANK[levelId];
  if (!entry) return [];
  return entry.exercises
    .flatMap((id) => exercises.get(id) ?? [])
    .filter(isUsable)
    .sort((a, b) => a.difficulte - b.difficulte);
}
