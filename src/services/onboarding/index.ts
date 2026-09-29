import { authService, mockAuthService } from '../auth';
import { getSupabase } from '../supabase/client';
import { MockOnboardingService } from './mock/MockOnboardingService';
import type { OnboardingService } from './OnboardingService';
import { SupabaseOnboardingService } from './supabase/SupabaseOnboardingService';

export type { OnboardingService } from './OnboardingService';

export const onboardingService: OnboardingService = mockAuthService
  ? new MockOnboardingService(mockAuthService)
  : new SupabaseOnboardingService(getSupabase(), authService);
