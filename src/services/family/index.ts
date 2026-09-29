import { config } from '@/lib/config';

import { authService } from '../auth';
import { getSupabase } from '../supabase/client';
import type { FamilyService } from './FamilyService';
import { MockFamilyService } from './mock/MockFamilyService';
import { SupabaseFamilyService } from './supabase/SupabaseFamilyService';

export type { FamilyService, LinkedChild, LinkedParent, LinkRequest } from './FamilyService';

export const familyService: FamilyService =
  config.backend === 'supabase'
    ? new SupabaseFamilyService(getSupabase(), authService)
    : new MockFamilyService(authService);
