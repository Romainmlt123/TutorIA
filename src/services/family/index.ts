import { config } from '@/lib/config';

import { authService } from '../auth';
import { getSupabase } from '../supabase/client';
import type { FamilyService } from './FamilyService';
import { MockFamilyService } from './mock/MockFamilyService';
import { SupabaseFamilyService } from './supabase/SupabaseFamilyService';

export type { FamilyService, LinkedChild, LinkedParent, LinkRequest } from './FamilyService';

/** Version simulée, pour les outils de développement (null avec Supabase). */
export const mockFamilyService: MockFamilyService | null =
  config.backend === 'supabase' ? null : new MockFamilyService(authService);

export const familyService: FamilyService =
  mockFamilyService ?? new SupabaseFamilyService(getSupabase(), authService);
