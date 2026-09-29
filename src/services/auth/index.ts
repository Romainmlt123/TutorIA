import { config } from '@/lib/config';

import { getSupabase } from '../supabase/client';
import type { AuthService } from './AuthService';
import { MockAuthService } from './mock/MockAuthService';
import { SupabaseAuthService } from './supabase/SupabaseAuthService';

export type { Account, AuthService, ParentAccount, Session, StudentAccount } from './AuthService';
export { AuthError } from './AuthService';

/** Comptes simulés (mode `mock`), exposés pour le changement de persona en développement. */
export const mockAuthService: MockAuthService | null =
  config.backend === 'mock' ? new MockAuthService() : null;

/** Point d'entrée des écrans : Supabase si le projet est configuré, sinon la version simulée. */
export const authService: AuthService = mockAuthService ?? new SupabaseAuthService(getSupabase());
