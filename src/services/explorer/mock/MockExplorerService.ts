import { demoLevelRecords } from '@/data/mock/explorer';
import type { LevelRecord } from '@/features/explorer/logic/progression';

import type { ExplorerService } from '../ExplorerService';

/**
 * Progression simulée de Léa (maquette X1) : l'app hors ligne et les tests. Elle part toujours de la
 * démonstration ; les outils de développement peuvent la faire avancer, en mémoire seulement.
 */
export class MockExplorerService implements ExplorerService {
  private records: LevelRecord[] = [...demoLevelRecords];

  async levelRecords(): Promise<readonly LevelRecord[]> {
    return this.records;
  }

  /** Développement : termine un niveau avec trois étoiles, comme si l'élève venait de le jouer. */
  finishLevel(levelId: string): void {
    const previous = this.records.find((r) => r.levelId === levelId);
    const record: LevelRecord = {
      levelId,
      finished: true,
      bestScore: 1,
      stars: 3,
      attempts: (previous?.attempts ?? 0) + 1,
      lastPlayedAt: new Date().toISOString(),
    };
    this.records = [...this.records.filter((r) => r.levelId !== levelId), record];
  }

  /** Développement : revient à la progression de démonstration. */
  reset(): void {
    this.records = [...demoLevelRecords];
  }
}
