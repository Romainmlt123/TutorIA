import { config } from '@/lib/config';

import { getSupabase } from '../supabase/client';
import { MockStudentDataService } from './mock/MockStudentDataService';
import type { StudentDataService } from './StudentDataService';
import { SupabaseStudentDataService } from './supabase/SupabaseStudentDataService';

export type * from './StudentDataService';

export const studentDataService: StudentDataService =
  config.backend === 'supabase'
    ? new SupabaseStudentDataService(getSupabase())
    : new MockStudentDataService();
