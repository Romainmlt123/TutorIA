import { config } from '@/lib/config';

import type { ExplorerService } from './ExplorerService';
import { MockExplorerService } from './mock/MockExplorerService';
import { SupabaseExplorerService } from './supabase/SupabaseExplorerService';

export type { ExplorerService } from './ExplorerService';

export const explorerService: ExplorerService =
  config.backend === 'supabase' ? new SupabaseExplorerService() : new MockExplorerService();
