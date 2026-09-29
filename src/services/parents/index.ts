import { config } from '@/lib/config';

import { authService } from '../auth';
import { getSupabase } from '../supabase/client';
import { MockParentService } from './mock/MockParentService';
import type { ParentService } from './ParentService';
import { SupabaseParentService } from './supabase/SupabaseParentService';

export type * from './ParentService';

export const parentService: ParentService =
  config.backend === 'supabase'
    ? new SupabaseParentService(getSupabase(), authService)
    : new MockParentService();
