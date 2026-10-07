import { demoConversation } from '@/data/mock/tutorConversation';
import { config } from '@/lib/config';

import { getSupabase } from '../supabase/client';
import type { ConversationService } from './ConversationService';
import { MockConversationService } from './mock/MockConversationService';
import { SupabaseConversationService } from './supabase/SupabaseConversationService';

export type * from './ConversationService';

/** Version simulée, remplie par le tuteur simulé (null avec Supabase). */
export const mockConversationService: MockConversationService | null =
  config.backend === 'supabase' ? null : new MockConversationService([demoConversation]);

export const conversationService: ConversationService =
  mockConversationService ?? new SupabaseConversationService(getSupabase());
