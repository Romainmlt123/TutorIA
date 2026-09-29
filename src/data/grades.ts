import type { Grade } from './types';

/** Classes du CP à la Terminale, dans l'ordre (GradePicker, L5, O1). */
export const GRADES: readonly Grade[] = [
  'CP',
  'CE1',
  'CE2',
  'CM1',
  'CM2',
  '6e',
  '5e',
  '4e',
  '3e',
  '2de',
  '1re',
  'Tle',
];

export type GradeGroup = 'primary' | 'middle' | 'high';

/** Regroupement de O1 : Primaire, Collège, Lycée. */
export const GRADE_GROUPS: readonly { id: GradeGroup; grades: readonly Grade[] }[] = [
  { id: 'primary', grades: ['CP', 'CE1', 'CE2', 'CM1', 'CM2'] },
  { id: 'middle', grades: ['6e', '5e', '4e', '3e'] },
  { id: 'high', grades: ['2de', '1re', 'Tle'] },
];

export function isGrade(value: unknown): value is Grade {
  return typeof value === 'string' && (GRADES as readonly string[]).includes(value);
}
