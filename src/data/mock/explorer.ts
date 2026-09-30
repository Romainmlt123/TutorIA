import type { LevelRecord } from '@/features/explorer/logic/progression';

/**
 * Progression de démonstration de Léa dans Explorer (maquette X1) : les deux premiers niveaux
 * de la ville des Équations sont terminés, la prochaine étape est la leçon « Isoler x ».
 */
export const demoLevelRecords: readonly LevelRecord[] = [
  {
    levelId: 'maths-equations.qu-est-ce-qu-une-equation',
    finished: true,
    bestScore: 1,
    stars: 3,
    attempts: 1,
    lastPlayedAt: '2026-09-28T17:30:00Z',
  },
  {
    levelId: 'maths-equations.tester-une-solution',
    finished: true,
    bestScore: 0.8,
    stars: 2,
    attempts: 2,
    lastPlayedAt: '2026-09-29T18:10:00Z',
  },
];
