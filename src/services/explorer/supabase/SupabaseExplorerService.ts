import type { LevelRecord } from '@/features/explorer/logic/progression';

import type { ExplorerService } from '../ExplorerService';

/**
 * Progression lue en base. La table `level_progress` arrive avec la migration d'Explorer (étape 12
 * du plan) : d'ici là, aucun niveau n'est encore enregistré et l'élève part de zéro.
 */
export class SupabaseExplorerService implements ExplorerService {
  async levelRecords(): Promise<readonly LevelRecord[]> {
    return [];
  }
}
