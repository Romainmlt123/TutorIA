import { demoLevelRecords } from '@/data/mock/explorer';
import type { LevelRecord } from '@/features/explorer/logic/progression';

import type { ExplorerService } from '../ExplorerService';

/** Progression simulée de Léa (maquette X1) : l'app hors ligne et les tests. */
export class MockExplorerService implements ExplorerService {
  async levelRecords(): Promise<readonly LevelRecord[]> {
    return demoLevelRecords;
  }
}
