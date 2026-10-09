import { config } from '@/lib/config';

import { mockConversationService } from '../conversations';
import { mockExplorerService } from '../explorer';

import { createLiveTutorService } from './live/LiveTutorService';
import { createMockTutorService } from './mock/MockTutorService';
import type { TutorService } from './TutorService';

// Tout simulé : les niveaux joués font avancer la progression simulée d'Explorer.
const recordLevel = mockExplorerService
  ? mockExplorerService.recordOutcome.bind(mockExplorerService)
  : undefined;

/** Tuteur utilisé par l'app : réel par défaut, simulé avec EXPO_PUBLIC_TUTOR_MODE=mock. */
export const tutorService: TutorService =
  config.tutorMode === 'mock'
    ? createMockTutorService({ recordLevel, conversations: mockConversationService ?? undefined })
    : createLiveTutorService();

/** Tuteur simulé, utilisé aussi en mode hors ligne et quand le vocal en direct est indisponible. */
export const mockTutorService: TutorService = createMockTutorService();

export type { TutorService, VoiceCaption, VoiceSession } from './TutorService';
export type { ChatTurn, TutorErrorCode, TutorStreamEvent, TutorTopic } from './api-contract';
export { TUTOR_LIMITS } from './api-contract';
export { VoiceSessionError, type VoiceErrorCode } from './live/realtimeVoice';
