import { config } from '@/lib/config';

import { getSupabase } from '../supabase/client';
import { MockStudentDataService } from './mock/MockStudentDataService';
import type { StudentDataService } from './StudentDataService';
import { SupabaseStudentDataService } from './supabase/SupabaseStudentDataService';

export type * from './StudentDataService';

/** Version simulée, pour les outils de développement (null avec Supabase). */
export const mockStudentDataService: MockStudentDataService | null =
  config.backend === 'supabase' ? null : new MockStudentDataService();

export const studentDataService: StudentDataService =
  mockStudentDataService ?? new SupabaseStudentDataService(getSupabase());
