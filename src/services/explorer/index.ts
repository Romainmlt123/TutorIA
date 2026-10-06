import { config } from '@/lib/config';

import type { ExplorerService } from './ExplorerService';
import { MockExplorerService } from './mock/MockExplorerService';
import { SupabaseExplorerService } from './supabase/SupabaseExplorerService';

export type { ExplorerService } from './ExplorerService';

/** Version simulée, pour les outils de développement (null avec Supabase). */
export const mockExplorerService: MockExplorerService | null =
  config.backend === 'supabase' ? null : new MockExplorerService();

export const explorerService: ExplorerService =
  mockExplorerService ?? new SupabaseExplorerService();
